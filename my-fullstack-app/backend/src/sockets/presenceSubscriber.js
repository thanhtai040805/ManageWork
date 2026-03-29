const { sub, redis } = require("../redis/redis");

// 🔥 in-memory cache
const friendCache = new Map();

const getFriends = async (userId) => {
  // ✅ có cache rồi
  if (friendCache.has(userId)) {
    return friendCache.get(userId);
  }

  // ❗ chưa có → lấy từ Redis
  const friends = await redis.smembers(`user:${userId}:friends`);

  // cache lại
  friendCache.set(userId, friends);

  return friends;
};

const initRealtimeSubscriber = (io) => {
  if (!sub) return;

  sub.subscribe("presence", "typing");

  sub.on("message", async (channel, message) => {
    try {
      const data = JSON.parse(message);

      if (channel === "presence") {
        const { type, userId, lastSeen } = data;

        const friends = await getFriends(userId);

        for (const friendId of friends) {
          io.to(`user:${friendId}`).emit(`user:${type}`, {
            userId,
            lastSeen: lastSeen || null,
          });
        }
      }

      if (channel === "typing") {
        const { roomId, userId } = data;

        io.to(roomId).emit("room:typing", {
          roomId,
          userId,
        });
      }

    } catch (err) {
      console.error("Subscriber error:", err);
    }
  });
};

module.exports = initRealtimeSubscriber;