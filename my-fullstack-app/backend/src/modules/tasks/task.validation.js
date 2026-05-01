const { body, param } = require("express-validator");

const createTaskValidation = [
  body("title").notEmpty().withMessage("Title is required").isLength({ max: 200 }),
  body("description").optional({ nullable: true }).isString(),
  body("status").optional({ nullable: true }).isIn(["todo", "in_progress", "done", "cancelled"]),
  body("priority").optional({ nullable: true }).isIn(["low", "medium", "high", "urgent"]),
  body("startDate").optional({ nullable: true }).customSanitizer((value) => value ? new Date(value) : null),
  body("dueDate").optional({ nullable: true }).customSanitizer((value) => value ? new Date(value) : null),
  body("projectId").optional({ nullable: true }).matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$|^[0-9]+$/),
  body("repeatType").optional({ nullable: true }).isIn(["none", "daily", "weekly", "monthly", "custom"]),
  body("repeatDays").optional({ nullable: true }).isArray(),
  body("repeatUntil").optional({ nullable: true }).customSanitizer((value) => value ? new Date(value) : null),
];

const updateTaskValidation = [
  param("taskId").matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$|^[0-9]+$/).withMessage("Invalid task ID"),
  body("title").optional({ nullable: true }).isLength({ max: 200 }),
  body("description").optional({ nullable: true }).isString(),
  body("status").optional({ nullable: true }).isIn(["todo", "in_progress", "done", "cancelled"]),
  body("priority").optional({ nullable: true }).isIn(["low", "medium", "high", "urgent"]),
  body("startDate").optional({ nullable: true }).customSanitizer((value) => value ? new Date(value) : null),
  body("dueDate").optional({ nullable: true }).customSanitizer((value) => value ? new Date(value) : null),
];

const updateStatusValidation = [
  param("taskId").matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$|^[0-9]+$/).withMessage("Invalid task ID"),
  body("status").isIn(["todo", "in_progress", "done", "cancelled"]),
];

module.exports = {
  createTaskValidation,
  updateTaskValidation,
  updateStatusValidation,
};
