const { body, param } = require("express-validator");

const createDependencyValidation = [
  body("taskId").matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/).withMessage("Invalid task ID"),
  body("dependsOnTaskId").matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/).withMessage("Invalid depends on task ID"),
  body("dependencyType").optional().isIn(["blocking", "related"]),
];

const taskIdParamValidation = [
  param("taskId").matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/).withMessage("Invalid task ID"),
];

const dependencyIdParamValidation = [
  param("dependencyId").matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/).withMessage("Invalid dependency ID"),
];

module.exports = {
  createDependencyValidation,
  taskIdParamValidation,
  dependencyIdParamValidation,
};