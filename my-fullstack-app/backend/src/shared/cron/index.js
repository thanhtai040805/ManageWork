const { startTaskOverdueJob } = require("./taskOverdue.job");

const initCronJobs = () => {
  startTaskOverdueJob();
};

module.exports = {
  initCronJobs,
};
