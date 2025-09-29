const express = require("express");
const { createUser } = require("../controllers/userController");

const router = express.Router();

// Ví dụ thêm 1 route hello
router.get("/", (req, res) => {
  res.status(200).json({ message: "Hello World 🚀" });
});

router.post("/register", (req, res) => {
  createUser(req, res);
});

module.exports = router;
