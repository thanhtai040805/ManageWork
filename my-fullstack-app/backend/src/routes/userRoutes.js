const express = require("express");
const router = express.Router();
const {
  createUser,
  login,
  getUsers,
  getAccount,
  updateProfile,
} = require("../controllers/userController");
const auth = require("../middlewares/auth");

router.post("/register", createUser);
router.post("/login", login);

router.get("/users", auth, getUsers);
router.get("/account", auth, getAccount);
router.put("/account/profile", auth, updateProfile);

module.exports = router;
