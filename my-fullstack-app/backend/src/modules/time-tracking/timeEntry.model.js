const pool = require("../../shared/config/database");

class TimeEntry {
  static async create(entryData) {
    const { taskId, userId, durationMinutes, description, startedAt } = entryData;
    const query = `
      INSERT INTO time_entries (task_id, user_id, duration_minutes, description, started_at, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING entry_id, task_id, user_id, duration_minutes, description, started_at, created_at
    `;
    try {
      const result = await pool.query(query, [taskId, userId, durationMinutes || 0, description, startedAt || new Date()]);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating time entry:", error);
      throw error;
    }
  }

  static async getUserEntries(userId, limit = 50) {
    const query = `
      SELECT te.*, t.title as task_title
      FROM time_entries te
      LEFT JOIN tasks t ON te.task_id = t.task_id
      WHERE te.user_id = $1
      ORDER BY te.created_at DESC
      LIMIT $2
    `;
    try {
      const result = await pool.query(query, [userId, limit]);
      return result.rows;
    } catch (error) {
      console.error("Error getting user time entries:", error);
      throw error;
    }
  }

  static async getTaskEntries(taskId) {
    const query = `
      SELECT te.*, u.username
      FROM time_entries te
      JOIN users u ON te.user_id = u.user_id
      WHERE te.task_id = $1
      ORDER BY te.created_at DESC
    `;
    try {
      const result = await pool.query(query, [taskId]);
      return result.rows;
    } catch (error) {
      console.error("Error getting task time entries:", error);
      throw error;
    }
  }

  static async delete(entryId) {
    const query = `DELETE FROM time_entries WHERE entry_id = $1`;
    try {
      await pool.query(query, [entryId]);
      return true;
    } catch (error) {
      console.error("Error deleting time entry:", error);
      throw error;
    }
  }

  static async getTotalTimeByTask(taskId) {
    const query = `
      SELECT COALESCE(SUM(duration_minutes), 0) as total_minutes
      FROM time_entries WHERE task_id = $1
    `;
    try {
      const result = await pool.query(query, [taskId]);
      return result.rows[0].total_minutes;
    } catch (error) {
      console.error("Error getting total time:", error);
      throw error;
    }
  }
}

module.exports = TimeEntry;