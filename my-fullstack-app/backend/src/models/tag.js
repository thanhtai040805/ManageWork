const pool = require("../config/database");

class Tag {
  static async create(tagData) {
    const { name, color } = tagData;
    const query = `
      INSERT INTO tags (name, color)
      VALUES ($1, $2)
      RETURNING tag_id, name, color
    `;
    
    try {
      const result = await pool.query(query, [name, color]);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating tag:", error);
      throw error;
    }
  }

  static async findById(tagId) {
    const query = `
      SELECT tag_id, name, color
      FROM tags 
      WHERE tag_id = $1
    `;
    
    try {
      const result = await pool.query(query, [tagId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error finding tag by id:", error);
      throw error;
    }
  }

  static async findByName(name) {
    const query = `
      SELECT tag_id, name, color
      FROM tags 
      WHERE name = $1
    `;
    
    try {
      const result = await pool.query(query, [name]);
      return result.rows[0];
    } catch (error) {
      console.error("Error finding tag by name:", error);
      throw error;
    }
  }

  static async getAll() {
    const query = `
      SELECT tag_id, name, color
      FROM tags 
      ORDER BY name ASC
    `;
    
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error("Error getting all tags:", error);
      throw error;
    }
  }

  static async update(tagId, updateData) {
    const { name, color } = updateData;
    const query = `
      UPDATE tags 
      SET name = $1, color = $2
      WHERE tag_id = $3
      RETURNING tag_id, name, color
    `;
    
    try {
      const result = await pool.query(query, [name, color, tagId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error updating tag:", error);
      throw error;
    }
  }

  static async delete(tagId) {
    const query = `DELETE FROM tags WHERE tag_id = $1`;
    
    try {
      await pool.query(query, [tagId]);
      return true;
    } catch (error) {
      console.error("Error deleting tag:", error);
      throw error;
    }
  }

  static async getTaskTags(taskId) {
    const query = `
      SELECT t.tag_id, t.name, t.color
      FROM tags t
      JOIN task_tags tt ON t.tag_id = tt.tag_id
      WHERE tt.task_id = $1
      ORDER BY t.name ASC
    `;
    
    try {
      const result = await pool.query(query, [taskId]);
      return result.rows;
    } catch (error) {
      console.error("Error getting task tags:", error);
      throw error;
    }
  }

  static async addTagToTask(taskId, tagId) {
    const query = `
      INSERT INTO task_tags (task_id, tag_id)
      VALUES ($1, $2)
      RETURNING task_id, tag_id
    `;
    
    try {
      const result = await pool.query(query, [taskId, tagId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error adding tag to task:", error);
      throw error;
    }
  }

  static async removeTagFromTask(taskId, tagId) {
    const query = `DELETE FROM task_tags WHERE task_id = $1 AND tag_id = $2`;
    
    try {
      await pool.query(query, [taskId, tagId]);
      return true;
    } catch (error) {
      console.error("Error removing tag from task:", error);
      throw error;
    }
  }

  static async getTagUsageStats() {
    const query = `
      SELECT t.tag_id, t.name, t.color, COUNT(tt.task_id) as usage_count
      FROM tags t
      LEFT JOIN task_tags tt ON t.tag_id = tt.tag_id
      GROUP BY t.tag_id, t.name, t.color
      ORDER BY usage_count DESC, t.name ASC
    `;
    
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error("Error getting tag usage stats:", error);
      throw error;
    }
  }
}

module.exports = Tag;
