const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasks,
  deleteTaskByID,
  updateTaskByID,
  updateTaskStatus,
} = require("../controllers/taskController");

router.post("/create", createTask);
router.get("/", getTasks);
router.post("/delete/:taskId", deleteTaskByID);
router.post("/edit/:taskId", updateTaskByID);
router.patch("/status/:taskId", updateTaskStatus);

module.exports = router;
