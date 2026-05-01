const pool = require("../../../shared/config/database");

class File {
  static async create(fileData) {
    const { 
      fileUrl, 
      fileType, 
      uploadedBy, 
      taskId = null, 
      messageId = null,
      cloudinaryPublicId = null,
      fileSize = null,
      originalFilename = null
    } = fileData;
    const query = `
      INSERT INTO files (file_url, file_type, uploaded_by, task_id, message_id, cloudinary_public_id, file_size, original_filename)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    try {
      const result = await pool.query(query, [fileUrl, fileType, uploadedBy, taskId, messageId, cloudinaryPublicId, fileSize, originalFilename]);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating file record:", error);
      throw error;
    }
  }

  static async findByTaskId(taskId) {
    const query = `
      SELECT f.*, u.full_name as uploader_name
      FROM files f
      JOIN users u ON f.uploaded_by = u.user_id
      WHERE f.task_id = $1
      ORDER BY f.created_at DESC
    `;
    
    try {
      const result = await pool.query(query, [taskId]);
      return result.rows;
    } catch (error) {
      console.error("Error finding files by task id:", error);
      throw error;
    }
  }

  static async delete(fileId) {
    const query = `DELETE FROM files WHERE file_id = $1 RETURNING *`;
    
    try {
      const result = await pool.query(query, [fileId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error deleting file record:", error);
      throw error;
    }
  }
}

module.exports = File;
