const pool = require("../config/database");

class File {
  static async create(fileData) {
    const { fileUrl, fileType, uploadedBy, taskId = null, messageId = null } = fileData;
    const query = `
      INSERT INTO files (file_url, file_type, uploaded_by, task_id, message_id, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING file_id, file_url, file_type, uploaded_by, task_id, message_id, created_at
    `;
    
    try {
      const result = await pool.query(query, [fileUrl, fileType, uploadedBy, taskId, messageId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating file:", error);
      throw error;
    }
  }

  static async findById(fileId) {
    const query = `
      SELECT f.file_id, f.file_url, f.file_type, f.uploaded_by, f.task_id, f.message_id, f.created_at,
             u.username, u.full_name, u.avatar_url
      FROM files f
      JOIN users u ON f.uploaded_by = u.user_id
      WHERE f.file_id = $1
    `;
    
    try {
      const result = await pool.query(query, [fileId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error finding file by id:", error);
      throw error;
    }
  }

  static async getTaskFiles(taskId) {
    const query = `
      SELECT f.file_id, f.file_url, f.file_type, f.uploaded_by, f.task_id, f.message_id, f.created_at,
             u.username, u.full_name, u.avatar_url
      FROM files f
      JOIN users u ON f.uploaded_by = u.user_id
      WHERE f.task_id = $1
      ORDER BY f.created_at DESC
    `;
    
    try {
      const result = await pool.query(query, [taskId]);
      return result.rows;
    } catch (error) {
      console.error("Error getting task files:", error);
      throw error;
    }
  }

  static async getMessageFiles(messageId) {
    const query = `
      SELECT f.file_id, f.file_url, f.file_type, f.uploaded_by, f.task_id, f.message_id, f.created_at,
             u.username, u.full_name, u.avatar_url
      FROM files f
      JOIN users u ON f.uploaded_by = u.user_id
      WHERE f.message_id = $1
      ORDER BY f.created_at DESC
    `;
    
    try {
      const result = await pool.query(query, [messageId]);
      return result.rows;
    } catch (error) {
      console.error("Error getting message files:", error);
      throw error;
    }
  }

  static async getUserFiles(userId) {
    const query = `
      SELECT f.file_id, f.file_url, f.file_type, f.uploaded_by, f.task_id, f.message_id, f.created_at,
             t.title as task_title, p.name as project_name
      FROM files f
      LEFT JOIN tasks t ON f.task_id = t.task_id
      LEFT JOIN projects p ON t.project_id = p.project_id
      WHERE f.uploaded_by = $1
      ORDER BY f.created_at DESC
    `;
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error("Error getting user files:", error);
      throw error;
    }
  }

  static async update(fileId, updateData) {
    const { fileType } = updateData;
    const query = `
      UPDATE files 
      SET file_type = $1
      WHERE file_id = $2
      RETURNING file_id, file_url, file_type, uploaded_by, task_id, message_id, created_at
    `;
    
    try {
      const result = await pool.query(query, [fileType, fileId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error updating file:", error);
      throw error;
    }
  }

  static async delete(fileId) {
    const query = `DELETE FROM files WHERE file_id = $1`;
    
    try {
      await pool.query(query, [fileId]);
      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  }

  static async getFileStats(userId) {
    const query = `
      SELECT 
        COUNT(*) as total_files,
        COUNT(CASE WHEN file_type LIKE 'image/%' THEN 1 END) as image_files,
        COUNT(CASE WHEN file_type LIKE 'application/%' THEN 1 END) as document_files,
        COUNT(CASE WHEN file_type LIKE 'video/%' THEN 1 END) as video_files,
        COUNT(CASE WHEN file_type LIKE 'audio/%' THEN 1 END) as audio_files
      FROM files 
      WHERE uploaded_by = $1
    `;
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error getting file stats:", error);
      throw error;
    }
  }
}

module.exports = File;
