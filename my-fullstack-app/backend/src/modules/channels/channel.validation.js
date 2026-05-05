const { body, param, query } = require("express-validator");

const createCategoryValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ max: 100 })
    .withMessage("Category name must be at most 100 characters"),
  body("project_id")
    .notEmpty()
    .withMessage("Project ID is required")
    .isUUID()
    .withMessage("Invalid project ID format"),
];

const createChannelValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Channel name is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Channel name must be 1-100 characters"),
  body("project_id")
    .optional({ nullable: true, checkFalsy: true })
    .isUUID()
    .withMessage("Invalid project ID format"),
  body("category_id")
    .optional({ nullable: true, checkFalsy: true })
    .isUUID()
    .withMessage("Invalid category ID format"),
  body("is_public")
    .optional()
    .isBoolean()
    .withMessage("is_public must be a boolean"),
  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description must be at most 500 characters"),
];

const updateChannelValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Channel name must be 1-100 characters"),
  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description must be at most 500 characters"),
  body("is_public")
    .optional()
    .isBoolean()
    .withMessage("is_public must be a boolean"),
  body("category_id")
    .optional()
    .isUUID()
    .withMessage("Invalid category ID format")
    .custom((value) => {
      if (value === "null") return true; // Allow setting to null
      return true;
    }),
];

const channelIdParamValidation = [
  param("channelId")
    .isUUID()
    .withMessage("Invalid channel ID format"),
];

const categoryIdParamValidation = [
  param("categoryId")
    .isUUID()
    .withMessage("Invalid category ID format"),
];

const addMemberValidation = [
  body("user_id")
    .notEmpty()
    .withMessage("User ID is required")
    .isUUID()
    .withMessage("Invalid user ID format"),
  body("role")
    .optional()
    .isIn(["member", "admin"])
    .withMessage("Role must be either 'member' or 'admin'"),
];

module.exports = {
  createCategoryValidation,
  createChannelValidation,
  updateChannelValidation,
  channelIdParamValidation,
  categoryIdParamValidation,
  addMemberValidation,
};