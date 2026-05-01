const { body, param } = require("express-validator");

const createCommentValidation = [
  body("taskId").isUUID().withMessage("Valid Task ID is required"),
  body("content").trim().notEmpty().withMessage("Comment content is required"),
];

const updateCommentValidation = [
  param("commentId").isUUID().withMessage("Valid Comment ID is required"),
  body("content").trim().notEmpty().withMessage("Content cannot be empty"),
];

const commentIdParamValidation = [
  param("commentId").isUUID().withMessage("Valid Comment ID is required"),
];

module.exports = {
  createCommentValidation,
  updateCommentValidation,
  commentIdParamValidation
};
