const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasks,
  getTaskById,
  deleteTaskByID,
  updateTaskByID,
  updateTaskStatus,
  searchTasks,
  reorderTasks,
} = require("./task.controller");
const auth = require("../../shared/middlewares/auth");
const validate = require("../../shared/middlewares/validation.middleware");
const { createTaskValidation, updateTaskValidation, updateStatusValidation } = require("./task.validation");

router.post("/create", auth, validate(createTaskValidation), createTask);
router.get("/", auth, getTasks);
router.get("/:taskId", auth, getTaskById);
router.get("/search", auth, searchTasks);
router.post("/delete/:taskId", auth, deleteTaskByID);
router.post("/edit/:taskId", auth, validate(updateTaskValidation), updateTaskByID);
router.patch("/status/:taskId", auth, validate(updateStatusValidation), updateTaskStatus);
router.post("/reorder", auth, reorderTasks);

module.exports = router;
