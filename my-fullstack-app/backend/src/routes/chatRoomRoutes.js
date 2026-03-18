const express = require("express");
const router = express.Router();

const {
  createChatRoom,
  addMemberToChatRoom,
  getMyChatRoom,
  getChatRoomByNameAndUserName,
} = require("../controllers/chatRoomController");

router.post("/create", createChatRoom);

router.post("/add-member", addMemberToChatRoom);

router.get("/my-rooms", getMyChatRoom);

router.get("/search", getChatRoomByNameAndUserName);

module.exports = router;
