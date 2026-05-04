const {
  getTasksByUserIDService,
  deleteTaskService,
  updateTaskByIDService,
  updateTaskStatusService,
  createRecurringTasksService,
  updateTaskWithRecurringOptionService,
} = require("./task.service");
const taskModel = require("./task.model");
const ActivityLog = require("../../shared/models/activityLog.model");

const createTask = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const {
      title,
      description,
      status,
      priority,
      startDate,
      dueDate,
      assignedUserId,
      repeatType = null,
      repeatDays = [],
      repeatUntil = null,
      projectId = null,
    } = req.body;

    const tasks = await createRecurringTasksService(
      title,
      description,
      status,
      priority,
      startDate,
      dueDate,
      assignedUserId,
      repeatType,
      repeatDays,
      repeatUntil,
      projectId
    );

    if (tasks.length > 0) {
      await ActivityLog.logTaskCreated(userId, tasks[0].task_id, title);
    }

    return res.status(201).json({
      tasks: tasks,
      count: tasks.length,
    });
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const tasks = await getTasksByUserIDService(userId);
    return res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await taskModel.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    return res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

const deleteTaskByID = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    await deleteTaskService(taskId);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const updateTaskByID = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const { taskId } = req.params;
    const { applyTo, ...updateData } = req.body;

    const currentTask = await taskModel.findById(taskId);
    
    if (currentTask?.recurring_task_id && applyTo === 'future') {
      const updatedTask = await updateTaskWithRecurringOptionService(
        taskId,
        updateData,
        'future'
      );
      return res.status(200).json(updatedTask);
    }

    const updatedTask = await updateTaskByIDService(taskId, updateData);
    
    if (updatedTask) {
      await ActivityLog.logTaskUpdated(userId, taskId, updatedTask.title);
    }
    
    return res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const { taskId } = req.params;
    const { status, previousStatus } = req.body;
    const updatedTask = await updateTaskStatusService(taskId, status);
    
    if (updatedTask) {
      if (status === 'done') {
        await ActivityLog.logTaskCompleted(userId, taskId, updatedTask.title);
      } else if (previousStatus && previousStatus !== status) {
        await ActivityLog.logTaskUpdated(userId, taskId, updatedTask.title, `Status changed from ${previousStatus} to ${status}`);
      }
    }
    
    return res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
};

const searchTasks = async (req, res, next) => {
  try {
    const { q, projectId } = req.query;
    const userId = req.user.uid;
    const tasks = await taskModel.search(q, userId, projectId);
    return res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

const reorderTasks = async (req, res, next) => {
  try {
    const { taskOrders } = req.body;
    
    if (!Array.isArray(taskOrders)) {
      return res.status(400).json({ error: "taskOrders must be an array" });
    }
    
    await taskModel.updateOrder(taskOrders);
    
    return res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  deleteTaskByID,
  updateTaskByID,
  updateTaskStatus,
  searchTasks,
  reorderTasks,
};
