const chatRoomModel = require("./models/chatRoom.model");
const chatRoomMemberModel = require("./models/chatRoomMember.model");
const messageModel = require("./models/message.model");
const messageAttachmentModel = require("./models/messageAttachment.model");
const messageReactionModel = require("./models/messageReaction.model");
const pool = require("../../shared/config/database");

const sendSystemMessage = async ({ roomId, content, senderId = null, client = pool }) => {
    // For system messages, we need to allow NULL sender_id or use a valid system user
    // Using NULL for system messages since there's no system user in the users table
    const query = `
      Insert into messages (room_id, sender_id, content, message_type, created_at) 
      VALUES ($1, $2, $3, 'system', NOW()) 
      RETURNING *
    `;
    const result = await client.query(query, [roomId, senderId, content]);
    return result.rows[0];
};

const createChatRoom = async ({ name, isGroup, createdBy, members = [], avatarUrl, description }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const chatRoom = await chatRoomModel.create({ name, isGroup, createdBy, avatarUrl, description }, client);
    
    // Add the creator as a admin of the chat room
    await chatRoomMemberModel.addMember(chatRoom.room_id, createdBy, "admin", client);
    
    // Add other members
    if (Array.isArray(members)) {
      for (const memberId of members) {
        if (memberId === createdBy) continue;
        await chatRoomMemberModel.addMember(chatRoom.room_id, memberId, "member", client);
      }
    }

    // System message
    await sendSystemMessage({ 
        roomId: chatRoom.room_id, 
        content: `Chat room "${name || 'New Room'}" created`,
        senderId: createdBy,
        client 
    });

    await client.query('COMMIT');
    return chatRoom;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("[createChatRoom] Service error:", error.message);
    throw error;
  } finally {
    client.release();
  }
};

const updateChatRoom = async (roomId, updateData) => {
    return await chatRoomModel.updateRoom(roomId, updateData);
}

const getChatRoomsByUser = async (userId) => {
  return await chatRoomModel.getRoomsByUser(userId);
};

const getChatRoomById = async (roomId) => {
  return await chatRoomModel.getRoomById(roomId);
};

const getLastMessageId = async (roomId) => {
  return await chatRoomModel.getLastMessageId(roomId);
};

const searchChatRoomsAndUsers = async (keyword, userId) => {
  return await chatRoomModel.searchChatRoomsAndUsers(keyword, userId);
};

const addMemberToChatRoom = async ({ roomId, memberId, role, requesterRole, addedBy }) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const member = await chatRoomMemberModel.addMember(roomId, memberId, role, client);
        if (member) {
            await sendSystemMessage({ 
                roomId, 
                content: `Member added to room`,
                senderId: addedBy || memberId,
                client 
            });
        }
        await client.query('COMMIT');
        return member;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const sendMessage = async ({roomId, senderId, content , messageType, attachments = [], parentMessageId = null}) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const message = await messageModel.create({roomId, senderId, content , messageType, parentMessageId}, client);
        
        if (attachments.length > 0) {
            await Promise.all(attachments.map(attr => 
                messageAttachmentModel.create(message.message_id, attr.attachmentUrl, attr.fileType, client)
            ))
        }
        
        await chatRoomModel.updateLastMessage(roomId, message.message_id, client);
        await chatRoomMemberModel.increaseUnreadCount(roomId, senderId, client);
        
        await client.query('COMMIT');
        
        // Fetch full message with sender info and parent info for immediate UI update
        return await messageModel.getFullMessage(message.message_id);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

const firsTimeGetMessages = async ({roomId, limit}) => {
    return await messageModel.firstTimeGetMessages({roomId, limit});
}

const getMessagesByCursor = async ({ roomId, cursorCreatedAt, cursorMessageId, limit }) => {
  return await messageModel.getMessagesByCursor({ roomId, cursorCreatedAt, cursorMessageId, limit });
};

const toggleReaction = async ({ messageId, userId, reactionType }) => {
    return await messageReactionModel.toggle({ messageId, userId, reactionType });
}

const togglePinMessage = async (messageId, isPinned) => {
    return await messageModel.togglePin(messageId, isPinned);
}

const getPinnedMessages = async (roomId) => {
    return await messageModel.getPinnedMessages(roomId);
}

const updateMessageContent = async ( {messageId, newContent , senderId}) => {
    const message = await messageModel.findById(messageId);
    if(!message || message.sender_id !== senderId) {
        throw new Error('Message not found or unauthorized');
    }
    return messageModel.updateContent({ messageId, newContent });
}

const softDeleteMessage = async (messageId, senderId) => {
  const message = await messageModel.findById(messageId);
  if (!message || message.sender_id !== senderId) {
    throw new Error("Message not found or unauthorized");
  }
  return messageModel.softDeleteMessage(messageId);
};

const searchMessages = async ({ roomId, query}) => {
  return await messageModel.searchMessages({ roomId, queryText: query});
}

const getMembersOfChatRoom = async(roomId) => {
    return await chatRoomMemberModel.getMembersByRoom(roomId);
}

const isMemberOfChatRoom = async ({roomId, userId}) => {
    return await chatRoomMemberModel.isMember(roomId, userId);
}

const leaveChatRoom = async ({roomId, userId}) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const success = await chatRoomMemberModel.leaveRoom(roomId, userId, client);
        if (success) {
            await sendSystemMessage({ 
                roomId, 
                content: `A member left the room`,
                senderId: userId,
                client 
            });
        }
        await client.query('COMMIT');
        return success;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const getMemberRole = async ({roomId, userId}) => {
    return await chatRoomMemberModel.getRole(roomId, userId);
}

const updateMemberRole = async ({roomId, userId, newRole}) => {
    return await chatRoomMemberModel.updateRole(roomId, userId, newRole);
}

const markMessagesAsRead = async ({roomId, userId, messagesId}) => {
    return await chatRoomMemberModel.markAsRead(roomId, userId, messagesId);
}

const getUnreadMessagesCount = async ({roomId, userId}) => {
    return await chatRoomMemberModel.getUnreadCount(roomId, userId);
}

const getFriends = async ({ userId }) => {
    return await chatRoomMemberModel.getMemberFriends(userId);
}

const togglePinChatRoom = async (roomId, isPinned) => {
    return await chatRoomModel.togglePin(roomId, isPinned);
}

module.exports = {
  createChatRoom,
  getChatRoomsByUser,
  getChatRoomById,
  getLastMessageId,
  searchChatRoomsAndUsers,
  addMemberToChatRoom,
  sendMessage,
  firsTimeGetMessages,
  getMessagesByCursor,
  updateMessageContent,
  softDeleteMessage,
  searchMessages,
  getMembersOfChatRoom,
  isMemberOfChatRoom,
  leaveChatRoom,
  getMemberRole,
  updateMemberRole,
  markMessagesAsRead,
  getUnreadMessagesCount,
  getFriends,
  toggleReaction,
  togglePinMessage,
  getPinnedMessages,
  updateChatRoom,
  togglePinChatRoom,
};
