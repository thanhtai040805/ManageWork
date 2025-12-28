const pool = require("../config/database");

class RecurringTask {
  static async create(recurringTaskData) {
    const {
      projectId,
      title,
      description,
      priority,
      startDate,
      endDate,
      repeatType,
      repeatDays,
      createdBy,
      assignedTo,
    } = recurringTaskData;

    const query = `
      INSERT INTO recurring_tasks (
        project_id, title, description, priority,
        start_date, end_date, repeat_type, repeat_days,
        created_by, assigned_to, is_active, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5::timestamp, $6::timestamp, $7, $8::integer[], $9, $10, TRUE, NOW(), NOW())
      RETURNING recurring_task_id, project_id, title, description, priority,
                start_date::text as start_date, end_date::text as end_date,
                repeat_type, repeat_days, created_by, assigned_to, is_active,
                created_at::text as created_at, updated_at::text as updated_at
    `;

    try {
      const result = await pool.query(query, [
        projectId,
        title,
        description,
        priority || 'medium',
        startDate,
        endDate,
        repeatType,
        repeatDays || [],
        createdBy,
        assignedTo,
      ]);

      const recurringTask = result.rows[0];
      // Convert timestamp strings to ISO format
      if (recurringTask) {
        ['start_date', 'end_date', 'created_at', 'updated_at'].forEach(field => {
          if (recurringTask[field]) {
            const ts = recurringTask[field].includes('+') || recurringTask[field].endsWith('Z')
              ? recurringTask[field]
              : recurringTask[field] + 'Z';
            recurringTask[field] = new Date(ts).toISOString();
          }
        });
      }
      return recurringTask;
    } catch (error) {
      console.error("Error creating recurring task:", error);
      throw error;
    }
  }

  static async findById(recurringTaskId) {
    const query = `
      SELECT recurring_task_id, project_id, title, description, priority,
             start_date::text as start_date, end_date::text as end_date,
             repeat_type, repeat_days, created_by, assigned_to, is_active,
             created_at::text as created_at, updated_at::text as updated_at
      FROM recurring_tasks
      WHERE recurring_task_id = $1
    `;

    try {
      const result = await pool.query(query, [recurringTaskId]);
      if (result.rows.length === 0) return null;

      const recurringTask = result.rows[0];
      ['start_date', 'end_date', 'created_at', 'updated_at'].forEach(field => {
        if (recurringTask[field]) {
          const ts = recurringTask[field].includes('+') || recurringTask[field].endsWith('Z')
            ? recurringTask[field]
            : recurringTask[field] + 'Z';
          recurringTask[field] = new Date(ts).toISOString();
        }
      });
      return recurringTask;
    } catch (error) {
      console.error("Error finding recurring task:", error);
      throw error;
    }
  }

  static async update(recurringTaskId, updateData) {
    const {
      title,
      description,
      priority,
      startDate,
      endDate,
      repeatType,
      repeatDays,
      assignedTo,
      isActive,
    } = updateData;

    const query = `
      UPDATE recurring_tasks
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          priority = COALESCE($3, priority),
          start_date = COALESCE($4::timestamp, start_date),
          end_date = COALESCE($5::timestamp, end_date),
          repeat_type = COALESCE($6, repeat_type),
          repeat_days = COALESCE($7::integer[], repeat_days),
          assigned_to = COALESCE($8, assigned_to),
          is_active = COALESCE($9, is_active),
          updated_at = NOW()
      WHERE recurring_task_id = $10
      RETURNING recurring_task_id, project_id, title, description, priority,
                start_date::text as start_date, end_date::text as end_date,
                repeat_type, repeat_days, created_by, assigned_to, is_active,
                created_at::text as created_at, updated_at::text as updated_at
    `;

    try {
      const result = await pool.query(query, [
        title,
        description,
        priority,
        startDate,
        endDate,
        repeatType,
        repeatDays,
        assignedTo,
        isActive,
        recurringTaskId,
      ]);

      const recurringTask = result.rows[0];
      if (recurringTask) {
        ['start_date', 'end_date', 'created_at', 'updated_at'].forEach(field => {
          if (recurringTask[field]) {
            const ts = recurringTask[field].includes('+') || recurringTask[field].endsWith('Z')
              ? recurringTask[field]
              : recurringTask[field] + 'Z';
            recurringTask[field] = new Date(ts).toISOString();
          }
        });
      }
      return recurringTask;
    } catch (error) {
      console.error("Error updating recurring task:", error);
      throw error;
    }
  }

  static async delete(recurringTaskId) {
    const query = `DELETE FROM recurring_tasks WHERE recurring_task_id = $1`;
    try {
      await pool.query(query, [recurringTaskId]);
    } catch (error) {
      console.error("Error deleting recurring task:", error);
      throw error;
    }
  }

  // Get all future tasks (not done) for a recurring task
  static async getFutureTasks(recurringTaskId, fromDate) {
    const query = `
      SELECT task_id, due_date::text as due_date, status
      FROM tasks
      WHERE recurring_task_id = $1
        AND due_date >= $2::timestamp
        AND status != 'done'
      ORDER BY due_date ASC
    `;

    try {
      const result = await pool.query(query, [recurringTaskId, fromDate]);
      return result.rows.map(row => ({
        ...row,
        due_date: new Date(row.due_date).toISOString(),
      }));
    } catch (error) {
      console.error("Error getting future tasks:", error);
      throw error;
    }
  }
}

module.exports = RecurringTask;

