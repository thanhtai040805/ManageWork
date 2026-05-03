const pool = require("../../shared/config/database");

class ChannelCategory {
  static async create({ name, projectId, createdBy, position = 0 }) {
    const query = `
      INSERT INTO channel_categories (name, project_id, created_by, position)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [name, projectId, createdBy, position];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getByProject(projectId) {
    const query = `
      SELECT 
        cc.*,
        (
          SELECT json_agg(
            jsonb_build_object(
              'channel_id', c.channel_id,
              'name', c.name,
              'is_public', c.is_public,
              'description', c.description
            )
          )
          FROM channels c
          WHERE c.category_id = cc.category_id
        ) as channels
      FROM channel_categories cc
      WHERE cc.project_id = $1
      ORDER BY cc.position ASC
    `;
    const { rows } = await pool.query(query, [projectId]);
    return rows;
  }

  static async getById(categoryId) {
    const query = `SELECT * FROM channel_categories WHERE category_id = $1`;
    const { rows } = await pool.query(query, [categoryId]);
    return rows[0];
  }

  static async update(categoryId, { name, position }, client = pool) {
    const query = `
      UPDATE channel_categories 
      SET name = COALESCE($2, name),
          position = COALESCE($3, position)
      WHERE category_id = $1
      RETURNING *
    `;
    const values = [categoryId, name, position];
    const { rows } = await client.query(query, values);
    return rows[0];
  }

  static async delete(categoryId, client = pool) {
    const query = `DELETE FROM channel_categories WHERE category_id = $1 RETURNING *`;
    const { rows } = await client.query(query, [categoryId]);
    return rows[0];
  }

  static async getNextPosition(projectId) {
    const query = `SELECT COALESCE(MAX(position), -1) + 1 as next_position 
                   FROM channel_categories WHERE project_id = $1`;
    const { rows } = await pool.query(query, [projectId]);
    return rows[0]?.next_position || 0;
  }
}

module.exports = ChannelCategory;