const pool = require("../config/database");

class User {
  static async create(userData) {
    const { username, email, password, fullName } = userData;
    const query = `
      INSERT INTO users (username, email, password_hash, full_name, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING user_id, username, email, full_name, avatar_url, role, created_at
    `;
    
    try {
      const result = await pool.query(query, [username, email, password, fullName]);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  static async findByEmail(email) {
    const query = `
      SELECT user_id, username, email, password_hash, full_name, avatar_url, role, created_at
      FROM users WHERE email = $1
    `;
    
    try {
      const result = await pool.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      console.error("Error finding user by email:", error);
      throw error;
    }
  }

  static async findByUsername(username) {
    const query = `
      SELECT user_id, username, email, password_hash, full_name, avatar_url, role, created_at
      FROM users WHERE username = $1
    `;
    
    try {
      const result = await pool.query(query, [username]);
      return result.rows[0];
    } catch (error) {
      console.error("Error finding user by username:", error);
      throw error;
    }
  }

  static async findById(id) {
    const query = `
      SELECT user_id, username, email, full_name, avatar_url, role, created_at
      FROM users WHERE user_id = $1
    `;
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error("Error finding user by id:", error);
      throw error;
    }
  }

  static async getAll() {
    const query = `
      SELECT user_id, username, email, full_name, avatar_url, role, created_at
      FROM users ORDER BY created_at DESC
    `;
    
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error("Error getting all users:", error);
      throw error;
    }
  }

  static async updateProfile(userId, updateData) {
    const { fullName, avatarUrl } = updateData;
    const query = `
      UPDATE users 
      SET full_name = $1, avatar_url = $2, updated_at = NOW()
      WHERE user_id = $3
      RETURNING user_id, username, email, full_name, avatar_url, role, updated_at
    `;
    
    try {
      const result = await pool.query(query, [fullName, avatarUrl, userId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  }

  static async getUserStats(userId) {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM tasks WHERE assigned_to = $1) as total_tasks,
        (SELECT COUNT(*) FROM tasks WHERE assigned_to = $1 AND status = 'done') as completed_tasks,
        (SELECT COUNT(*) FROM projects WHERE owner_id = $1) as owned_projects,
        (SELECT COUNT(*) FROM team_members WHERE user_id = $1) as team_memberships
    `;
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error getting user stats:", error);
      throw error;
    }
  }
}

module.exports = User;