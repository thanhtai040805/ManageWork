const { param } = require("express-validator");

const notificationIdParamValidation = [
  param("id").matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/).withMessage("Invalid notification ID"),
];

module.exports = {
  notificationIdParamValidation,
};