const express = require("express");
const router = express.Router();

const {
  getMessages,
  searchMessages,
} = require("../controllers/messageController");


router.get("/load", getMessages);
router.get("/search", searchMessages);

module.exports = router;
