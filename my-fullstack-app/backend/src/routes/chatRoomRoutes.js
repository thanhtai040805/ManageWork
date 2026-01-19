const express = require("express");
const router = express.Router();

const {
  createChatRoom,
  addMemberToChatRoom,
  getMyChatRoom
} = require("../controllers/chatRoomController");

router.post("/", createChatRoom);

router.post("/add-member", addMemberToChatRoom);

router.get("/my-rooms", getMyChatRoom);

module.exports = router;
