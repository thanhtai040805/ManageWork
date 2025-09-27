const pool = require("../config/database");

class ChatRoom {
  static async create(roomData) {
    const { name, isGroup } = roomData;
    const query = `
      INSERT INTO chat_rooms (name, is_group, created_at)
      VALUES ($1, $2, NOW())
      RETURNING room_id, name, is_group, created_at
    `;
    
    try {
      const result = await pool.query(query, [name, isGroup]);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating chat room:", error);
      throw error;
    }
  }

  static async findById(roomId) {
    const query = `
      SELECT room_id, name, is_group, created_at
      FROM chat_rooms 
      WHERE room_id = $1
    `;
    
    try {
      const result = await pool.query(query, [roomId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error finding chat room by id:", error);
      throw error;
    }
  }

  static async getUserRooms(userId) {
    const query = `
      SELECT cr.room_id, cr.name, cr.is_group, cr.created_at, crm.joined_at
      FROM chat_rooms cr
      JOIN chat_room_members crm ON cr.room_id = crm.room_id
      WHERE crm.user_id = $1
      ORDER BY crm.joined_at DESC
    `;
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error("Error getting user chat rooms:", error);
      throw error;
    }
  }

  static async addMember(roomId, userId) {
    const query = `
      INSERT INTO chat_room_members (room_id, user_id, joined_at)
      VALUES ($1, $2, NOW())
      RETURNING room_id, user_id, joined_at
    `;
    
    try {
      const result = await pool.query(query, [roomId, userId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error adding member to chat room:", error);
      throw error;
    }
  }

  static async removeMember(roomId, userId) {
    const query = `DELETE FROM chat_room_members WHERE room_id = $1 AND user_id = $2`;
    
    try {
      await pool.query(query, [roomId, userId]);
      return true;
    } catch (error) {
      console.error("Error removing member from chat room:", error);
      throw error;
    }
  }

  static async getRoomMembers(roomId) {
    const query = `
      SELECT u.user_id, u.username, u.full_name, u.avatar_url, crm.joined_at
      FROM chat_room_members crm
      JOIN users u ON crm.user_id = u.user_id
      WHERE crm.room_id = $1
      ORDER BY crm.joined_at ASC
    `;
    
    try {
      const result = await pool.query(query, [roomId]);
      return result.rows;
    } catch (error) {
      console.error("Error getting room members:", error);
      throw error;
    }
  }
}

class Message {
  static async create(messageData) {
    const { roomId, senderId, content, messageType = 'text' } = messageData;
    const query = `
      INSERT INTO messages (room_id, sender_id, content, message_type, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING message_id, room_id, sender_id, content, message_type, created_at
    `;
    
    try {
      const result = await pool.query(query, [roomId, senderId, content, messageType]);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating message:", error);
      throw error;
    }
  }

  static async getRoomMessages(roomId, limit = 50, offset = 0) {
    const query = `
      SELECT m.message_id, m.room_id, m.sender_id, m.content, m.message_type, m.created_at,
             u.username, u.full_name, u.avatar_url
      FROM messages m
      JOIN users u ON m.sender_id = u.user_id
      WHERE m.room_id = $1
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    try {
      const result = await pool.query(query, [roomId, limit, offset]);
      return result.rows.reverse(); // Reverse to get chronological order
    } catch (error) {
      console.error("Error getting room messages:", error);
      throw error;
    }
  }

  static async findById(messageId) {
    const query = `
      SELECT m.message_id, m.room_id, m.sender_id, m.content, m.message_type, m.created_at,
             u.username, u.full_name, u.avatar_url
      FROM messages m
      JOIN users u ON m.sender_id = u.user_id
      WHERE m.message_id = $1
    `;
    
    try {
      const result = await pool.query(query, [messageId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error finding message by id:", error);
      throw error;
    }
  }

  static async update(messageId, updateData) {
    const { content } = updateData;
    const query = `
      UPDATE messages 
      SET content = $1
      WHERE message_id = $2
      RETURNING message_id, room_id, sender_id, content, message_type, created_at
    `;
    
    try {
      const result = await pool.query(query, [content, messageId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error updating message:", error);
      throw error;
    }
  }

  static async delete(messageId) {
    const query = `DELETE FROM messages WHERE message_id = $1`;
    
    try {
      await pool.query(query, [messageId]);
      return true;
    } catch (error) {
      console.error("Error deleting message:", error);
      throw error;
    }
  }

  static async getMessageStats(roomId) {
    const query = `
      SELECT 
        COUNT(*) as total_messages,
        COUNT(CASE WHEN message_type = 'text' THEN 1 END) as text_messages,
        COUNT(CASE WHEN message_type = 'image' THEN 1 END) as image_messages,
        COUNT(CASE WHEN message_type = 'file' THEN 1 END) as file_messages
      FROM messages 
      WHERE room_id = $1
    `;
    
    try {
      const result = await pool.query(query, [roomId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error getting message stats:", error);
      throw error;
    }
  }
}

module.exports = { ChatRoom, Message };
