const pool = require("../config/database");

class ChatRoomMembers {
  static async addMember(roomId, userId, role = "member") {
    const query =
      "INSERT INTO chat_room_members (room_id, user_id, role) VALUES ($1, $2, $3)  ON CONFLICT (room_id, user_id) DO NOTHING RETURNING room_id , user_id, role";
    const values = [roomId, userId, role];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  static async getMembersByRoom(roomId) {
    const query = `SELECT  u.user_id, u.full_name, u.avatar_url, m.role, m.joined_at
    FROM chat_room_members m JOIN users u ON m.user_id = u.user_id where room_id = $1`;
    const values = [roomId];
    const { rows } = await pool.query(query, values);
    return rows;
  }

  static async isMember(roomId, userId) {
    const query = `SELECT 1 FROM chat_room_members WHERE room_id = $1 AND user_id = $2`;
    const values = [roomId, userId];
    const { rowCount } = await pool.query(query, values);
    return rowCount > 0;
  }

  static async leaveRoom(roomId, userId) {
    const query = `DELETE FROM chat_room_members where room_id = $1 AND user_id = $2`;
    const values = [roomId, userId];
    const result = await pool.query(query, values);
    return result.rowCount > 0;
  }

  static async getRole(roomId, userId) {
    const query =
      "SELECT role FROM chat_room_members where room_id = $1 AND user_id = $2";
    const values = [roomId, userId];
    const { rows } = await pool.query(query, values);
    return rows[0]?.role || null;
  }

  static async updateRole(roomId, userId, newRole) {
    const query = `UPDATE chat_room_members set role = $1 where room_id = $2 AND user_id = $3 RETURNING role`
    const values = [newRole, roomId, userId];
    const { rows } = await pool.query(query, values);
    return rows[0]?.role || null;
  }

  static async markAsRead(roomId, userId , messageId) {
    const query = `UPDATE chat_room_members
    SET last_read_message_id = $1 , last_read_at = NOW() 
    WHERE room_id = $2 AND user_id = $3 RETURNING last_read_message_id , last_read_at`
    const values = [messageId , roomId , userId];
    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  }

  static async getUnreadCount(roomId, userId) {
    const query = ` SELECT unread_count
    FROM chat_room_members
    WHERE room_id = $1 AND user_id = $2`;
    const values = [roomId, userId];
    const { rows} = await pool.query(query, values);
    return rows[0]?.unread_count || null;
  }

  static async increaseUnreadCount(roomId, senderId) {
    const query = `UPDATE chat_room_members set unread_count = unread_count + 1 
    WHERE room_id = $1 AND user_id <> $2`
    const values = [roomId, senderId];
    const { rows } = await pool.query(query, values)
    return rows?.[0] || null;
  } 
}

module.exports = ChatRoomMembers;
