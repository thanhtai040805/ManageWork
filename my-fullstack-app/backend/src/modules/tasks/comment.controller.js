const Comment = require("./models/comment.model");
const logger = require("../../shared/utils/logger");

const createComment = async (req, res, next) => {
  try {
    const { taskId, content } = req.body;
    const userId = req.user.uid;
    const comment = await Comment.create({ taskId, userId, content });
    
    // Fetch the full comment with user info
    const fullComment = await Comment.findById(comment.comment_id);
    
    logger.info(`Comment created: ${comment.comment_id} by user ${userId}`);
    res.status(201).json({
      status: "success",
      data: fullComment
    });
  } catch (error) {
    next(error);
  }
};

const getTaskComments = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const comments = await Comment.getTaskComments(taskId);
    
    res.status(200).json({
      status: "success",
      data: comments
    });
  } catch (error) {
    next(error);
  }
};

const updateComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.uid;
    
    // Check if comment belongs to user
    const existing = await Comment.findById(commentId);
    if (!existing) {
      return res.status(404).json({ status: "error", message: "Comment not found" });
    }
    if (existing.user_id !== userId) {
      return res.status(403).json({ status: "error", message: "Unauthorized to update this comment" });
    }

    const comment = await Comment.update(commentId, { content });
    res.status(200).json({
      status: "success",
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.uid;
    
    const existing = await Comment.findById(commentId);
    if (!existing) {
      return res.status(404).json({ status: "error", message: "Comment not found" });
    }
    if (existing.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ status: "error", message: "Unauthorized to delete this comment" });
    }

    await Comment.delete(commentId);
    res.status(200).json({
      status: "success",
      message: "Comment deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComment,
  getTaskComments,
  updateComment,
  deleteComment
};
