const pool = require("../../shared/config/database");

class ChannelPost {
  static async create({ channelId, authorId, content }) {
    const query = `
      INSERT INTO channel_posts (channel_id, author_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [channelId, authorId, content];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getByChannel(channelId, limit = 50) {
    const query = `
      SELECT 
        p.*,
        u.username as author_username,
        u.full_name as author_name,
        u.avatar_url as author_avatar,
        (SELECT COUNT(*) FROM channel_replies WHERE post_id = p.post_id) as reply_count
      FROM channel_posts p
      JOIN users u ON p.author_id = u.user_id
      WHERE p.channel_id = $1
      ORDER BY p.is_pinned DESC, p.created_at ASC
      LIMIT $2
    `;
    const { rows } = await pool.query(query, [channelId, limit]);
    return rows;
  }

  static async getById(postId) {
    const query = `
      SELECT 
        p.*,
        u.username as author_username,
        u.full_name as author_name,
        u.avatar_url as author_avatar
      FROM channel_posts p
      JOIN users u ON p.author_id = u.user_id
      WHERE p.post_id = $1
    `;
    const { rows } = await pool.query(query, [postId]);
    return rows[0];
  }

  static async togglePin(postId, isPinned) {
    const query = `
      UPDATE channel_posts 
      SET is_pinned = $2, updated_at = NOW()
      WHERE post_id = $1
      RETURNING *
    `;
    const { rows } = await pool.query(query, [postId, isPinned]);
    return rows[0];
  }

  static async update(postId, authorId, content) {
    const query = `
      UPDATE channel_posts 
      SET content = $3, updated_at = NOW()
      WHERE post_id = $1 AND author_id = $2
      RETURNING *
    `;
    const { rows } = await pool.query(query, [postId, authorId, content]);
    return rows[0];
  }

  static async delete(postId, authorId) {
    const query = `
      DELETE FROM channel_posts 
      WHERE post_id = $1 AND author_id = $2
      RETURNING *
    `;
    const { rows } = await pool.query(query, [postId, authorId]);
    return rows[0];
  }
}

module.exports = ChannelPost;