const pool = require("../../shared/config/database");

class ChannelReply {
  static async create({ postId, authorId, content }) {
    const query = `
      INSERT INTO channel_replies (post_id, author_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [postId, authorId, content];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getByPost(postId) {
    const query = `
      SELECT 
        r.*,
        u.username as author_username,
        u.full_name as author_name,
        u.avatar_url as author_avatar
      FROM channel_replies r
      JOIN users u ON r.author_id = u.user_id
      WHERE r.post_id = $1
      ORDER BY r.created_at ASC
    `;
    const { rows } = await pool.query(query, [postId]);
    return rows;
  }

  static async update(replyId, authorId, content) {
    const query = `
      UPDATE channel_replies 
      SET content = $3, updated_at = NOW()
      WHERE reply_id = $1 AND author_id = $2
      RETURNING *
    `;
    const { rows } = await pool.query(query, [replyId, authorId, content]);
    return rows[0];
  }

  static async delete(replyId, authorId) {
    const query = `
      DELETE FROM channel_replies 
      WHERE reply_id = $1 AND author_id = $2
      RETURNING *
    `;
    const { rows } = await pool.query(query, [replyId, authorId]);
    return rows[0];
  }
}

module.exports = ChannelReply;