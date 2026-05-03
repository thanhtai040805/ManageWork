const pool = require("../../shared/config/database");

class Channel {
  static async create({ name, categoryId, projectId, isPublic = true, description = null, createdBy }) {
    const query = `
      INSERT INTO channels (name, category_id, project_id, is_public, description, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [name, categoryId, projectId, isPublic, description, createdBy];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getByProject(projectId) {
    const query = `
      SELECT 
        c.*,
        cc.name as category_name,
        (
          SELECT json_agg(
            jsonb_build_object(
              'user_id', u.user_id,
              'full_name', u.full_name,
              'avatar_url', u.avatar_url
            )
          ) FROM channel_members cm
          JOIN users u ON cm.user_id = u.user_id
          WHERE cm.channel_id = c.channel_id
        ) as members
      FROM channels c
      LEFT JOIN channel_categories cc ON c.category_id = cc.category_id
      WHERE c.project_id = $1
      ORDER BY c.created_at ASC
    `;
    const { rows } = await pool.query(query, [projectId]);
    return rows;
  }

  static async getById(channelId) {
    const query = `
      SELECT 
        c.*,
        cc.name as category_name,
        p.name as project_name
      FROM channels c
      LEFT JOIN channel_categories cc ON c.category_id = cc.category_id
      LEFT JOIN projects p ON c.project_id = p.project_id
      WHERE c.channel_id = $1
    `;
    const { rows } = await pool.query(query, [channelId]);
    return rows[0];
  }

  static async getUserChannels(userId, projectId = null) {
    let query = `
      SELECT 
        c.*,
        cc.name as category_name,
        p.name as project_name,
        cm.role as member_role
      FROM channels c
      LEFT JOIN channel_categories cc ON c.category_id = cc.category_id
      LEFT JOIN projects p ON c.project_id = p.project_id
      LEFT JOIN channel_members cm ON c.channel_id = cm.channel_id AND cm.user_id = $1
      WHERE (c.is_public = true OR cm.user_id = $1)
    `;
    const values = [userId];

    if (projectId) {
      query += ` AND c.project_id = $2`;
      values.push(projectId);
    }

    query += ` ORDER BY COALESCE(cc.position, 999) ASC, c.name ASC`;

    const { rows } = await pool.query(query, values);
    return rows;
  }

  static async update(channelId, { name, description, isPublic, categoryId }, client = pool) {
    const query = `
      UPDATE channels 
      SET name = COALESCE($2, name),
          description = COALESCE($3, description),
          is_public = COALESCE($4, is_public),
          category_id = COALESCE($5, category_id)
      WHERE channel_id = $1
      RETURNING *
    `;
    const values = [channelId, name, description, isPublic, categoryId];
    const { rows } = await client.query(query, values);
    return rows[0];
  }

  static async delete(channelId, client = pool) {
    const query = `DELETE FROM channels WHERE channel_id = $1 RETURNING *`;
    const { rows } = await client.query(query, [channelId]);
    return rows[0];
  }

  static async addMember(channelId, userId, role = 'member', client = pool) {
    const query = `
      INSERT INTO channel_members (channel_id, user_id, role)
      VALUES ($1, $2, $3)
      ON CONFLICT (channel_id, user_id) 
      DO UPDATE SET role = $3
      RETURNING *
    `;
    const values = [channelId, userId, role];
    const { rows } = await client.query(query, values);
    return rows[0];
  }

  static async removeMember(channelId, userId, client = pool) {
    const query = `DELETE FROM channel_members WHERE channel_id = $1 AND user_id = $2`;
    await client.query(query, [channelId, userId]);
    return true;
  }

  static async getMembers(channelId) {
    const query = `
      SELECT 
        u.user_id,
        u.full_name,
        u.email,
        u.avatar_url,
        cm.role,
        cm.joined_at
      FROM channel_members cm
      JOIN users u ON cm.user_id = u.user_id
      WHERE cm.channel_id = $1
      ORDER BY cm.joined_at ASC
    `;
    const { rows } = await pool.query(query, [channelId]);
    return rows;
  }
}

module.exports = Channel;