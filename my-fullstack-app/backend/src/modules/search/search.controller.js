const pool = require("../../shared/config/database");

const globalSearch = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.json({ results: [] });
    }

    const searchTerm = `%${query}%`;

    // Search Projects
    const projectsQuery = "SELECT project_id, name, 'project' as type FROM projects WHERE name ILIKE $1 LIMIT 5";
    const { rows: projects } = await pool.query(projectsQuery, [searchTerm]);

    // Search Tasks
    const tasksQuery = "SELECT task_id, title as name, 'task' as type FROM tasks WHERE title ILIKE $1 LIMIT 5";
    const { rows: tasks } = await pool.query(tasksQuery, [searchTerm]);

    // Search Users
    const usersQuery = "SELECT user_id, username as name, 'user' as type FROM users WHERE username ILIKE $1 LIMIT 5";
    const { rows: users } = await pool.query(usersQuery, [searchTerm]);

    const results = [...projects, ...tasks, ...users];

    res.json({ results });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  globalSearch,
};
