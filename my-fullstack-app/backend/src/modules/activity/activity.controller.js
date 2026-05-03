const express = require("express");
const router = express.Router();
const ActivityLog = require("../../shared/models/activityLog.model");

const getUserActivity = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const { limit = 50, offset = 0 } = req.query;
    const logs = await ActivityLog.getUserActivityLogs(userId, limit, offset);
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

const getTaskActivity = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const logs = await ActivityLog.getTaskActivityLogs(taskId, limit, offset);
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

const getProjectActivity = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const logs = await ActivityLog.getProjectActivityLogs(projectId, limit, offset);
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

const getTeamActivity = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const logs = await ActivityLog.getTeamActivityLogs(teamId, limit, offset);
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

const getActivityStats = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const { days = 30 } = req.query;
    const stats = await ActivityLog.getActivityStats(userId, days);
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserActivity,
  getTaskActivity,
  getProjectActivity,
  getTeamActivity,
  getActivityStats
};