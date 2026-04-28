const pool = require("../config/database");

class ActivityLog {
  static async create(logData) {
    const { userId, taskId = null, action } = logData;
    const query = `
      INSERT INTO activity_logs (user_id, task_id, action, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING log_id, user_id, task_id, action, created_at
    `;
    
    try {
      const result = await pool.query(query, [userId, taskId, action]);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating activity log:", error);
      throw error;
    }
  }

  static async findById(logId) {
    const query = `
      SELECT al.log_id, al.user_id, al.task_id, al.action, al.created_at,
             u.username, u.full_name, u.avatar_url,
             t.title as task_title, p.name as project_name
      FROM activity_logs al
      JOIN users u ON al.user_id = u.user_id
      LEFT JOIN tasks t ON al.task_id = t.task_id
      LEFT JOIN projects p ON t.project_id = p.project_id
      WHERE al.log_id = $1
    `;
    
    try {
      const result = await pool.query(query, [logId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error finding activity log by id:", error);
      throw error;
    }
  }

  static async getUserActivityLogs(userId, limit = 50, offset = 0) {
    const query = `
      SELECT al.log_id, al.user_id, al.task_id, al.action, al.created_at,
             t.title as task_title, p.name as project_name
      FROM activity_logs al
      LEFT JOIN tasks t ON al.task_id = t.task_id
      LEFT JOIN projects p ON t.project_id = p.project_id
      WHERE al.user_id = $1
      ORDER BY al.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    try {
      const result = await pool.query(query, [userId, limit, offset]);
      return result.rows;
    } catch (error) {
      console.error("Error getting user activity logs:", error);
      throw error;
    }
  }

  static async getTaskActivityLogs(taskId, limit = 50, offset = 0) {
    const query = `
      SELECT al.log_id, al.user_id, al.task_id, al.action, al.created_at,
             u.username, u.full_name, u.avatar_url
      FROM activity_logs al
      JOIN users u ON al.user_id = u.user_id
      WHERE al.task_id = $1
      ORDER BY al.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    try {
      const result = await pool.query(query, [taskId, limit, offset]);
      return result.rows;
    } catch (error) {
      console.error("Error getting task activity logs:", error);
      throw error;
    }
  }

  static async getProjectActivityLogs(projectId, limit = 50, offset = 0) {
    const query = `
      SELECT al.log_id, al.user_id, al.task_id, al.action, al.created_at,
             u.username, u.full_name, u.avatar_url,
             t.title as task_title
      FROM activity_logs al
      JOIN users u ON al.user_id = u.user_id
      JOIN tasks t ON al.task_id = t.task_id
      WHERE t.project_id = $1
      ORDER BY al.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    try {
      const result = await pool.query(query, [projectId, limit, offset]);
      return result.rows;
    } catch (error) {
      console.error("Error getting project activity logs:", error);
      throw error;
    }
  }

  static async getTeamActivityLogs(teamId, limit = 50, offset = 0) {
    const query = `
      SELECT al.log_id, al.user_id, al.task_id, al.action, al.created_at,
             u.username, u.full_name, u.avatar_url,
             t.title as task_title, p.name as project_name
      FROM activity_logs al
      JOIN users u ON al.user_id = u.user_id
      LEFT JOIN tasks t ON al.task_id = t.task_id
      LEFT JOIN projects p ON t.project_id = p.project_id
      JOIN team_members tm ON al.user_id = tm.user_id
      WHERE tm.team_id = $1
      ORDER BY al.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    try {
      const result = await pool.query(query, [teamId, limit, offset]);
      return result.rows;
    } catch (error) {
      console.error("Error getting team activity logs:", error);
      throw error;
    }
  }

  static async delete(logId) {
    const query = `DELETE FROM activity_logs WHERE log_id = $1`;
    
    try {
      await pool.query(query, [logId]);
      return true;
    } catch (error) {
      console.error("Error deleting activity log:", error);
      throw error;
    }
  }

  static async deleteOldLogs(daysOld = 90) {
    const query = `
      DELETE FROM activity_logs 
      WHERE created_at < NOW() - INTERVAL '${daysOld} days'
    `;
    
    try {
      const result = await pool.query(query);
      return result.rowCount;
    } catch (error) {
      console.error("Error deleting old activity logs:", error);
      throw error;
    }
  }

  static async getActivityStats(userId, days = 30) {
    const query = `
      SELECT 
        COUNT(*) as total_activities,
        COUNT(CASE WHEN action LIKE '%created%' THEN 1 END) as created_activities,
        COUNT(CASE WHEN action LIKE '%updated%' THEN 1 END) as updated_activities,
        COUNT(CASE WHEN action LIKE '%deleted%' THEN 1 END) as deleted_activities,
        COUNT(CASE WHEN action LIKE '%completed%' THEN 1 END) as completed_activities
      FROM activity_logs 
      WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '${days} days'
    `;
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error getting activity stats:", error);
      throw error;
    }
  }

  // Helper methods for common actions
  static async logTaskCreated(userId, taskId, taskTitle) {
    return this.create({ userId, taskId, action: `Created task: ${taskTitle}` });
  }

  static async logTaskUpdated(userId, taskId, taskTitle) {
    return this.create({ userId, taskId, action: `Updated task: ${taskTitle}` });
  }

  static async logTaskCompleted(userId, taskId, taskTitle) {
    return this.create({ userId, taskId, action: `Completed task: ${taskTitle}` });
  }

  static async logTaskDeleted(userId, taskId, taskTitle) {
    return this.create({ userId, taskId, action: `Deleted task: ${taskTitle}` });
  }

  static async logProjectCreated(userId, projectName) {
    return this.create({ userId, action: `Created project: ${projectName}` });
  }

  static async logTeamJoined(userId, teamName) {
    return this.create({ userId, action: `Joined team: ${teamName}` });
  }

  static async logCommentAdded(userId, taskId, taskTitle) {
    return this.create({ userId, taskId, action: `Added comment to task: ${taskTitle}` });
  }
}

module.exports = ActivityLog;
