const chatRoomService = require('../../modules/chat/chat.service');
const {
  sendMessage,
  typing,
  getMessages,
  editMessage,
  deleteMessage,
  openRoom,
} = require("./socketService");

const { redis, pub } = require("../redis/redis");

module.exports = (io, socket) => {
  const userId = socket.user.uid;
  (async () => {
    try {
      if (!redis) return;

      // cache friends (always fresh)
      let friends = await chatRoomService.getFriends({ userId });
      if (friends.length > 0) {
        await redis.del(`user:${userId}:friends`);
        await redis.sadd(`user:${userId}:friends`, ...friends);
        await redis.expire(`user:${userId}:friends`, 3600);
      }

      // check user đã online chưa để gửi thông báo
      const isOnline = await redis.sismember("online_users", userId);
      if (!isOnline) {
        await redis.sadd("online_users", userId);
        
        // 🔥 publish thay vì emit
        await pub.publish(
          "presence",
          JSON.stringify({
            type: "online",
            userId,
          })
        );
      }

      console.log(`User ${userId} connected`);
      
      // Join private user room for presence notifications
      socket.join(`user:${userId}`);

      // join tất cả room chat
      const rooms = await chatRoomService.getChatRoomsByUser(userId);
      rooms.forEach((room) => {
        socket.join(room.room_id);
      });

      const onlineUsers = await redis.smembers("online_users");
      socket.emit("users:online:list", onlineUsers);

    } catch (error) {
      console.log("Socket init error:", error);
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

  socket.on("message:reaction:toggle", (payload) => require("./socketService").toggleReaction(io, socket, payload));
  socket.on("message:pin:toggle", (payload) => require("./socketService").togglePin(io, socket, payload));
  socket.on("room:update", (payload) => require("./socketService").updateRoom(io, socket, payload));

  socket.on("disconnect", async () => {
    try {
      if (!redis) return;

      // kiểm tra còn device khác không
      const sockets = await io.in(`user:${userId}`).fetchSockets();
      const otherSockets = sockets.filter(s => s.id !== socket.id);
      if (otherSockets.length > 0) {
        console.log(`User ${userId} still has ${otherSockets.length} other sessions`);
        return;
      }

      await redis.srem("online_users", userId);

      const lastSeen = Date.now();
      await redis.set(`user:${userId}:lastSeen`, lastSeen);

      // 🔥 publish thay vì emit
      await pub.publish(
        "presence",
        JSON.stringify({
          type: "offline",
          userId,
          lastSeen,
        })
      );

      console.log(`User ${userId} offline`);

    } catch (err) {
      console.error("Disconnect error:", err);
    }
  });
};