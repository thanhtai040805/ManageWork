const pool = require("../config/database");

class Comment {
  static async create(commentData) {
    const { taskId, userId, content } = commentData;
    const query = `
      INSERT INTO comments (task_id, user_id, content, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING comment_id, task_id, user_id, content, created_at
    `;
    
    try {
      const result = await pool.query(query, [taskId, userId, content]);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
  }

  static async findById(commentId) {
    const query = `
      SELECT c.comment_id, c.task_id, c.user_id, c.content, c.created_at,
             u.username, u.full_name, u.avatar_url
      FROM comments c
      JOIN users u ON c.user_id = u.user_id
      WHERE c.comment_id = $1
    `;
    
    try {
      const result = await pool.query(query, [commentId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error finding comment by id:", error);
      throw error;
    }
  }

  static async getTaskComments(taskId) {
    const query = `
      SELECT c.comment_id, c.task_id, c.user_id, c.content, c.created_at,
             u.username, u.full_name, u.avatar_url
      FROM comments c
      JOIN users u ON c.user_id = u.user_id
      WHERE c.task_id = $1
      ORDER BY c.created_at ASC
    `;
    
    try {
      const result = await pool.query(query, [taskId]);
      return result.rows;
    } catch (error) {
      console.error("Error getting task comments:", error);
      throw error;
    }
  }

  static async getUserComments(userId) {
    const query = `
      SELECT c.comment_id, c.task_id, c.user_id, c.content, c.created_at,
             t.title as task_title, p.name as project_name
      FROM comments c
      JOIN tasks t ON c.task_id = t.task_id
      JOIN projects p ON t.project_id = p.project_id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
    `;
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error("Error getting user comments:", error);
      throw error;
    }
  }

  static async update(commentId, updateData) {
    const { content } = updateData;
    const query = `
      UPDATE comments 
      SET content = $1
      WHERE comment_id = $2
      RETURNING comment_id, task_id, user_id, content, created_at
    `;
    
    try {
      const result = await pool.query(query, [content, commentId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error updating comment:", error);
      throw error;
    }
  }

  static async delete(commentId) {
    const query = `DELETE FROM comments WHERE comment_id = $1`;
    
    try {
      await pool.query(query, [commentId]);
      return true;
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  }

  static async getCommentStats(taskId) {
    const query = `
      SELECT COUNT(*) as total_comments
      FROM comments 
      WHERE task_id = $1
    `;
    
    try {
      const result = await pool.query(query, [taskId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error getting comment stats:", error);
      throw error;
    }
  }
}

module.exports = Comment;
