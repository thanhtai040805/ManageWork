const { body } = require("express-validator");

const registerValidation = [
  body("username")
    .isString()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters"),
  body("email").isEmail().withMessage("Invalid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("full_name")
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 100 })
    .withMessage("Full name must be at most 100 characters"),
];

const loginValidation = [
  body("username").notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const updateProfileValidation = [
  body("full_name").optional({ nullable: true }).isString().isLength({ max: 100 }),
  body("avatar_url").optional({ nullable: true }).isURL().withMessage("Invalid avatar URL"),
  body("theme_color").optional({ nullable: true }).isHexColor().withMessage("Invalid hex color"),
];

module.exports = {
  registerValidation,
  loginValidation,
  updateProfileValidation,
};
