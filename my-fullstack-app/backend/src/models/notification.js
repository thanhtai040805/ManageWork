const pool = require("../config/database");

class Notification {
  static async create(notificationData) {
    const { userId, type, message } = notificationData;
    const query = `
      INSERT INTO notifications (user_id, type, message, is_read, created_at)
      VALUES ($1, $2, $3, FALSE, NOW())
      RETURNING notification_id, user_id, type, message, is_read, created_at
    `;
    
    try {
      const result = await pool.query(query, [userId, type, message]);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  static async findById(notificationId) {
    const query = `
      SELECT notification_id, user_id, type, message, is_read, created_at
      FROM notifications 
      WHERE notification_id = $1
    `;
    
    try {
      const result = await pool.query(query, [notificationId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error finding notification by id:", error);
      throw error;
    }
  }

  static async getUserNotifications(userId, limit = 50, offset = 0) {
    const query = `
      SELECT notification_id, user_id, type, message, is_read, created_at
      FROM notifications 
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    try {
      const result = await pool.query(query, [userId, limit, offset]);
      return result.rows;
    } catch (error) {
      console.error("Error getting user notifications:", error);
      throw error;
    }
  }

  static async getUnreadNotifications(userId) {
    const query = `
      SELECT notification_id, user_id, type, message, is_read, created_at
      FROM notifications 
      WHERE user_id = $1 AND is_read = FALSE
      ORDER BY created_at DESC
    `;
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error("Error getting unread notifications:", error);
      throw error;
    }
  }

  static async markAsRead(notificationId) {
    const query = `
      UPDATE notifications 
      SET is_read = TRUE
      WHERE notification_id = $1
      RETURNING notification_id, user_id, type, message, is_read, created_at
    `;
    
    try {
      const result = await pool.query(query, [notificationId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  static async markAllAsRead(userId) {
    const query = `
      UPDATE notifications 
      SET is_read = TRUE
      WHERE user_id = $1 AND is_read = FALSE
      RETURNING notification_id, user_id, type, message, is_read, created_at
    `;
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  static async delete(notificationId) {
    const query = `DELETE FROM notifications WHERE notification_id = $1`;
    
    try {
      await pool.query(query, [notificationId]);
      return true;
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }

  static async deleteOldNotifications(userId, daysOld = 30) {
    const query = `
      DELETE FROM notifications 
      WHERE user_id = $1 AND created_at < NOW() - INTERVAL '${daysOld} days'
    `;
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rowCount;
    } catch (error) {
      console.error("Error deleting old notifications:", error);
      throw error;
    }
  }

  static async getNotificationStats(userId) {
    const query = `
      SELECT 
        COUNT(*) as total_notifications,
        COUNT(CASE WHEN is_read = FALSE THEN 1 END) as unread_notifications,
        COUNT(CASE WHEN type = 'task' THEN 1 END) as task_notifications,
        COUNT(CASE WHEN type = 'chat' THEN 1 END) as chat_notifications,
        COUNT(CASE WHEN type = 'event' THEN 1 END) as event_notifications
      FROM notifications 
      WHERE user_id = $1
    `;
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error getting notification stats:", error);
      throw error;
    }
  }

  // Helper methods for creating specific types of notifications
  static async createTaskNotification(userId, message) {
    return this.create({ userId, type: 'task', message });
  }

  static async createChatNotification(userId, message) {
    return this.create({ userId, type: 'chat', message });
  }

  static async createEventNotification(userId, message) {
    return this.create({ userId, type: 'event', message });
  }

  static async createSystemNotification(userId, message) {
    return this.create({ userId, type: 'system', message });
  }
}

module.exports = Notification;
