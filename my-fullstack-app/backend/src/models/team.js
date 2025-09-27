const pool = require("../config/database");

class Team {
  static async create(teamData) {
    const { name, description, createdBy } = teamData;
    const query = `
      INSERT INTO teams (name, description, created_by, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING team_id, name, description, created_by, created_at
    `;
    
    try {
      const result = await pool.query(query, [name, description, createdBy]);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating team:", error);
      throw error;
    }
  }

  static async findById(teamId) {
    const query = `
      SELECT t.team_id, t.name, t.description, t.created_by, t.created_at,
             u.username as creator_username, u.full_name as creator_name
      FROM teams t
      LEFT JOIN users u ON t.created_by = u.user_id
      WHERE t.team_id = $1
    `;
    
    try {
      const result = await pool.query(query, [teamId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error finding team by id:", error);
      throw error;
    }
  }

  static async getAll() {
    const query = `
      SELECT t.team_id, t.name, t.description, t.created_by, t.created_at,
             u.username as creator_username, u.full_name as creator_name
      FROM teams t
      LEFT JOIN users u ON t.created_by = u.user_id
      ORDER BY t.created_at DESC
    `;
    
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error("Error getting all teams:", error);
      throw error;
    }
  }

  static async getUserTeams(userId) {
    const query = `
      SELECT t.team_id, t.name, t.description, t.created_by, t.created_at,
             tm.role as user_role, tm.joined_at
      FROM teams t
      JOIN team_members tm ON t.team_id = tm.team_id
      WHERE tm.user_id = $1
      ORDER BY tm.joined_at DESC
    `;
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error("Error getting user teams:", error);
      throw error;
    }
  }

  static async update(teamId, updateData) {
    const { name, description } = updateData;
    const query = `
      UPDATE teams 
      SET name = $1, description = $2
      WHERE team_id = $3
      RETURNING team_id, name, description, created_by, created_at
    `;
    
    try {
      const result = await pool.query(query, [name, description, teamId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error updating team:", error);
      throw error;
    }
  }

  static async delete(teamId) {
    const query = `DELETE FROM teams WHERE team_id = $1`;
    
    try {
      await pool.query(query, [teamId]);
      return true;
    } catch (error) {
      console.error("Error deleting team:", error);
      throw error;
    }
  }

  static async getTeamMembers(teamId) {
    const query = `
      SELECT u.user_id, u.username, u.full_name, u.email, u.avatar_url,
             tm.role, tm.joined_at
      FROM team_members tm
      JOIN users u ON tm.user_id = u.user_id
      WHERE tm.team_id = $1
      ORDER BY tm.joined_at ASC
    `;
    
    try {
      const result = await pool.query(query, [teamId]);
      return result.rows;
    } catch (error) {
      console.error("Error getting team members:", error);
      throw error;
    }
  }

  static async addMember(teamId, userId, role = 'member') {
    const query = `
      INSERT INTO team_members (team_id, user_id, role, joined_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING team_id, user_id, role, joined_at
    `;
    
    try {
      const result = await pool.query(query, [teamId, userId, role]);
      return result.rows[0];
    } catch (error) {
      console.error("Error adding team member:", error);
      throw error;
    }
  }

  static async removeMember(teamId, userId) {
    const query = `DELETE FROM team_members WHERE team_id = $1 AND user_id = $2`;
    
    try {
      await pool.query(query, [teamId, userId]);
      return true;
    } catch (error) {
      console.error("Error removing team member:", error);
      throw error;
    }
  }
}

module.exports = Team;
