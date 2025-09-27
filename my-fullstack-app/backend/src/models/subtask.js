const pool = require("../config/database");

class Subtask {
  static async create(subtaskData) {
    const { taskId, title } = subtaskData;
    const query = `
      INSERT INTO subtasks (task_id, title, is_done, created_at)
      VALUES ($1, $2, FALSE, NOW())
      RETURNING subtask_id, task_id, title, is_done, created_at
    `;
    
    try {
      const result = await pool.query(query, [taskId, title]);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating subtask:", error);
      throw error;
    }
  }

  static async findByTaskId(taskId) {
    const query = `
      SELECT subtask_id, task_id, title, is_done, created_at
      FROM subtasks 
      WHERE task_id = $1
      ORDER BY created_at ASC
    `;
    
    try {
      const result = await pool.query(query, [taskId]);
      return result.rows;
    } catch (error) {
      console.error("Error finding subtasks by task id:", error);
      throw error;
    }
  }

  static async findById(subtaskId) {
    const query = `
      SELECT subtask_id, task_id, title, is_done, created_at
      FROM subtasks 
      WHERE subtask_id = $1
    `;
    
    try {
      const result = await pool.query(query, [subtaskId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error finding subtask by id:", error);
      throw error;
    }
  }

  static async update(subtaskId, updateData) {
    const { title, isDone } = updateData;
    const query = `
      UPDATE subtasks 
      SET title = $1, is_done = $2
      WHERE subtask_id = $3
      RETURNING subtask_id, task_id, title, is_done, created_at
    `;
    
    try {
      const result = await pool.query(query, [title, isDone, subtaskId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error updating subtask:", error);
      throw error;
    }
  }

  static async toggleStatus(subtaskId) {
    const query = `
      UPDATE subtasks 
      SET is_done = NOT is_done
      WHERE subtask_id = $1
      RETURNING subtask_id, task_id, title, is_done, created_at
    `;
    
    try {
      const result = await pool.query(query, [subtaskId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error toggling subtask status:", error);
      throw error;
    }
  }

  static async delete(subtaskId) {
    const query = `DELETE FROM subtasks WHERE subtask_id = $1`;
    
    try {
      await pool.query(query, [subtaskId]);
      return true;
    } catch (error) {
      console.error("Error deleting subtask:", error);
      throw error;
    }
  }

  static async getTaskSubtaskStats(taskId) {
    const query = `
      SELECT 
        COUNT(*) as total_subtasks,
        COUNT(CASE WHEN is_done = TRUE THEN 1 END) as completed_subtasks,
        COUNT(CASE WHEN is_done = FALSE THEN 1 END) as pending_subtasks
      FROM subtasks 
      WHERE task_id = $1
    `;
    
    try {
      const result = await pool.query(query, [taskId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error getting subtask stats:", error);
      throw error;
    }
  }
}

module.exports = Subtask;
