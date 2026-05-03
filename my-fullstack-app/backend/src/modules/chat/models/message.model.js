const pool = require("../../../shared/config/database");

class Message {
  static async create({ roomId, senderId, content, messageType = "text", parentMessageId = null }, client = pool) {
    const query = `
      Insert into messages (room_id, sender_id, content, message_type, parent_message_id, created_at) 
      VALUES ($1, $2, $3, $4, $5, NOW()) 
      RETURNING *
    `;
    const values = [roomId, senderId, content, messageType, parentMessageId];
    const result = await client.query(query, values);
    return result.rows[0];
  }

  static async firstTimeGetMessages({ roomId, limit = 50 }) {
    const query = `
      SELECT 
        m.*, 
        u.full_name as sender_name,
        u.avatar_url as sender_avatar,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'reaction_type', mr.reaction_type,
              'user_id', mr.user_id
            )
          ) FILTER (WHERE mr.reaction_id IS NOT NULL),
          '[]'
        ) AS reactions,
        (
          SELECT jsonb_build_object(
            'message_id', pm.message_id,
            'content', pm.content,
            'sender_id', pm.sender_id,
            'sender_name', pu.full_name
          )
          FROM messages pm
          JOIN users pu ON pm.sender_id = pu.user_id
          WHERE pm.message_id = m.parent_message_id
        ) AS parent_message
      FROM messages m
      JOIN users u ON m.sender_id = u.user_id
      LEFT JOIN message_reactions mr ON m.message_id = mr.message_id
      WHERE m.room_id = $1
      GROUP BY m.message_id, u.user_id
      ORDER BY m.created_at DESC
      LIMIT $2
    `;
    const { rows } = await pool.query(query, [roomId, limit]);
    return rows.reverse();
  }

  static async getMessagesByCursor({
    roomId,
    cursorCreatedAt,
    cursorMessageId,
    limit = 50,
  }) {
    const query = `
      SELECT 
        m.*, 
        u.full_name as sender_name,
        u.avatar_url as sender_avatar,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'reaction_type', mr.reaction_type,
              'user_id', mr.user_id
            )
          ) FILTER (WHERE mr.reaction_id IS NOT NULL),
          '[]'
        ) AS reactions,
        (
          SELECT jsonb_build_object(
            'message_id', pm.message_id,
            'content', pm.content,
            'sender_id', pm.sender_id,
            'sender_name', pu.full_name
          )
          FROM messages pm
          JOIN users pu ON pm.sender_id = pu.user_id
          WHERE pm.message_id = m.parent_message_id
        ) AS parent_message,
        COALESCE(
          (
            SELECT json_agg(
              jsonb_build_object(
                'attachment_id', ma.attachment_id,
                'attachment_url', ma.attachment_url,
                'attachment_type', ma.attachment_type
              )
            )
            FROM message_attachments ma
            WHERE ma.message_id = m.message_id
          ),
          '[]'
        ) AS attachments
      FROM messages m
      JOIN users u ON m.sender_id = u.user_id
      LEFT JOIN message_reactions mr ON m.message_id = mr.message_id
      WHERE m.room_id = $1
        AND (
          m.created_at < $2
          OR (m.created_at = $2 AND m.message_id < $3)
        )
      GROUP BY m.message_id, u.user_id
      ORDER BY m.created_at DESC, m.message_id DESC
      LIMIT $4
    `;
    const values = [roomId, cursorCreatedAt, cursorMessageId, limit];
    const { rows } = await pool.query(query, values);
    return rows.reverse();
  }

  static async togglePin(messageId, isPinned) {
    const query = `UPDATE messages SET is_pinned = $2 WHERE message_id = $1 RETURNING *`;
    const { rows } = await pool.query(query, [messageId, isPinned]);
    return rows[0];
  }

  static async getPinnedMessages(roomId) {
    const query = `SELECT * FROM messages WHERE room_id = $1 AND is_pinned = TRUE ORDER BY created_at DESC`;
    const { rows } = await pool.query(query, [roomId]);
    return rows;
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

  static async getFullMessage(messageId) {
    const query = `
      SELECT 
        m.*, 
        u.full_name as sender_name,
        u.avatar_url as sender_avatar,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'reaction_type', mr.reaction_type,
              'user_id', mr.user_id
            )
          ) FILTER (WHERE mr.reaction_id IS NOT NULL),
          '[]'
        ) AS reactions,
        (
          SELECT jsonb_build_object(
            'message_id', pm.message_id,
            'content', pm.content,
            'sender_id', pm.sender_id,
            'sender_name', pu.full_name
          )
          FROM messages pm
          JOIN users pu ON pm.sender_id = pu.user_id
          WHERE pm.message_id = m.parent_message_id
        ) AS parent_message,
        COALESCE(
          (
            SELECT json_agg(
              jsonb_build_object(
                'attachment_id', ma.attachment_id,
                'attachment_url', ma.attachment_url,
                'attachment_type', ma.attachment_type
              )
            )
            FROM message_attachments ma
            WHERE ma.message_id = m.message_id
          ),
          '[]'
        ) AS attachments
      FROM messages m
      JOIN users u ON m.sender_id = u.user_id
      LEFT JOIN message_reactions mr ON m.message_id = mr.message_id
      WHERE m.message_id = $1
      GROUP BY m.message_id, u.user_id
    `;
    const { rows } = await pool.query(query, [messageId]);
    return rows[0] || null;
  }

  static async searchMessages({ roomId, queryText}) {
    const query = `
    SELECT * FROM messages 
    WHERE room_id = $1 AND content LIKE $2
    `;
    const values = [roomId, `%${queryText}%` ];
    const { rows } = await pool.query(query, values);
    return rows
  }
}

module.exports = Message;
