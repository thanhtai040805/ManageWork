const pool = require("../../../shared/config/database");

class MessageAttachment {
  static async create(messageId, attachmentUrl, attachmentType, client = pool) {
    const query = `
      INSERT INTO message_attachments (message_id, attachment_url, attachment_type)
      VALUES ($1, $2, $3)
      RETURNING *`;
    const values = [messageId, attachmentUrl, attachmentType];
    const result = await client.query(query, values);
    return result.rows[0];
  }

  static async findByMessageId(messageId) {
    const query = `
      SELECT * FROM message_attachments
      WHERE message_id = $1`;
    const values = [messageId];
    const result = await pool.query(query, values);
    return result.rows;
  }
}

module.exports = MessageAttachment;
