const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");

const userRoutes = require("./userRoutes");
const taskRoutes = require("./taskRoutes");
const projectRoutes = require("./projectRoutes");
const chatRoomRoutes = require("./chatRoomRoutes");
const messageRoutes = require("./messageRouters");


router.use("/messages", auth, messageRoutes);
router.use("/chat-rooms", auth, chatRoomRoutes);
router.use("/tasks", auth, taskRoutes);
router.use("/projects", auth, projectRoutes);


router.use("/", userRoutes);

module.exports = router;
