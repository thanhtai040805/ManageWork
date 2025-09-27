const pool = require("../config/database");

class Task {
  static async create(taskData) {
    const { projectId, title, description, status, priority, dueDate, orderIndex, createdBy, assignedTo } = taskData;
    const query = `
      INSERT INTO tasks (project_id, title, description, status, priority, due_date, order_index, created_by, assigned_to, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING task_id, project_id, title, description, status, priority, due_date, order_index, created_by, assigned_to, created_at, updated_at
    `;
    
    try {
      const result = await pool.query(query, [projectId, title, description, status, priority, dueDate, orderIndex, createdBy, assignedTo]);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  }

  static async findById(taskId) {
    const query = `
      SELECT t.task_id, t.project_id, t.title, t.description, t.status, t.priority, t.due_date, t.order_index, t.created_by, t.assigned_to, t.created_at, t.updated_at,
             u1.username as creator_username, u1.full_name as creator_name,
             u2.username as assignee_username, u2.full_name as assignee_name,
             p.name as project_name
      FROM tasks t
      LEFT JOIN users u1 ON t.created_by = u1.user_id
      LEFT JOIN users u2 ON t.assigned_to = u2.user_id
      LEFT JOIN projects p ON t.project_id = p.project_id
      WHERE t.task_id = $1
    `;
    
    try {
      const result = await pool.query(query, [taskId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error finding task by id:", error);
      throw error;
    }
  }

  static async getProjectTasks(projectId) {
    const query = `
      SELECT t.task_id, t.project_id, t.title, t.description, t.status, t.priority, t.due_date, t.order_index, t.created_by, t.assigned_to, t.created_at, t.updated_at,
             u1.username as creator_username, u1.full_name as creator_name,
             u2.username as assignee_username, u2.full_name as assignee_name
      FROM tasks t
      LEFT JOIN users u1 ON t.created_by = u1.user_id
      LEFT JOIN users u2 ON t.assigned_to = u2.user_id
      WHERE t.project_id = $1
      ORDER BY t.order_index ASC, t.created_at DESC
    `;
    
    try {
      const result = await pool.query(query, [projectId]);
      return result.rows;
    } catch (error) {
      console.error("Error getting project tasks:", error);
      throw error;
    }
  }

  static async getUserTasks(userId) {
    const query = `
      SELECT t.task_id, t.project_id, t.title, t.description, t.status, t.priority, t.due_date, t.order_index, t.created_by, t.assigned_to, t.created_at, t.updated_at,
             u1.username as creator_username, u1.full_name as creator_name,
             u2.username as assignee_username, u2.full_name as assignee_name,
             p.name as project_name
      FROM tasks t
      LEFT JOIN users u1 ON t.created_by = u1.user_id
      LEFT JOIN users u2 ON t.assigned_to = u2.user_id
      LEFT JOIN projects p ON t.project_id = p.project_id
      WHERE t.assigned_to = $1 OR t.created_by = $1
      ORDER BY t.due_date ASC, t.created_at DESC
    `;
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error("Error getting user tasks:", error);
      throw error;
    }
  }

  static async update(taskId, updateData) {
    const { title, description, status, priority, dueDate, orderIndex, assignedTo } = updateData;
    const query = `
      UPDATE tasks 
      SET title = $1, description = $2, status = $3, priority = $4, due_date = $5, order_index = $6, assigned_to = $7, updated_at = NOW()
      WHERE task_id = $8
      RETURNING task_id, project_id, title, description, status, priority, due_date, order_index, created_by, assigned_to, updated_at
    `;
    
    try {
      const result = await pool.query(query, [title, description, status, priority, dueDate, orderIndex, assignedTo, taskId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  }

  static async delete(taskId) {
    const query = `DELETE FROM tasks WHERE task_id = $1`;
    
    try {
      await pool.query(query, [taskId]);
      return true;
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  }

  static async updateStatus(taskId, status) {
    const query = `
      UPDATE tasks 
      SET status = $1, updated_at = NOW()
      WHERE task_id = $2
      RETURNING task_id, status, updated_at
    `;
    
    try {
      const result = await pool.query(query, [status, taskId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error updating task status:", error);
      throw error;
    }
  }

  static async updateOrder(tasks) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const task of tasks) {
        await client.query(
          'UPDATE tasks SET order_index = $1 WHERE task_id = $2',
          [task.orderIndex, task.taskId]
        );
      }
      
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error("Error updating task order:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async getTaskStats(projectId) {
    const query = `
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'todo' THEN 1 END) as todo_tasks,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN status = 'done' THEN 1 END) as done_tasks,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_tasks,
        COUNT(CASE WHEN due_date < NOW() AND status != 'done' THEN 1 END) as overdue_tasks
      FROM tasks 
      WHERE project_id = $1
    `;
    
    try {
      const result = await pool.query(query, [projectId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error getting task stats:", error);
      throw error;
    }
  }
}

module.exports = Task;
