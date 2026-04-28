const pool = require("../../../shared/config/database");

class MessageReaction {
  static async toggle({ messageId, userId, reactionType }) {
    // Check if reaction already exists
    const checkQuery = `
      SELECT reaction_id FROM message_reactions 
      WHERE message_id = $1 AND user_id = $2 AND reaction_type = $3
    `;
    const checkResult = await pool.query(checkQuery, [messageId, userId, reactionType]);

    if (checkResult.rows.length > 0) {
      // Remove reaction if it exists
      const deleteQuery = `DELETE FROM message_reactions WHERE reaction_id = $1`;
      await pool.query(deleteQuery, [checkResult.rows[0].reaction_id]);
      return { action: "removed", reactionType };
    } else {
      // Add reaction if it doesn't exist
      const insertQuery = `
        INSERT INTO message_reactions (message_id, user_id, reaction_type)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const result = await pool.query(insertQuery, [messageId, userId, reactionType]);
      return { action: "added", reaction: result.rows[0] };
    }
  }

  static async getByMessage(messageId) {
    const query = `
      SELECT mr.*, u.full_name, u.username 
      FROM message_reactions mr
      JOIN users u ON mr.user_id = u.user_id
      WHERE mr.message_id = $1
      ORDER BY mr.created_at ASC
    `;
    const { rows } = await pool.query(query, [messageId]);
    return rows;
  }

  static async getReactionsCount(messageId) {
    const query = `
      SELECT reaction_type, COUNT(*) as count 
      FROM message_reactions 
      WHERE message_id = $1 
      GROUP BY reaction_type
    `;
    const { rows } = await pool.query(query, [messageId]);
    return rows;
  }
}

module.exports = MessageReaction;
