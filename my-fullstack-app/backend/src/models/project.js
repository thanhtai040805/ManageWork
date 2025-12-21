const pool = require("../config/database");

class Project {
  static async create(projectData) {
    const { name, description, ownerId } = projectData;
    const query = `
      INSERT INTO projects (name, description, owner_id, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING project_id, name, description, owner_id, created_at, updated_at
    `;
    
    try {
      const result = await pool.query(query, [name, description, ownerId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  }

  static async findById(projectId) {
    const query = `
      SELECT p.project_id, p.name, p.description, p.owner_id, p.created_at, p.updated_at,
             u.username as owner_username, u.full_name as owner_name
      FROM projects p
      LEFT JOIN users u ON p.owner_id = u.user_id
      WHERE p.project_id = $1
    `;
    
    try {
      const result = await pool.query(query, [projectId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error finding project by id:", error);
      throw error;
    }
  }

  static async getAll() {
    const query = `
      SELECT p.project_id, p.name, p.description, p.owner_id, p.created_at, p.updated_at,
             u.username as owner_username, u.full_name as owner_name
      FROM projects p
      LEFT JOIN users u ON p.owner_id = u.user_id
      ORDER BY p.created_at DESC
    `;
    
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error("Error getting all projects:", error);
      throw error;
    }
  }

  static async getUserProjects(userId) {
    const query = `
      SELECT DISTINCT p.project_id, p.name, p.description, p.owner_id, p.created_at, p.updated_at,
             u.username as owner_username, u.full_name as owner_name,
             pm.role as user_role
      FROM projects p
      LEFT JOIN users u ON p.owner_id = u.user_id
      LEFT JOIN project_members pm ON p.project_id = pm.project_id
      WHERE p.owner_id = $1 OR pm.user_id = $1
      ORDER BY p.created_at DESC
    `;
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error("Error getting user projects:", error);
      throw error;
    }
  }

  static async update(projectId, updateData) {
    const { name, description } = updateData;
    const query = `
      UPDATE projects 
      SET name = $1, description = $2, updated_at = NOW()
      WHERE project_id = $3
      RETURNING project_id, name, description, owner_id, updated_at
    `;
    
    try {
      const result = await pool.query(query, [name, description, projectId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error updating project:", error);
      throw error;
    }
  }

  static async delete(projectId) {
    const query = `DELETE FROM projects WHERE project_id = $1`;
    
    try {
      await pool.query(query, [projectId]);
      return true;
    } catch (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  }

  static async getProjectMembers(projectId) {
    const query = `
      SELECT u.user_id, u.username, u.full_name, u.email, u.avatar_url,
             pm.role, pm.joined_at
      FROM project_members pm
      JOIN users u ON pm.user_id = u.user_id
      WHERE pm.project_id = $1
      ORDER BY pm.joined_at ASC
    `;
    
    try {
      const result = await pool.query(query, [projectId]);
      return result.rows;
    } catch (error) {
      console.error("Error getting project members:", error);
      throw error;
    }
  }

  static async addMember(projectId, userId, role = 'viewer') {
    const query = `
      INSERT INTO project_members (project_id, user_id, role, joined_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING project_id, user_id, role, joined_at
    `;
    
    try {
      const result = await pool.query(query, [projectId, userId, role]);
      return result.rows[0];
    } catch (error) {
      console.error("Error adding project member:", error);
      throw error;
    }
  }

  static async removeMember(projectId, userId) {
    const query = `DELETE FROM project_members WHERE project_id = $1 AND user_id = $2`;
    
    try {
      await pool.query(query, [projectId, userId]);
      return true;
    } catch (error) {
      console.error("Error removing project member:", error);
      throw error;
    }
  }

  static async getProjectStats(projectId) {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM tasks WHERE project_id = $1) as total_tasks,
        (SELECT COUNT(*) FROM tasks WHERE project_id = $1 AND status = 'done') as completed_tasks,
        (SELECT COUNT(*) FROM project_members WHERE project_id = $1) as total_members
    `;
    
    try {
      const result = await pool.query(query, [projectId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error getting project stats:", error);
      throw error;
    }
  }
}

module.exports = Project;
