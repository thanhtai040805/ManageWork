const express = require("express");
const router = express.Router();

const {
  createChatRoom,
  addMemberToChatRoom,
  getMyChatRoom,
  getChatRoomByNameAndUserName,
  getMessages,
  searchMessages,
  getPinnedMessages,
  updateChatRoom,
} = require("./chat.controller");
const auth = require("../../shared/middlewares/auth");

// Chat Room Routes
router.post("/rooms/create", auth, createChatRoom);
router.post("/rooms/add-member", auth, addMemberToChatRoom);
router.get("/rooms/my", auth, getMyChatRoom);
router.get("/rooms/search", auth, getChatRoomByNameAndUserName);
router.get("/rooms/:roomId/pinned", auth, getPinnedMessages);
router.put("/rooms/:roomId/update", auth, updateChatRoom);

// Message Routes
router.get("/messages/load", auth, getMessages);
router.get("/messages/search", auth, searchMessages);

module.exports = router;
