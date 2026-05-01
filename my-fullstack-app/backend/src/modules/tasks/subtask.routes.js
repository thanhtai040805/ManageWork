const express = require("express");
const router = express.Router();
const {
  createSubtask,
  getTaskSubtasks,
  updateSubtask,
  toggleSubtaskStatus,
  deleteSubtask
} = require("./subtask.controller");
const auth = require("../../shared/middlewares/auth");
const validate = require("../../shared/middlewares/validation.middleware");
const {
  createSubtaskValidation,
  updateSubtaskValidation,
  subtaskIdParamValidation
} = require("./subtask.validation");

router.post("/create", auth, validate(createSubtaskValidation), createSubtask);
router.get("/task/:taskId", auth, getTaskSubtasks);
router.put("/:subtaskId", auth, validate(updateSubtaskValidation), updateSubtask);
router.patch("/:subtaskId/toggle", auth, validate(subtaskIdParamValidation), toggleSubtaskStatus);
router.delete("/:subtaskId", auth, validate(subtaskIdParamValidation), deleteSubtask);

module.exports = router;
