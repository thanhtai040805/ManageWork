const { body, param } = require("express-validator");

const createTagValidation = [
  body("name").trim().notEmpty().withMessage("Tag name is required"),
  body("color").optional().isHexColor().withMessage("Valid hex color is required"),
];

const addTagToTaskValidation = [
  body("taskId").isUUID().withMessage("Valid Task ID is required"),
  body("tagId").isUUID().withMessage("Valid Tag ID is required"),
];

const removeTagFromTaskValidation = [
  param("taskId").isUUID().withMessage("Valid Task ID is required"),
  param("tagId").isUUID().withMessage("Valid Tag ID is required"),
];

module.exports = {
  createTagValidation,
  addTagToTaskValidation,
  removeTagFromTaskValidation
};
