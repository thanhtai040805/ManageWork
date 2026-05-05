const express = require("express");
const router = express.Router();

const {
  createCategory,
  getCategoriesByProject,
  updateCategory,
  deleteCategory,
  createChannel,
  getChannelsByProject,
  getMyChannels,
  getChannelById,
  updateChannel,
  deleteChannel,
  addChannelMember,
  removeChannelMember,
  getChannelMembers,
} = require("./channel.controller");

const auth = require("../../shared/middlewares/auth");
const validate = require("../../shared/middlewares/validation.middleware");
const {
  createCategoryValidation,
  createChannelValidation,
  updateChannelValidation,
  channelIdParamValidation,
  categoryIdParamValidation,
  addMemberValidation,
} = require("./channel.validation");

// Category routes
router.post("/categories", auth, validate(createCategoryValidation), createCategory);
router.get("/categories", auth, getCategoriesByProject);
router.put("/categories/:categoryId", auth, validate(categoryIdParamValidation), updateCategory);
router.delete("/categories/:categoryId", auth, validate(categoryIdParamValidation), deleteCategory);

// Channel routes - specific paths BEFORE :channelId parameter
router.post("/", auth, validate(createChannelValidation), createChannel);
router.get("/my", auth, getMyChannels);
router.get("/by-project", auth, getChannelsByProject);
router.get("/:channelId", auth, validate(channelIdParamValidation), getChannelById);
router.put("/:channelId", auth, validate(channelIdParamValidation), validate(updateChannelValidation), updateChannel);
router.delete("/:channelId", auth, validate(channelIdParamValidation), deleteChannel);

// Member routes
router.post("/:channelId/members", auth, validate(channelIdParamValidation), validate(addMemberValidation), addChannelMember);
router.delete("/:channelId/members/:userId", auth, validate(channelIdParamValidation), removeChannelMember);
router.get("/:channelId/members", auth, validate(channelIdParamValidation), getChannelMembers);

module.exports = router;