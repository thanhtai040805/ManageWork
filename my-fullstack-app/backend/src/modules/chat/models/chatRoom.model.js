const pool = require("../../../shared/config/database");

class ChatRoom {
  static async create({ name, isGroup, createdBy, avatarUrl = null, description = null }) {
    const query = `Insert into chat_rooms (name, is_group , created_by, avatar_url, description) values ($1 , $2 , $3, $4, $5) returning *`;
    const values = [name, isGroup, createdBy, avatarUrl, description];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getRoomsByUser(userId) {
    const query = `
    SELECT 
      r.room_id,
      r.name,
      r.is_group,
      r.created_by,
      r.last_message_at,
      r.avatar_url,
      r.description,
      r.is_pinned,
      m.last_read_message_id,
      m.last_read_at,
      m.role,
      m.unread_count,
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'user_id', u.user_id,
            'name', u.full_name,
            'avatar_url', u.avatar_url
          )
        ) FILTER (WHERE u.user_id IS NOT NULL),
        '[]'
      ) AS members,
      (
        ARRAY_AGG(u.user_id) 
        FILTER (WHERE u.user_id != $1)
      )[1] AS partner_id,

      (
        ARRAY_AGG(u.full_name) 
        FILTER (WHERE u.user_id != $1)
      )[1] AS partner_name,
      
      (
        ARRAY_AGG(u.avatar_url) 
        FILTER (WHERE u.user_id != $1)
      )[1] AS partner_avatar,
      lm.content as last_message_content,
      lmu.full_name as last_message_sender_name,
      CASE 
        WHEN r.is_group = false THEN (
          ARRAY_AGG(u.full_name) FILTER (WHERE u.user_id != $1)
        )[1]
        ELSE r.name
      END AS display_name
    FROM chat_rooms r
    JOIN chat_room_members m 
      ON r.room_id = m.room_id
      AND m.user_id = $1
    JOIN chat_room_members am
      ON am.room_id = r.room_id
    JOIN users u
      ON u.user_id = am.user_id
    LEFT JOIN messages lm
      ON r.last_message_id = lm.message_id
    LEFT JOIN users lmu
      ON lm.sender_id = lmu.user_id
    GROUP BY 
      r.room_id, r.name, r.is_group, r.created_by, r.last_message_at, r.avatar_url, r.description, r.is_pinned,
      m.last_read_message_id, m.last_read_at, m.role, m.unread_count,
      lm.content, lmu.full_name
    ORDER BY r.is_pinned DESC, r.last_message_at DESC;
    `;

    const { rows } = await pool.query(query, [userId]);
    return rows;
  }

  static async togglePin(roomId, isPinned) {
    const query = `
      UPDATE chat_rooms 
      SET is_pinned = $2, pinned_at = CASE WHEN $2 = true THEN NOW() ELSE NULL END
      WHERE room_id = $1
      RETURNING *
    `;
    const { rows } = await pool.query(query, [roomId, isPinned]);
    return rows[0];
  }

  static async getRoomById(roomId) {
    const query = `SELECT * FROM chat_rooms where room_id = $1`;
    const values = [roomId];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async updateRoom(roomId, { name, avatarUrl, description }, client = pool) {
    const query = `
      UPDATE chat_rooms 
      SET name = COALESCE($2, name), 
          avatar_url = COALESCE($3, avatar_url), 
          description = COALESCE($4, description) 
      WHERE room_id = $1 
      RETURNING *
    `;
    const values = [roomId, name, avatarUrl, description];
    const { rows } = await client.query(query, values);
    return rows[0];
  }

  static async updateLastMessage(roomId, lastMessageId, client = pool) {
    const query =
      "UPDATE chat_rooms set last_message_at = NOW() , last_message_id = $2 WHERE room_id = $1";
    const values = [roomId, lastMessageId];
    await client.query(query, values);
    return true;
  }

  static async getLastMessageId(roomId) {
    const query = `SELECT last_message_id FROM chat_rooms WHERE room_id = $1`;
    const values = [roomId];
    const { rows } = await pool.query(query, values);
    return rows?.[0]?.last_message_id || null;
  }

  static async searchChatRoomsAndUsers(keyword, userId) {
    const query = `
    SELECT 
      c.room_id,
      c.name AS room_name,
      NULL AS user_id,
      NULL AS full_name,
      'room' AS type
    FROM chat_rooms c
    WHERE c.name ILIKE $1

    UNION

    SELECT
      NULL AS room_id,
      NULL AS room_name,
      u.user_id,
      u.full_name,
      'user' AS type
    FROM users u
    WHERE u.full_name ILIKE $1
    AND u.user_id != $2

    ORDER BY type ASC;
  `;

    const values = [`%${keyword}%`, userId];
    const result = await pool.query(query, values);
    return result.rows;
  }
}

module.exports = ChatRoom;
