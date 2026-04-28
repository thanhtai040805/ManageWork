const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasks,
  deleteTaskByID,
  updateTaskByID,
  updateTaskStatus,
} = require("./task.controller");
const auth = require("../../shared/middlewares/auth");

router.post("/create", auth, createTask);
router.get("/", auth, getTasks);
router.post("/delete/:taskId", auth, deleteTaskByID);
router.post("/edit/:taskId", auth, updateTaskByID);
router.patch("/status/:taskId", auth, updateTaskStatus);

module.exports = router;
