const express = require("express");
const router = express.Router();
const auth = require("../shared/middlewares/auth");

const userRoutes = require("../modules/users/user.routes");
const accountRoutes = require("../modules/users/account.routes");
const projectRoutes = require("../modules/projects/project.routes");
const taskRoutes = require("../modules/tasks/task.routes");
const chatRoutes = require("../modules/chat/chat.routes");

// User routes (includes public login/register)
router.use("/users", userRoutes);

// Protected routes
router.use("/account", accountRoutes);
router.use("/projects", auth, projectRoutes);
router.use("/tasks", auth, taskRoutes);
router.use("/chat", auth, chatRoutes);

module.exports = router;
