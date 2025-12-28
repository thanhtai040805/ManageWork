const cron = require("node-cron");
const pool = require("../config/database");

const startTaskOverdueJob = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      await pool.query(`
                UPDATE tasks 
                SET status = 'overdue' WHERE due_date < NOW() AND status IN ('todo', 'in_progress');`);
      console.log("Overdue tasks updated successfully");
    } catch (error) {
      console.error("Error getting overdue tasks:", error);
    }
  });
};

module.exports = {
  startTaskOverdueJob,
};