const pool = require("../config/database");

class ChatRoom {
  static async create({name , isGroup, createdBy}) {
    const query = `Insert into chat_rooms (name, is_group , created_by) values ($1 , $2 , $3) returning room_id, name , is_group , created_by , last_message_at`
    const values = [name , isGroup , createdBy];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getRoomsByUser(userId) {
    const query = `SELECT r.room_id , r.name , r.is_group, r.created_by , r.last_message_at , m.last_read_message_id , m.last_read_at , m.role 
    FROM chat_rooms as r INNER JOIN chat_room_members as m 
    ON r.room_id = m.room_id WHERE m.user_id = $1
    ORDER BY r.last_message_at DESC`
    const values = [userId];
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async getRoomById(roomId) {
    const query = `SELECT * FROM chat_rooms where room_id = $1`
    const values = [roomId];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async updateLastMessage (roomId, lastMessageId) {
    const query =
      "UPDATE chat_rooms set last_message_at = NOW() , last_message_id = $2 WHERE room_id = $1";
    const values = [roomId, lastMessageId]; 
    await pool.query(query, values);
    return true;
  }

  static async getLastMessageId (roomId) {
    const query = `SELECT last_message_id FROM chat_rooms WHERE room_id = $1`
    const values = [roomId];
    const { rows } = await pool.query(query, values);
    return rows?.[0] || null;
  }


}

module.exports = ChatRoom;