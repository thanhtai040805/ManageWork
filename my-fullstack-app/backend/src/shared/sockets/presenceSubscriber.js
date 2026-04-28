const { subRealtime, redis } = require("../redis/redis");

const friendCache = new Map();
const CACHE_TTL = 300000; // 5 minutes

const getFriends = async (userId) => {
  const cached = friendCache.get(userId);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return cached.friends;
  }

  // If Redis is disabled, we might not have friends in Redis
  if (!redis) return [];

  const friends = await redis.smembers(`user:${userId}:friends`);
  friendCache.set(userId, { friends, timestamp: Date.now() });

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