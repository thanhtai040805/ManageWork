const {
  getTasksByUserIDService,
  deleteTaskService,
  updateTaskByIDService,
  updateTaskStatusService,
  createRecurringTasksService,
  updateTaskWithRecurringOptionService,
} = require("./task.service");
const taskModel = require("./task.model");

const createTask = async (req, res, next) => {
  try {
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
    return res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const updatedTask = await updateTaskStatusService(taskId, status);
    return res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  deleteTaskByID,
  updateTaskByID,
  updateTaskStatus,
};
