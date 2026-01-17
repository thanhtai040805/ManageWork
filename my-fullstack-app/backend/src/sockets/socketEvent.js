const chatRoomService = require('../services/chatRoomService')
const {
  sendMessage,
  typing,
  getMessages,
  editMessage,
  deleteMessage,
  openRoom,
} = require("../sockets/socketService");

const { redis } = require("../redis/redis");

module.exports = (io, socket) => {

  const userId = socket.user.uid;

  (async () => {
    try {
      await redis.sadd(`user:${userId}:sockets`, socket.id)

      const socketCount = await redis.scard(`user:${userId}:sockets`)
      if(socketCount === 1){
        await redis.sadd("online_users",userId);
        socket.broadcast.emit("user:online", userId);
      }

      const rooms = await chatRoomService.getChatRoomsByUser(userId);
      rooms.forEach( room => {
        socket.join(room.roomId);
      })
    } catch (error) {
      console.log("Socket init error:", error)
    }
  })();

  socket.on("typing", (d) => typing(io, socket, d));
  socket.on("message:send", async (data, ack) => {
    try {
      const message = await sendMessage(io, socket, data);
      ack({ ok: true, message });
    } catch (err) {
      ack({ ok: false, error: err.message });
    }
  });

  socket.on("message:get", (d) => getMessages(io, socket, d));
  socket.on("message:edit", (d) => editMessage(io, socket, d));
  socket.on("message:delete", (d) => deleteMessage(io, socket, d));
  socket.on("room:open", (payload) => openRoom(io, socket, payload));

  socket.on("disconnect", async () => {
    await redis.srem(`user:${userId}:sockets`, socket.id);
    const remain = await redis.scard(`user:${userId}:sockets`)
    if(remain === 0) {
      await redis.srem("online_users", userId);
      socket.broadcast.emit("user:offline", userId);
    }
  });
};
