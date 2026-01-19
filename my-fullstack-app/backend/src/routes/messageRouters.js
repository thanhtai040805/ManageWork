const express = require("express");
const router = express.Router();

const {
  getMessages,
  searchMessages,
} = require("../controllers/messageController");


router.post("/load", getMessages);
router.post("/search", searchMessages);

module.exports = router;
