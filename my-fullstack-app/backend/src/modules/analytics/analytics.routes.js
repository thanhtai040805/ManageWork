const express = require("express");
const router = express.Router();
const auth = require("../../shared/middlewares/auth");

const {
  getVelocityChart,
  getBurndownChart,
  getPerformanceMetrics
} = require("./analytics.controller");

router.get("/velocity", auth, getVelocityChart);
router.get("/metrics", auth, getPerformanceMetrics);
router.get("/project/:projectId/burndown", auth, getBurndownChart);

module.exports = router;
