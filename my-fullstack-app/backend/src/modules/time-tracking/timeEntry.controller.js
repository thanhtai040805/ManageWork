const TimeEntry = require("./timeEntry.model");

const createEntry = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const { taskId, durationMinutes, description, startedAt } = req.body;
    const entry = await TimeEntry.create({ taskId, userId, durationMinutes, description, startedAt });
    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
};

const getUserEntries = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const { limit = 50 } = req.query;
    const entries = await TimeEntry.getUserEntries(userId, limit);
    res.json(entries);
  } catch (error) {
    next(error);
  }
};

const getTaskEntries = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const entries = await TimeEntry.getTaskEntries(taskId);
    res.json(entries);
  } catch (error) {
    next(error);
  }
};

const deleteEntry = async (req, res, next) => {
  try {
    const { entryId } = req.params;
    await TimeEntry.delete(entryId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

const getTaskTotalTime = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const total = await TimeEntry.getTotalTimeByTask(taskId);
    res.json({ totalMinutes: parseInt(total) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEntry,
  getUserEntries,
  getTaskEntries,
  deleteEntry,
  getTaskTotalTime
};