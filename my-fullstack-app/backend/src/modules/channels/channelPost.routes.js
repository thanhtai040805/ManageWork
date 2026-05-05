const express = require("express");
const router = express.Router();

const {
  createPost,
  getPostsByChannel,
  getPostById,
  togglePinPost,
  updatePost,
  deletePost,
  createReply,
  getRepliesByPost,
  updateReply,
  deleteReply,
} = require("./channelPost.controller");

const auth = require("../../shared/middlewares/auth");

// Posts routes - use specific paths BEFORE the :channelId parameter
router.get("/posts-by-channel/:channelId", auth, getPostsByChannel);
router.post("/posts", auth, createPost);
router.get("/posts-by-id/:postId", auth, getPostById);
router.put("/posts/:postId/pin", auth, togglePinPost);
router.put("/posts/:postId", auth, updatePost);
router.delete("/posts/:postId", auth, deletePost);

// Replies routes
router.post("/replies", auth, createReply);
router.get("/replies/:postId", auth, getRepliesByPost);
router.put("/replies/:replyId", auth, updateReply);
router.delete("/replies/:replyId", auth, deleteReply);

module.exports = router;