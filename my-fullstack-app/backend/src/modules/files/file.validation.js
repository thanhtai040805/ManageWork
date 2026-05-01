const { body, param } = require("express-validator");

const taskIdParamValidation = [
  param("taskId").matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/).withMessage("Invalid task ID"),
];

const fileIdParamValidation = [
  param("fileId").matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/).withMessage("Invalid file ID"),
];

module.exports = {
  taskIdParamValidation,
  fileIdParamValidation,
};