const pool = require("../../shared/config/database");

const getVelocityChart = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const { projectId } = req.query;
    
    // Velocity: Number of tasks completed per week for the last 12 weeks
    let query = `
      WITH RECURSIVE weeks AS (
        SELECT date_trunc('week', NOW() - INTERVAL '11 weeks') as week_start
        UNION ALL
        SELECT week_start + INTERVAL '1 week'
        FROM weeks
        WHERE week_start < date_trunc('week', NOW())
      )
      SELECT 
        to_char(w.week_start, 'YYYY-MM-DD') as week_start,
        COUNT(t.task_id) as completed_tasks
      FROM weeks w
      LEFT JOIN tasks t ON date_trunc('week', t.updated_at) = w.week_start 
        AND t.status = 'done'
    `;
    
    const params = [];
    
    if (projectId) {
      query += ` AND t.project_id = $1`;
      params.push(projectId);
    } else {
      query += ` AND t.assigned_to = $1`;
      params.push(userId);
    }
    
    query += ` GROUP BY w.week_start ORDER BY w.week_start ASC`;
    
    const result = await pool.query(query, params);
    
    res.status(200).json({ status: "success", data: result.rows });
  } catch (error) {
    next(error);
  }
};

const getBurndownChart = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    // Burndown: Total tasks vs remaining tasks per day since project start
    const query = `
      WITH project_dates AS (
        SELECT start_date, end_date, created_at 
        FROM projects 
        WHERE project_id = $1
      ),
      date_range AS (
        SELECT generate_series(
          date_trunc('day', (SELECT created_at FROM project_dates)),
          date_trunc('day', COALESCE((SELECT end_date FROM project_dates), NOW())),
          '1 day'::interval
        ) as day
      ),
      daily_stats AS (
        SELECT 
          d.day,
          (SELECT COUNT(*) FROM tasks t WHERE t.project_id = $1 AND t.created_at <= d.day + INTERVAL '1 day') as total_tasks,
          (SELECT COUNT(*) FROM tasks t WHERE t.project_id = $1 AND t.created_at <= d.day + INTERVAL '1 day' AND (t.status != 'done' OR t.updated_at > d.day + INTERVAL '1 day')) as remaining_tasks
        FROM date_range d
      )
      SELECT 
        to_char(day, 'YYYY-MM-DD') as date,
        total_tasks,
        remaining_tasks
      FROM daily_stats
      ORDER BY day ASC;
    `;
    
    const result = await pool.query(query, [projectId]);
    res.status(200).json({ status: "success", data: result.rows });
  } catch (error) {
    next(error);
  }
};

const getPerformanceMetrics = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const { projectId } = req.query;
    
    let overdueQuery = `
      SELECT COUNT(*) as count 
      FROM tasks 
      WHERE status != 'done' AND due_date < NOW()
    `;
    
    let totalQuery = `
      SELECT COUNT(*) as count FROM tasks WHERE 1=1
    `;
    
    let leadTimeQuery = `
      SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/86400) as avg_lead_time_days
      FROM tasks 
      WHERE status = 'done'
    `;
    
    const params = [];
    if (projectId) {
      overdueQuery += ` AND project_id = $1`;
      totalQuery += ` AND project_id = $1`;
      leadTimeQuery += ` AND project_id = $1`;
      params.push(projectId);
    } else {
      overdueQuery += ` AND assigned_to = $1`;
      totalQuery += ` AND assigned_to = $1`;
      leadTimeQuery += ` AND assigned_to = $1`;
      params.push(userId);
    }
    
    const [overdueRes, totalRes, leadTimeRes] = await Promise.all([
      pool.query(overdueQuery, params),
      pool.query(totalQuery, params),
      pool.query(leadTimeQuery, params)
    ]);
    
    const overdueCount = parseInt(overdueRes.rows[0].count);
    const totalCount = parseInt(totalRes.rows[0].count);
    const overdueRate = totalCount > 0 ? (overdueCount / totalCount) * 100 : 0;
    
    const avgLeadTime = leadTimeRes.rows[0].avg_lead_time_days ? parseFloat(leadTimeRes.rows[0].avg_lead_time_days).toFixed(1) : 0;
    
    res.status(200).json({
      status: "success",
      data: {
        overdueRate: parseFloat(overdueRate.toFixed(1)),
        avgLeadTimeDays: parseFloat(avgLeadTime),
        totalTasks: totalCount,
        overdueTasks: overdueCount
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVelocityChart,
  getBurndownChart,
  getPerformanceMetrics
};
