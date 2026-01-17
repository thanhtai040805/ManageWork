const messageModal = require('../models/message');
const chatRoomModel = require('../models/chatRoom');
const chatRoomMemberModel = require('../models/chatRoomMember');
const messageAttachmentModel = require('../models/messageAttachment');

const sendMessage = async ({roomId, senderId, content , messageType, attachments = []}) => {
    const message = await messageModal.create({roomId, senderId, content , messageType});
    //TODO: handle attachments
    if (attachments.length > 0) {
        await Promise.all(attachments.map(attr => 
            messageAttachmentModel.create(message.message_id, attr.attachmentUrl, attr.fileType)
        ))
    }
    // Update last_message_at in chat_rooms
    await chatRoomModel.updateLastMessage(roomId, message.message_id);
    //Increarse unread_count
    await chatRoomMemberModel.increaseUnreadCount(roomId, senderId)

    return message;
}



const firsTimeGetMessages = async ({roomId, limit}) => {
    const messages = await messageModal.firstTimeGetMessages({roomId, limit});
    return messages;
}

const getMessagesByCursor = async ({
  roomId,
  cursorCreatedAt,
  cursorMessageId,
  limit,
}) => {
  const messages = await messageModal.getMessagesByCursor({
    roomId,
    cursorCreatedAt,
    cursorMessageId,
    limit
  });

  return messages;
};

const updateMessageContent = async ( {messageId, newContent , senderId}) => {
    const message = await messageModal.findById(messageId);

    if(!message || message.sender_id !== senderId) {
        throw new Error('Message not found or unauthorized');
    }

    return messageModal.updateContent({ messageId, newContent });
}

const softDeleteMessage = async (messageId, senderId) => {
  const message = await messageModal.findById(messageId);

  if (!message || message.sender_id !== senderId) {
    throw new Error("Message not found or unauthorized");
  }

  return messageModal.softDeleteMessage(messageId);
};

const searchMessages = async ({ roomId, query}) => {
  const messages = await messageModal.searchMessages({ roomId, query})
}

module.exports = {
  sendMessage,
  firsTimeGetMessages,
  getMessagesByCursor,
  updateMessageContent,
  softDeleteMessage,
  searchMessages,
};

