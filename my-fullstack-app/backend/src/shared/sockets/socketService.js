const chatService = require("../../modules/chat/chat.service");
const { redis, pub} = require('../redis/redis')

const sendMessage = async (io, socket, data) => {
    const { roomId, content, parentMessageId, attachments = [], messageType = "text" } = data;
    console.log("sendMessage called with data:", socket.user.uid);
    const isMember = await chatService.isMemberOfChatRoom({
        roomId,
        userId: socket.user.uid
    });
    if (!isMember) return;
    const senderId = socket.user.uid
    // Allow empty content if attachments exist (media-only messages)
    if(!roomId || (!content?.trim() && attachments.length === 0)) return;
    try {
        const message = await chatService.sendMessage({
          roomId,
          senderId,
          content: content?.trim() || "",
          messageType,
          attachments,
          parentMessageId
        });

        // Emit locally first (for single server)
        io.to(roomId).emit("message:new", { roomId, message });

        // Publish to Redis for horizontal scaling (other servers)
        if (pub) {
            await pub.publish("chat_messages", JSON.stringify({
                type: "new_message",
                roomId,
                message
            }));
        }

        return message
    } catch (error) {
        socket.emit("message:error", {
            action: "send",
            code: "SEND_FAILED",
        });
    }
}

const typing = async (io, socket, { roomId }) => {
  if (!redis) return;

  const userId = socket.user.uid;
  const userName = socket.user.username;
  if (!roomId) return;

  const isMember = await chatService.isMemberOfChatRoom({
    roomId,
    userId,
  });
  if (!isMember) return;

  const key = `typing_${roomId}:${userId}`;

  const exists = await redis.exists(key);
  if (exists) return;

  await redis.set(key, 1, "EX", 2);
  await pub.publish(
    "typing",
    JSON.stringify({
      roomId,
      userId,
      userName
    })
  );
};

const getMessages = async (io, socket, payload) => {
    const {
        roomId,
        limit = 30,
        cursorCreatedAt,
        cursorMessageId,
    } = payload;

    const isMember = await chatService.isMemberOfChatRoom({
        roomId,
        userId: socket.user.uid
    });
    if (!isMember) return;

    try {
        let messages;

        if (!cursorCreatedAt || !cursorMessageId) {
            messages = await chatService.firsTimeGetMessages({ roomId, limit});
        } else {
            messages = await chatService.getMessagesByCursor({
                roomId,
                cursorCreatedAt,
                cursorMessageId,
                limit
            });
        }

        socket.emit("message:list", { roomId, messages });
    } catch (error) {
        socket.emit('error', {
            msg: "Cannot get messages",
            action: "getMessages"
        });
    }
}


const disconnect = (socket) => {
    console.log('Client disconnected:', socket.id)
}

const editMessage = async (io , socket, payload) => {
    const userId = socket.user.uid;
    const { messageId, newContent, roomId } = payload;

    const isMember = await chatService.isMemberOfChatRoom({
        roomId,
        userId: socket.user.uid
    });
    if (!isMember) return;

    try {
        await chatService.updateMessageContent({
          messageId,
          newContent,
          senderId: socket.user.uid,
        });

        const fullUpdatedMessage = await require("../../modules/chat/models/message.model").getFullMessage(messageId);
        io.to(roomId).emit("message:update", { roomId, newMessage: fullUpdatedMessage });
    } catch (error) {
        socket.emit('error', {
            msg: "Cannot edit message",
            action: "editMessage"
        })
    }
}

const deleteMessage = async (io, socket, payload) => {
    const { messageId,  roomId } = payload;

    const isMember = await chatService.isMemberOfChatRoom({
        roomId,
        userId: socket.user.uid
    });
    if (!isMember) return;

    try {
        await chatService.softDeleteMessage(messageId, socket.user.uid);
        io.to(roomId).emit("message:delete", { roomId, messageId });
    }
    catch (error) {
        socket.emit('error', {
            msg: "Cannot delete message",
            action: "deleteMessage"
        })
    }
}

const openRoom = async (io, socket, payload) => {
    const { roomId } = payload;

    const isMember = await chatService.isMemberOfChatRoom({
        roomId,
        userId: socket.user.uid
    });
    if (!isMember) return;

    const lastMessageId = await chatService.getLastMessageId(roomId);

    await chatService.markMessagesAsRead({
        roomId,
        userId: socket.user.uid,
        messagesId: lastMessageId
    });

    socket.to(roomId).emit("room:read", {
      roomId,
      userId: socket.user.uid,
      lastMessageId,
    });
}

const toggleReaction = async (io, socket, payload) => {
    const { messageId, roomId, reactionType } = payload;
    const userId = socket.user.uid;

    if (!roomId) return socket.emit("error", { msg: "roomId is required" });

    const isMember = await chatService.isMemberOfChatRoom({ roomId, userId });
    if (!isMember) return;

    try {
        await chatService.toggleReaction({ messageId, userId, reactionType });
        
        // Fetch full updated reactions for this message
        const allReactions = await require("../../modules/chat/models/messageReaction.model").getByMessage(messageId);
        
        io.to(roomId).emit("message:reaction:update", { roomId, messageId, reactions: allReactions });
    } catch (error) {
        console.error("toggleReaction error:", error);
        socket.emit("error", { msg: "Cannot toggle reaction" });
    }
}

const togglePin = async (io, socket, payload) => {
    const { messageId, roomId, isPinned } = payload;
    const userId = socket.user.uid;

    if (!roomId) return socket.emit("error", { msg: "roomId is required" });

    const role = await chatService.getMemberRole({ roomId, userId });
    if (role !== 'admin') {
        return socket.emit("error", { msg: "Only admins can pin messages" });
    }

    try {
        await chatService.togglePinMessage(messageId, isPinned);
        // Include roomId so the frontend knows which room's store to update
        io.to(roomId).emit("message:pin:update", { roomId, messageId, isPinned });
    } catch (error) {
        console.error("togglePin error:", error);
        socket.emit("error", { msg: "Cannot toggle pin" });
    }
}

const updateRoom = async (io, socket, payload) => {
    const { roomId, updateData } = payload;
    const userId = socket.user.uid;

    const role = await chatService.getMemberRole({ roomId, userId });
    if (role !== 'admin') {
        return socket.emit("error", { msg: "Only admins can update room info" });
    }

    try {
        const updatedRoom = await chatService.updateChatRoom(roomId, updateData);
        io.to(roomId).emit("room:update", updatedRoom);
    } catch (error) {
        socket.emit("error", { msg: "Cannot update room" });
    }
}

module.exports = {
  sendMessage,
  typing,
  disconnect,
  getMessages,
  editMessage,
  deleteMessage,
  openRoom,
  toggleReaction,
  togglePin,
  updateRoom
};
