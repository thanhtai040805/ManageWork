const express = require("express");
const router = express.Router();
const {
  createTag,
  getAllTags,
  addTagToTask,
  removeTagFromTask,
  getTaskTags
} = require("./tag.controller");
const auth = require("../../shared/middlewares/auth");
const validate = require("../../shared/middlewares/validation.middleware");
const {
  createTagValidation,
  addTagToTaskValidation,
  removeTagFromTaskValidation
} = require("./tag.validation");

router.post("/create", auth, validate(createTagValidation), createTag);
router.get("/", auth, getAllTags);
router.post("/attach", auth, validate(addTagToTaskValidation), addTagToTask);
router.delete("/detach/:taskId/:tagId", auth, validate(removeTagFromTaskValidation), removeTagFromTask);
router.get("/task/:taskId", auth, getTaskTags);

module.exports = router;
