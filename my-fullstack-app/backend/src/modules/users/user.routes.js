const express = require("express");
const router = express.Router();
const { createUser, login, getUsers, getAccount, updateProfile } = require("./user.controller");
const auth = require("../../shared/middlewares/auth");
const validate = require("../../shared/middlewares/validation.middleware");
const { registerValidation, loginValidation, updateProfileValidation } = require("./user.validation");

router.post("/register", validate(registerValidation), createUser);
router.post("/login", validate(loginValidation), login);

router.get("/", auth, getUsers);
router.get("/account", auth, getAccount);
router.patch("/profile", auth, validate(updateProfileValidation), updateProfile);

module.exports = router;
