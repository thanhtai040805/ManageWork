const ChannelPost = require("./channelPost.model");
const ChannelReply = require("./channelReply.model");
const { getIO, emitNotification } = require("../../shared/sockets/socketEmitter");
const Notification = require("../notifications/notification.model");
const { notifyMentions } = require("../../shared/utils/mentionUtils");

const createPost = async (req, res, next) => {
  try {
    const { channel_id, content } = req.body;
    const authorId = req.user.uid;
    
    const post = await ChannelPost.create({
      channelId: channel_id,
      authorId,
      content,
    });
    
    // Handle mentions in post
    await notifyMentions(
      content, 
      authorId, 
      'chat', 
      `New mention in channel: ${content.substring(0, 50)}...`
    );

    // Notify all channel members about new post
    const channel = await require("./channel.model").getById(channel_id);
    const members = await require("./channel.model").getMembers(channel_id);
    
    for (const member of members) {
      if (String(member.user_id) === String(authorId)) continue;
      
      const notification = await Notification.createChatNotification(
        member.user_id,
        `#${channel.name}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`
      );
      socketEmitter.emitNotification(member.user_id, notification);
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
    
    // Notify post author
    const post = await ChannelPost.getById(post_id);
    if (post && String(post.author_id) !== String(authorId)) {
      const notification = await Notification.createChatNotification(
        post.author_id,
        `New reply on your post: ${content.substring(0, 50)}...`
      );
      emitNotification(post.author_id, notification);
    }

    // Handle mentions in reply
    await notifyMentions(
      content, 
      authorId, 
      'chat', 
      `You were mentioned in a reply: ${content.substring(0, 50)}...`
    );
    
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