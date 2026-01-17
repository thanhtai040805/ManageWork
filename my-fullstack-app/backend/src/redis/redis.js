const Redis = require("ioredis");

const redisConfig = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,

  enableReadyCheck: true,
  maxRetriesPerRequest: 3,

  retryStrategy(times) {
    return Math.min(times * 50, 2000);
  },
};

const pub = new Redis(redisConfig);
const sub = new Redis(redisConfig);
const redis = new Redis(redisConfig);

pub.on("connect", () => console.log("🟢 Redis PUB connected"));
sub.on("connect", () => console.log("🟢 Redis SUB connected"));
redis.on("connect", () => console.log("🟢 Redis connected"));

pub.on("error", console.error);
sub.on("error", console.error);
redis.on("error", console.error);

module.exports = { pub, sub, redis };
