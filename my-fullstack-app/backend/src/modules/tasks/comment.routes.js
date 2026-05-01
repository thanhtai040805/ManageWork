const express = require("express");
const router = express.Router();
const {
  createComment,
  getTaskComments,
  updateComment,
  deleteComment
} = require("./comment.controller");
const auth = require("../../shared/middlewares/auth");
const validate = require("../../shared/middlewares/validation.middleware");
const {
  createCommentValidation,
  updateCommentValidation,
  commentIdParamValidation
} = require("./comment.validation");

router.post("/create", auth, validate(createCommentValidation), createComment);
router.get("/task/:taskId", auth, getTaskComments);
router.put("/:commentId", auth, validate(updateCommentValidation), updateComment);
router.delete("/:commentId", auth, validate(commentIdParamValidation), deleteComment);

module.exports = router;
