const pool = require("../../shared/config/database");

class ProjectTemplate {
  static async create(templateData) {
    const { name, description, category, tasks } = templateData;
    const query = `
      INSERT INTO project_templates (name, description, category, tasks, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING template_id, name, description, category, tasks, created_at
    `;
    try {
      const result = await pool.query(query, [name, description, category, JSON.stringify(tasks || [])]);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating project template:", error);
      throw error;
    }
  }

  static async getAll() {
    const query = `SELECT * FROM project_templates ORDER BY name ASC`;
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error("Error getting project templates:", error);
      throw error;
    }
  }

  static async getById(templateId) {
    const query = `SELECT * FROM project_templates WHERE template_id = $1`;
    try {
      const result = await pool.query(query, [templateId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error getting template by id:", error);
      throw error;
    }
  }

  static async delete(templateId) {
    const query = `DELETE FROM project_templates WHERE template_id = $1`;
    try {
      await pool.query(query, [templateId]);
      return true;
    } catch (error) {
      console.error("Error deleting template:", error);
      throw error;
    }
  }

  static async getTaskTemplates(templateId) {
    const query = `SELECT * FROM task_templates WHERE template_id = $1 ORDER BY task_template_id ASC`;
    try {
      const result = await pool.query(query, [templateId]);
      return result.rows;
    } catch (error) {
      console.error("Error getting task templates:", error);
      throw error;
    }
  }

  static async createTaskTemplate(taskData) {
    const { templateId, title, description, priority, status } = taskData;
    const query = `
      INSERT INTO task_templates (template_id, title, description, priority, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING task_template_id, template_id, title, description, priority, status
    `;
    try {
      const result = await pool.query(query, [templateId, title, description, priority, status]);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating task template:", error);
      throw error;
    }
  }
}

module.exports = ProjectTemplate;