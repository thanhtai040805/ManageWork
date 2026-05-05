const express = require("express");
const router = express.Router();
const auth = require("../shared/middlewares/auth");

const userRoutes = require("../modules/users/user.routes");
const accountRoutes = require("../modules/users/account.routes");
const projectRoutes = require("../modules/projects/project.routes");
const taskRoutes = require("../modules/tasks/task.routes");
const chatRoutes = require("../modules/chat/chat.routes");
const searchRoutes = require("../modules/search/search.routes");
const notificationRoutes = require("../modules/notifications/notification.routes");
const subtaskRoutes = require("../modules/tasks/subtask.routes");
const commentRoutes = require("../modules/tasks/comment.routes");
const tagRoutes = require("../modules/tasks/tag.routes");
const dependencyRoutes = require("../modules/tasks/task_dependency.routes");
const fileRoutes = require("../modules/files/file.routes");
const analyticsRoutes = require("../modules/analytics/analytics.routes");
const activityRoutes = require("../modules/activity/activity.routes");

const timeRoutes = require("../modules/time-tracking/timeEntry.routes");
const channelRoutes = require("../modules/channels/channel.routes");
const channelPostRoutes = require("../modules/channels/channelPost.routes");

// User routes (includes public login/register)
router.use("/users", userRoutes);

// Protected routes
router.use("/account", accountRoutes);
router.use("/projects", auth, projectRoutes);
router.use("/tasks", auth, taskRoutes);
router.use("/chat", auth, chatRoutes);
router.use("/search", auth, searchRoutes);
router.use("/notifications", auth, notificationRoutes);
router.use("/subtasks", auth, subtaskRoutes);
router.use("/comments", auth, commentRoutes);
router.use("/tags", auth, tagRoutes);
router.use("/dependencies", auth, dependencyRoutes);
router.use("/files", auth, fileRoutes);
router.use("/analytics", auth, analyticsRoutes);
router.use("/activity", auth, activityRoutes);
router.use("/time", auth, timeRoutes);
// IMPORTANT: channel post routes must come BEFORE channel routes (specific before param)
router.use("/channel-posts", auth, channelPostRoutes);
router.use("/channels", auth, channelRoutes);

module.exports = router;
