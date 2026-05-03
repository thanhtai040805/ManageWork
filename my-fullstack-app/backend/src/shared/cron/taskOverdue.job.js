const cron = require("node-cron");
const pool = require("../config/database");
const logger = require("../utils/logger");

const startTaskOverdueJob = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      await pool.query(`
                UPDATE tasks 
                SET status = 'overdue' WHERE due_date < NOW() AND status IN ('todo', 'in_progress');`);
      logger.info("Overdue tasks updated successfully");
    } catch (error) {
      logger.error("Error getting overdue tasks", { error: error.message });
    }
  });
};

module.exports = {
  startTaskOverdueJob,
};