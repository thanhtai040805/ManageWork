const Redis = require("ioredis");

const isEnabled = process.env.REDIS_ENABLED === "true";

const redisConfig = {
  host: process.env.REDIS_HOST || "redis",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    return Math.min(times * 50, 2000);
  },
};

let redis = null;
let pub = null;
let sub = null;

if (isEnabled) {
  redis = new Redis(redisConfig);
  pub = new Redis(redisConfig);
  sub = new Redis(redisConfig);

  redis.on("connect", () => console.log("🟢 Redis connected"));
  pub.on("connect", () => console.log("🟢 Redis PUB connected"));
  sub.on("connect", () => console.log("🟢 Redis SUB connected"));

  redis.on("error", (err) => console.error("Redis error:", err));
  pub.on("error", (err) => console.error("Redis PUB error:", err));
  sub.on("error", (err) => console.error("Redis SUB error:", err));
} else {
  console.log("⚠️ Redis disabled");
}

module.exports = { redis, pub, sub };