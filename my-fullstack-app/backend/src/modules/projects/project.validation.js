const { body, param } = require("express-validator");

const createProjectValidation = [
  body("name").trim().notEmpty().withMessage("Project name is required").isLength({ max: 200 }),
  body("description").optional({ nullable: true }).isString(),
];

const updateProjectValidation = [
  param("projectId").matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/).withMessage("Invalid project ID"),
  body("name").optional({ nullable: true }).trim().notEmpty().isLength({ max: 200 }),
  body("description").optional({ nullable: true }).isString(),
];

const projectIdParamValidation = [
  param("projectId").matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/).withMessage("Invalid project ID"),
];

const addMemberValidation = [
  param("projectId").matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/).withMessage("Invalid project ID"),
  body("userId").matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/).withMessage("Invalid user ID"),
  body("role").optional().isIn(["admin", "member", "viewer"]),
];

module.exports = {
  createProjectValidation,
  updateProjectValidation,
  projectIdParamValidation,
  addMemberValidation,
};