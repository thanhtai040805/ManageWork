const { body, param, query } = require("express-validator");

const createChatRoomValidation = [
  body("name").optional().trim().isString(),
  body("isGroup").optional().isBoolean(),
  body("partnerId").optional().matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
];

const addMemberValidation = [
  body("roomId").matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/).withMessage("Invalid room ID"),
  body("userId").matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/).withMessage("Invalid user ID"),
];

const roomIdParamValidation = [
  param("roomId").matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/).withMessage("Invalid room ID"),
];

const getMessagesValidation = [
  query("roomId").matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/).withMessage("Invalid room ID"),
  query("before").optional().isISO8601(),
  query("limit").optional().isInt({ min: 1, max: 100 }),
];

const searchMessagesValidation = [
  query("roomId").matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/).withMessage("Invalid room ID"),
  query("q").trim().notEmpty().withMessage("Search query is required"),
];

module.exports = {
  createChatRoomValidation,
  addMemberValidation,
  roomIdParamValidation,
  getMessagesValidation,
  searchMessagesValidation,
};