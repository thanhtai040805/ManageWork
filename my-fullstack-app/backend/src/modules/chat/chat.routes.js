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
  togglePinChatRoom,
} = require("./chat.controller");
const auth = require("../../shared/middlewares/auth");
const validate = require("../../shared/middlewares/validation.middleware");
const {
  createChatRoomValidation,
  addMemberValidation,
  roomIdParamValidation,
  getMessagesValidation,
  searchMessagesValidation,
} = require("./chat.validation");

// Chat Room Routes
router.post("/rooms/create", auth, validate(createChatRoomValidation), createChatRoom);
router.post("/rooms/add-member", auth, validate(addMemberValidation), addMemberToChatRoom);
router.get("/rooms/my", auth, getMyChatRoom);
router.get("/rooms/search", auth, getChatRoomByNameAndUserName);
router.get("/rooms/:roomId/pinned", auth, validate(roomIdParamValidation), getPinnedMessages);
router.put("/rooms/:roomId/update", auth, validate(roomIdParamValidation), updateChatRoom);
router.put("/rooms/:roomId/pin", auth, validate(roomIdParamValidation), togglePinChatRoom);

// Message Routes
router.get("/messages/load", auth, validate(getMessagesValidation), getMessages);
router.get("/messages/search", auth, validate(searchMessagesValidation), searchMessages);

module.exports = router;
