const { subRealtime, redis } = require("../redis/redis");

// 🔥 in-memory cache
const friendCache = new Map();

const getFriends = async (userId) => {
  if (friendCache.has(userId)) {
    return friendCache.get(userId);
  }

  const friends = await redis.smembers(`user:${userId}:friends`);

  friendCache.set(userId, friends);

  return friends;
};

let isInitialized = false;
const initRealtimeSubscriber = (io) => {
  if (isInitialized) return;
  isInitialized = true;
  if (!subRealtime) return;
  subRealtime.subscribe("presence", "typing");

  subRealtime.on("message", async (channel, message) => {
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
        const { roomId, userId, userName } = data;
        io.to(roomId).emit("room:typing", {
          roomId,
          userId,
          userName,
        });
      }

    } catch (err) {
      console.error("Subscriber error:", err);
    }
  });
};

module.exports = initRealtimeSubscriber;