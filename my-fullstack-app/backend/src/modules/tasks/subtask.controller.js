const Subtask = require("./models/subtask.model");
const logger = require("../../shared/utils/logger");
const AutomationService = require("./automation.service");

const createSubtask = async (req, res, next) => {
  try {
    const { taskId, title } = req.body;
    const subtask = await Subtask.create({ taskId, title });
    
    logger.info(`Subtask created: ${subtask.subtask_id} for task ${taskId}`);
    res.status(201).json({
      status: "success",
      data: subtask
    });
  } catch (error) {
    next(error);
  }
};

const getTaskSubtasks = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const subtasks = await Subtask.findByTaskId(taskId);
    
    res.status(200).json({
      status: "success",
      data: subtasks
    });
  } catch (error) {
    next(error);
  }
};

const updateSubtask = async (req, res, next) => {
  try {
    const { subtaskId } = req.params;
    const { title, isDone } = req.body;
    const subtask = await Subtask.update(subtaskId, { title, isDone });
    
    if (!subtask) {
      return res.status(404).json({ status: "error", message: "Subtask not found" });
    }

    if (isDone !== undefined) {
      await AutomationService.cascadeTaskStatus(subtask.task_id);
    }

    res.status(200).json({
      status: "success",
      data: subtask
    });
  } catch (error) {
    next(error);
  }
};

const toggleSubtaskStatus = async (req, res, next) => {
  try {
    const { subtaskId } = req.params;
    const subtask = await Subtask.toggleStatus(subtaskId);
    
    if (!subtask) {
      return res.status(404).json({ status: "error", message: "Subtask not found" });
    }

    await AutomationService.cascadeTaskStatus(subtask.task_id);

    res.status(200).json({
      status: "success",
      data: subtask
    });
  } catch (error) {
    next(error);
  }
};

const deleteSubtask = async (req, res, next) => {
  try {
    const { subtaskId } = req.params;
    const subtask = await Subtask.findById(subtaskId);
    if (subtask) {
      await Subtask.delete(subtaskId);
      await AutomationService.cascadeTaskStatus(subtask.task_id);
    }
    
    res.status(200).json({
      status: "success",
      message: "Subtask deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSubtask,
  getTaskSubtasks,
  updateSubtask,
  toggleSubtaskStatus,
  deleteSubtask
};
