const { redis } = require("../redis/redis");

const TASK_ORDER_PREFIX = "task:order";

const getKey = (projectId, status) => {
  return `${TASK_ORDER_PREFIX}:${projectId}:${status}`;
};

const TaskOrderService = {
  async setTaskOrder(projectId, status, taskId, order) {
    if (!redis) return null;
    const key = getKey(projectId, status);
    await redis.zadd(key, order, taskId);
  },

  async removeTask(projectId, status, taskId) {
    if (!redis) return null;
    const key = getKey(projectId, status);
    await redis.zrem(key, taskId);
  },

  async moveTask(projectId, fromStatus, toStatus, taskId, newOrder) {
    if (!redis) return null;
    const fromKey = getKey(projectId, fromStatus);
    const toKey = getKey(projectId, toStatus);
    
    await redis.zrem(fromKey, taskId);
    await redis.zadd(toKey, newOrder, taskId);
  },

  async getTaskOrder(projectId, status, taskId) {
    if (!redis) return null;
    const key = getKey(projectId, status);
    const score = await redis.zscore(key, taskId);
    return score ? parseFloat(score) : null;
  },

  async getOrderedTasks(projectId, status, start = 0, stop = -1) {
    if (!redis) return [];
    const key = getKey(projectId, status);
    return await redis.zrange(key, start, stop);
  },

  async syncColumn(projectId, status, taskIds) {
    if (!redis) return;
    const key = getKey(projectId, status);
    await redis.del(key);
    if (taskIds.length > 0) {
      const args = [];
      taskIds.forEach((taskId, index) => {
        args.push(index * 1000, taskId);
      });
      await redis.zadd(key, ...args);
    }
  },

  async getNextOrder(projectId, status) {
    if (!redis) return Date.now() * 1000;
    const key = getKey(projectId, status);
    const tasks = await redis.zrevrange(key, 0, 0);
    if (tasks.length === 0) return 1000;
    const maxScore = await redis.zscore(key, tasks[0]);
    return maxScore ? parseFloat(maxScore) + 1000 : 1000;
  },

  async getColumnOrder(projectId, status) {
    if (!redis) return [];
    const key = getKey(projectId, status);
    const tasks = await redis.zrange(key, 0, -1, "WITHSCORES");
    const result = [];
    for (let i = 0; i < tasks.length; i += 2) {
      result.push({ taskId: tasks[i], order: parseFloat(tasks[i + 1]) });
    }
    return result;
  },

  async deleteProject(projectId) {
    if (!redis) return;
    const keys = [];
    const statuses = ["todo", "in_progress", "review", "on_hold", "done"];
    statuses.forEach(status => {
      keys.push(getKey(projectId, status));
    });
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },
};

module.exports = TaskOrderService;