const pool = require("../config/database");

class Event {
  static async create(eventData) {
    const { userId, title, description, startTime, endTime, location } = eventData;
    const query = `
      INSERT INTO events (user_id, title, description, start_time, end_time, location, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING event_id, user_id, title, description, start_time, end_time, location, created_at
    `;
    
    try {
      const result = await pool.query(query, [userId, title, description, startTime, endTime, location]);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  }

  static async findById(eventId) {
    const query = `
      SELECT e.event_id, e.user_id, e.title, e.description, e.start_time, e.end_time, e.location, e.created_at,
             u.username, u.full_name, u.avatar_url
      FROM events e
      JOIN users u ON e.user_id = u.user_id
      WHERE e.event_id = $1
    `;
    
    try {
      const result = await pool.query(query, [eventId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error finding event by id:", error);
      throw error;
    }
  }

  static async getUserEvents(userId, startDate = null, endDate = null) {
    let query = `
      SELECT e.event_id, e.user_id, e.title, e.description, e.start_time, e.end_time, e.location, e.created_at
      FROM events e
      WHERE e.user_id = $1
    `;
    const params = [userId];

    if (startDate && endDate) {
      query += ` AND e.start_time >= $2 AND e.end_time <= $3`;
      params.push(startDate, endDate);
    } else if (startDate) {
      query += ` AND e.start_time >= $2`;
      params.push(startDate);
    } else if (endDate) {
      query += ` AND e.end_time <= $2`;
      params.push(endDate);
    }

    query += ` ORDER BY e.start_time ASC`;

    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error("Error getting user events:", error);
      throw error;
    }
  }

  static async getUpcomingEvents(userId, limit = 10) {
    const query = `
      SELECT e.event_id, e.user_id, e.title, e.description, e.start_time, e.end_time, e.location, e.created_at
      FROM events e
      WHERE e.user_id = $1 AND e.start_time > NOW()
      ORDER BY e.start_time ASC
      LIMIT $2
    `;
    
    try {
      const result = await pool.query(query, [userId, limit]);
      return result.rows;
    } catch (error) {
      console.error("Error getting upcoming events:", error);
      throw error;
    }
  }

  static async update(eventId, updateData) {
    const { title, description, startTime, endTime, location } = updateData;
    const query = `
      UPDATE events 
      SET title = $1, description = $2, start_time = $3, end_time = $4, location = $5
      WHERE event_id = $6
      RETURNING event_id, user_id, title, description, start_time, end_time, location, created_at
    `;
    
    try {
      const result = await pool.query(query, [title, description, startTime, endTime, location, eventId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  }

  static async delete(eventId) {
    const query = `DELETE FROM events WHERE event_id = $1`;
    
    try {
      await pool.query(query, [eventId]);
      return true;
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  }

  static async getEventStats(userId) {
    const query = `
      SELECT 
        COUNT(*) as total_events,
        COUNT(CASE WHEN start_time > NOW() THEN 1 END) as upcoming_events,
        COUNT(CASE WHEN start_time <= NOW() AND end_time >= NOW() THEN 1 END) as ongoing_events,
        COUNT(CASE WHEN end_time < NOW() THEN 1 END) as past_events
      FROM events 
      WHERE user_id = $1
    `;
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error getting event stats:", error);
      throw error;
    }
  }
}

class Reminder {
  static async create(reminderData) {
    const { eventId, remindAt } = reminderData;
    const query = `
      INSERT INTO reminders (event_id, remind_at, created_at)
      VALUES ($1, $2, NOW())
      RETURNING reminder_id, event_id, remind_at, created_at
    `;
    
    try {
      const result = await pool.query(query, [eventId, remindAt]);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating reminder:", error);
      throw error;
    }
  }

  static async getEventReminders(eventId) {
    const query = `
      SELECT reminder_id, event_id, remind_at, created_at
      FROM reminders 
      WHERE event_id = $1
      ORDER BY remind_at ASC
    `;
    
    try {
      const result = await pool.query(query, [eventId]);
      return result.rows;
    } catch (error) {
      console.error("Error getting event reminders:", error);
      throw error;
    }
  }

  static async getUpcomingReminders(userId, limit = 10) {
    const query = `
      SELECT r.reminder_id, r.event_id, r.remind_at, r.created_at,
             e.title as event_title, e.start_time
      FROM reminders r
      JOIN events e ON r.event_id = e.event_id
      WHERE e.user_id = $1 AND r.remind_at > NOW()
      ORDER BY r.remind_at ASC
      LIMIT $2
    `;
    
    try {
      const result = await pool.query(query, [userId, limit]);
      return result.rows;
    } catch (error) {
      console.error("Error getting upcoming reminders:", error);
      throw error;
    }
  }

  static async delete(reminderId) {
    const query = `DELETE FROM reminders WHERE reminder_id = $1`;
    
    try {
      await pool.query(query, [reminderId]);
      return true;
    } catch (error) {
      console.error("Error deleting reminder:", error);
      throw error;
    }
  }
}

module.exports = { Event, Reminder };
