const Tag = require("./models/tag.model");
const logger = require("../../shared/utils/logger");

const createTag = async (req, res, next) => {
  try {
    const { name, color } = req.body;
    
    // Check if tag with same name exists
    const existing = await Tag.findByName(name);
    if (existing) {
      return res.status(409).json({ status: "error", message: "Tag with this name already exists" });
    }

    const tag = await Tag.create({ name, color });
    logger.info(`Tag created: ${tag.tag_id} (${tag.name})`);
    res.status(201).json({
      status: "success",
      data: tag
    });
  } catch (error) {
    next(error);
  }
};

const getAllTags = async (req, res, next) => {
  try {
    const tags = await Tag.getAll();
    res.status(200).json({
      status: "success",
      data: tags
    });
  } catch (error) {
    next(error);
  }
};

const addTagToTask = async (req, res, next) => {
  try {
    const { taskId, tagId } = req.body;
    await Tag.addTagToTask(taskId, tagId);
    
    logger.info(`Tag ${tagId} added to task ${taskId}`);
    res.status(200).json({
      status: "success",
      message: "Tag added to task successfully"
    });
  } catch (error) {
    next(error);
  }
};

const removeTagFromTask = async (req, res, next) => {
  try {
    const { taskId, tagId } = req.params;
    await Tag.removeTagFromTask(taskId, tagId);
    
    logger.info(`Tag ${tagId} removed from task ${taskId}`);
    res.status(200).json({
      status: "success",
      message: "Tag removed from task successfully"
    });
  } catch (error) {
    next(error);
  }
};

const getTaskTags = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const tags = await Tag.getTaskTags(taskId);
    res.status(200).json({
      status: "success",
      data: tags
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTag,
  getAllTags,
  addTagToTask,
  removeTagFromTask,
  getTaskTags
};
