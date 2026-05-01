const { body, param } = require("express-validator");

const createSubtaskValidation = [
  body("taskId").isUUID().withMessage("Valid Task ID is required"),
  body("title").trim().notEmpty().withMessage("Subtask title is required"),
];

const updateSubtaskValidation = [
  param("subtaskId").isUUID().withMessage("Valid Subtask ID is required"),
  body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
  body("isDone").optional().isBoolean().withMessage("isDone must be a boolean"),
];

const subtaskIdParamValidation = [
  param("subtaskId").isUUID().withMessage("Valid Subtask ID is required"),
];

module.exports = {
  createSubtaskValidation,
  updateSubtaskValidation,
  subtaskIdParamValidation
};
