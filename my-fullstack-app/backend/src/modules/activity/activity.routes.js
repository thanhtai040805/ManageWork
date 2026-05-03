const express = require("express");
const router = express.Router();
const activityController = require("./activity.controller");
const auth = require("../../shared/middlewares/auth");

router.use(auth);

router.get("/", activityController.getUserActivity);
router.get("/task/:taskId", activityController.getTaskActivity);
router.get("/project/:projectId", activityController.getProjectActivity);
router.get("/team/:teamId", activityController.getTeamActivity);
router.get("/stats", activityController.getActivityStats);

module.exports = router;