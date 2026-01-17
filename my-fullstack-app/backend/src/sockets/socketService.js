const chatRoomMemberService = require("../services/chatRoomMemberService");
const messageService = require('../services/messageService');
const chatRoomService = require('../services/chatRoomService')
const { redis} = require('../redis/redis')

const sendMessage = async (io, socket, data) => {
    const { roomId,  content} = data;

    const isMember = await chatRoomMemberService.isMember(
        roomId,
        socket.user.uid
    );
    if (!isMember) return;

    const senderId = socket.user.uid
    if(!roomId || !content) return;

    try {
        const message = await messageService.sendMessage({
          roomId,
          senderId,
          content,
          messageType: "text",
          attachments: [],
        });
        io.to(roomId).emit("message:new", message);
        return message
    } catch (error) {
        socket.emit("message:error", {
          action: "send",
          code: "SEND_FAILED",
        });
    }
}

const typing = async (io , socket , { roomId }) => {
    const userId = socket.user.uid;
    if(!roomId) return;

    const isMember = await chatRoomMemberService.isMember(roomId, userId);
    if (!isMember) return;

    const key = `typing_${roomId}:${userId}`;

    const exists = await redis.exists(key);
    if (exists) return;

    await redis.set(key, 1 ,"EX", 2);

    socket.to(roomId).emit("room:typing", {
      roomId,
      userId,
    });
}

const getMessages = async (io, socket, payload) => {
    const {
        roomId,
        limit = 30,
        cursorCreatedAt,
        cursorMessageId,
    } = payload;

    const isMember = await chatRoomMemberService.isMember(
        roomId,
        socket.user.uid
    );
    if (!isMember) return;

    try {
        let messages;

        if (!cursorCreatedAt || !cursorMessageId) {
            messages = await messageService.firsTimeGetMessages({ roomId, limit});
        } else {
            messages = await messageService.getMessagesByCursor({
                roomId,
                cursorCreatedAt,
                cursorMessageId,
                limit
            });
        }

        socket.emit("message:list", { roomId, messages });
    } catch (error) {
        socket.emit('error', {
            msg: "Cannor get messages",
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

    const isMember = await chatRoomMemberService.isMember(
        roomId,
        socket.user.uid
    );
    if (!isMember) return;

    try {
        const updateMessage = await messageService.updateMessageContent({
          messageId,
          newContent,
          userId,
        });
        io.to(roomId).emit("message:update", updateMessage);
    } catch (error) {
        socket.emit('error', {
            msg: "Cannot edit message",
            action: "editMessage"
        })
    }
}

const deleteMessage = async (io, socket, payload) => {
    const { messageId,  roomId } = payload;

    const isMember = await chatRoomMemberService.isMember(
        roomId,
        socket.user.uid
    );
    if (!isMember) return;

    try {
        await messageService.softDeleteMessage(messageId, socket.user.uid);
        io.to(roomId).emit("message:delete", { messageId });
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

    const isMember = await chatRoomMemberService.isMember(
      roomId,
      socket.user.uid
    );
    if (!isMember) return;

    const lastMessageId = await chatRoomService.getLastMessageId(roomId);

    await chatRoomMemberService.markMessagesAsRead(roomId ,socket.user.uid ,lastMessageId);

    socket.to(roomId).emit("room:read", {
      roomId,
      userId: socket.user.uid,
      lastMessageId,
    });
}

module.exports = {
  sendMessage,
  typing,
  disconnect,
  getMessages,
  editMessage,
  deleteMessage,
  openRoom,
};