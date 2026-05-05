const ChannelPost = require("./channelPost.model");
const ChannelReply = require("./channelReply.model");
const { getIO } = require("../../shared/sockets/socketEmitter");

const createPost = async (req, res, next) => {
  try {
    const { channel_id, content } = req.body;
    const authorId = req.user.uid;
    
    const post = await ChannelPost.create({
      channelId: channel_id,
      authorId,
      content,
    });
    
    const io = getIO();
    if (io) {
      io.to(`channel:${channel_id}`).emit("channel:post:new", post);
    }
    
    return res.status(201).json(post);
  } catch (error) {
    next(error);
  }
};

const getPostsByChannel = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const { limit = 50 } = req.query;
    
    const posts = await ChannelPost.getByChannel(channelId, parseInt(limit));
    return res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
};

const getPostById = async (req, res, next) => {
  try {
    const { postId } = req.params;
    
    const post = await ChannelPost.getById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    const replies = await ChannelReply.getByPost(postId);
    return res.status(200).json({ ...post, replies });
  } catch (error) {
    next(error);
  }
};

const togglePinPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { is_pinned } = req.body;
    
    const post = await ChannelPost.togglePin(postId, is_pinned);
    return res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const authorId = req.user.uid;
    
    const post = await ChannelPost.update(postId, authorId, content);
    if (!post) {
      return res.status(404).json({ message: "Post not found or unauthorized" });
    }
    return res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const authorId = req.user.uid;
    
    const post = await ChannelPost.delete(postId, authorId);
    if (!post) {
      return res.status(404).json({ message: "Post not found or unauthorized" });
    }
    return res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    next(error);
  }
};

const createReply = async (req, res, next) => {
  try {
    const { post_id, content } = req.body;
    const authorId = req.user.uid;
    
    const reply = await ChannelReply.create({
      postId: post_id,
      authorId,
      content,
    });
    
    const post = await ChannelPost.getById(post_id);
    if (post && post.channel_id) {
      const io = getIO();
      if (io) {
        io.to(`channel:${post.channel_id}`).emit("channel:reply:new", { ...reply, channel_id: post.channel_id });
      }
    }
    
    return res.status(201).json(reply);
  } catch (error) {
    next(error);
  }
};

const getRepliesByPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    
    const replies = await ChannelReply.getByPost(postId);
    return res.status(200).json(replies);
  } catch (error) {
    next(error);
  }
};

const updateReply = async (req, res, next) => {
  try {
    const { replyId } = req.params;
    const { content } = req.body;
    const authorId = req.user.uid;
    
    const reply = await ChannelReply.update(replyId, authorId, content);
    if (!reply) {
      return res.status(404).json({ message: "Reply not found or unauthorized" });
    }
    return res.status(200).json(reply);
  } catch (error) {
    next(error);
  }
};

const deleteReply = async (req, res, next) => {
  try {
    const { replyId } = req.params;
    const authorId = req.user.uid;
    
    const reply = await ChannelReply.delete(replyId, authorId);
    if (!reply) {
      return res.status(404).json({ message: "Reply not found or unauthorized" });
    }
    return res.status(200).json({ message: "Reply deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};