const express = require("express");
const router = express.Router();
const {
  createUser,
  login,
  getUsers,
} = require("./user.controller");
const auth = require("../../shared/middlewares/auth");

router.post("/register", createUser);
router.post("/login", login);

router.get("/", auth, getUsers);

module.exports = router;
