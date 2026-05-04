const chatRoomService = require('../../modules/chat/chat.service');
const projectModel = require('../../modules/projects/project.model');
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

      // Cache friends only if user has friends - avoid unnecessary DB calls
      let friends = await chatRoomService.getFriends({ userId });
      if (friends.length > 0) {
        // Clear existing and add fresh - only if we have friends
        await redis.del(`user:${userId}:friends`);
        await redis.sadd(`user:${userId}:friends`, ...friends);
        await redis.expire(`user:${userId}:friends`, 3600);
      }

      // Check user already online - notify others if new login
      const isOnline = await redis.sismember("online_users", userId);
      console.log(`[Login] isOnline check for ${userId}: ${isOnline}`);
      
      // Always ensure user is in online_users set
      const saddResult = await redis.sadd("online_users", userId);
      const members = await redis.smembers("online_users");
      console.log(`[Login] sadd result: ${saddResult}, all members: ${JSON.stringify(members)}`);
      
      // Clean up stale lastSeen when coming online
      const delResult = await redis.del(`user:${userId}:lastSeen`);
      console.log(`[Login] del lastSeen result: ${delResult}`);
      
      // Only publish "online" if they weren't already marked online
      if (!isOnline) {
        await pub.publish(
          "presence",
          JSON.stringify({
            type: "online",
            userId,
          })
        );
        console.log(`[Presence] User ${userId} came online (new)`);
      } else {
        console.log(`[Presence] User ${userId} reconnected (already online)`);
      }

      console.log(`User ${userId} connected`);
      
      // Join private user room for presence notifications
      socket.join(`user:${userId}`);

      // join tất cả room chat
      const rooms = await chatRoomService.getChatRoomsByUser(userId);
      rooms.forEach((room) => {
        socket.join(room.room_id);
      });

      // Join project channels for real-time task updates
      const projects = await projectModel.getUserProjects(userId);
      console.log(`[SocketInit] User ${userId} has ${projects.length} projects`);
      projects.forEach((project) => {
        console.log(`[SocketInit] Joining project channel: project:${project.project_id}`);
        socket.join(`project:${project.project_id}`);
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

  socket.on("disconnect", (reason) => {
    console.log(`[Disconnect] Event fired for ${userId}, reason: ${reason}`);
    
    (async () => {
      try {
        if (!redis) return;

        console.log(`[Disconnect] Processing disconnect for ${userId}...`);

        // kiểm tra còn device khác không
        const sockets = await io.in(`user:${userId}`).fetchSockets();
        console.log(`[Disconnect] Found ${sockets.length} socket(s) for user ${userId}`);
        
        const otherSockets = sockets.filter(s => s.id !== socket.id);
        if (otherSockets.length > 0) {
          console.log(`[Disconnect] User ${userId} still has ${otherSockets.length} other sessions, skipping offline`);
          return;
        }

        console.log(`[Disconnect] No other sessions, removing ${userId} from online_users...`);

        // Remove from online_users set
        const remResult = await redis.srem("online_users", userId);
        console.log(`[Presence] Removed ${userId} from online_users, result: ${remResult}`);

        // Set lastSeen
        const lastSeen = Date.now();
        await redis.set(`user:${userId}:lastSeen`, lastSeen);
        console.log(`[Presence] Set lastSeen for ${userId}: ${lastSeen}`);

        // Publish offline presence
        await pub.publish(
          "presence",
          JSON.stringify({
            type: "offline",
            userId,
            lastSeen,
          })
        );

        console.log(`User ${userId} offline complete`);

      } catch (err) {
        console.error("Disconnect error:", err);
      }
    })();
  });
};