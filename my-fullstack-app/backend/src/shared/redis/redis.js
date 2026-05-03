const Redis = require("ioredis");
const logger = require("../utils/logger");

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
let subRealtime = null;

if (isEnabled) {
  redis = new Redis(redisConfig);
  pub = new Redis(redisConfig);
  sub = new Redis(redisConfig);
  subRealtime = sub.duplicate();

  redis.on("connect", () => logger.info("Redis connected"));
  pub.on("connect", () => logger.info("Redis PUB connected"));
  sub.on("connect", () => logger.info("Redis SUB (adapter) connected"));
  subRealtime.on("connect", () => logger.info("Redis SUB REALTIME connected"));

  redis.on("error", (err) => logger.error("Redis error", { error: err.message }));
  pub.on("error", (err) => logger.error("Redis PUB error", { error: err.message }));
  sub.on("error", (err) => logger.error("Redis SUB error", { error: err.message }));
  subRealtime.on("error", (err) => logger.error("Redis SUB REALTIME error", { error: err.message }));
} else {
  logger.warn("Redis disabled");
}

module.exports = { redis, pub, sub, subRealtime };