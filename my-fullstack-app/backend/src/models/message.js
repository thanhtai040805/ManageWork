const pool = require("../config/database");

class Message {
  static async create({ roomId, senderId, content, messageType = "text" }) {
    const query = `Insert into messages (room_id, sender_id, content, message_type, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING message_id, room_id, sender_id, content, message_type, created_at`;
    const values = [roomId, senderId, content, messageType];
    const result = await pool.query(query, values);
    const message = result.rows[0];
    return message;
  }

  static async firstTimeGetMessages({ roomId, limit = 50 }) {
    const query = `
            SELECT *
            FROM messages
            WHERE room_id = $1
            ORDER BY created_at DESC
            LIMIT $2
        `;
    const { rows } = await pool.query(query, [roomId, limit]);
    return rows.reverse(); // trả về theo thời gian tăng dần
  }

  static async getMessagesByCursor({
    roomId,
    cursorCreatedAt,
    cursorMessageId,
    limit = 50,
  }) {
    const query = `
    SELECT *
    FROM messages
    WHERE room_id = $1
      AND (
        created_at < $2
        OR (created_at = $2 AND message_id < $3)
      )
    ORDER BY created_at DESC, message_id DESC
    LIMIT $4
  `;
    const values = [roomId, cursorCreatedAt, cursorMessageId, limit];
    const { rows } = await pool.query(query, values);
    return rows.reverse();
  }

  static async updateContent({
    messageId,
    newContent
  }) {
    const query = `
    UPDATE messages set content = $2
    WHERE message_id = $1
    RETURNING *
  `;
    const values = [messageId, newContent];
    const { rows } = await pool.query(query, values);
    return rows?.[0] || null;
  }

  static async findById(messageId) {
    const query = `
    SELECT * FROM messages WHERE message_id = $1`
    const values = [messageId];
    const { rows} = await pool.query(query, values)
    return rows?.[0] || null;
  }

  static async softDeleteMessage(messageId) {
    const query = `
    UPDATE messages set is_deleted = TRUE
    WHERE message_id = $1`;
    const values = [messageId];
    const { rows } = await pool.query(query, values);
    return rows?.[0] || null;
  }

  static async searchMessages({ roomId, queryText}) {
    const query = `
    SELECT * FROM messages 
    WHERE room_id = $1 AND content LIKE '%$2%'
    `;
    const values = [roomId, queryText];
    const { rows } = await pool.query(query, values);
    return rows
  }
}


module.exports = Message;