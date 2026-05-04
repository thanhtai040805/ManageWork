const { redis } = require("../redis/redis");

const TASK_CACHE_PREFIX = "task:cache";
const TASK_CACHE_TTL = 300;

const getKey = (projectId) => `${TASK_CACHE_PREFIX}:${projectId}`;

const TaskCacheService = {
  async getProjectTasks(projectId) {
    if (!redis) return null;
    try {
      const cached = await redis.get(getKey(projectId));
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("Redis cache get error:", error.message);
      return null;
    }
  },

  async setProjectTasks(projectId, tasks) {
    if (!redis) return;
    try {
      await redis.setex(getKey(projectId), TASK_CACHE_TTL, JSON.stringify(tasks));
    } catch (error) {
      console.error("Redis cache set error:", error.message);
    }
  },

  async invalidateProject(projectId) {
    if (!redis) return;
    try {
      await redis.del(getKey(projectId));
    } catch (error) {
      console.error("Redis cache invalidate error:", error.message);
    }
  },

  async invalidateUserTasks(userId) {
    if (!redis) return;
    try {
      const keys = [];
      for await (const key of redis.scanIter(`${TASK_CACHE_PREFIX}:*`)) {
        keys.push(key);
      }
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error("Redis cache invalidate error:", error.message);
    }
  },

  async getUserTasks(userId) {
    if (!redis) return null;
    try {
      const cached = await redis.get(`user:${userId}:tasks`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("Redis user cache get error:", error.message);
      return null;
    }
  },

  async setUserTasks(userId, tasks) {
    if (!redis) return;
    try {
      await redis.setex(`user:${userId}:tasks`, TASK_CACHE_TTL, JSON.stringify(tasks));
    } catch (error) {
      console.error("Redis user cache set error:", error.message);
    }
  },

  async invalidateUserTaskCache(userId) {
    if (!redis) return;
    try {
      await redis.del(`user:${userId}:tasks`);
    } catch (error) {
      console.error("Redis user cache invalidate error:", error.message);
    }
  },
};

module.exports = TaskCacheService;