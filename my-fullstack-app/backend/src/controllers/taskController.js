const {
  createTodoTaskService,
  getTasksByUserIDService,
  deleteTaskService,
  updateTaskByIDService,
  updateTaskStatusService,
  createRecurringTasksService,
  updateTaskWithRecurringOptionService,
} = require("../services/taskService");
const taskModel = require("../models/task");

const createTask = async (req, res) => {
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

    res.status(201).json({
      tasks: tasks,
      count: tasks.length,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({
      error: error.message || "Internal Server Error",
    });
  }
};

const getTasks = async (req, res) => {
  try {
    const userId = req.user.uid;
    const tasks = await getTasksByUserIDService(userId);
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteTaskByID = async (req, res) => {
  try {
    const { taskId } = req.params;
    console.log("Deleting task with ID:", req);

    await deleteTaskService(taskId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting task by ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateTaskByID = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { applyTo, ...updateData } = req.body; // ← Extract applyTo từ body

    // Check nếu task có recurring_task_id và applyTo được set
    const currentTask = await taskModel.findById(taskId);
    
    if (currentTask?.recurring_task_id && applyTo === 'future') {
      // Sử dụng logic "this and future"
      const updatedTask = await updateTaskWithRecurringOptionService(
        taskId,
        updateData,
        'future'
      );
      return res.status(200).json(updatedTask);
    }

    // Mặc định: chỉ update task này (applyTo === 'this' hoặc không có recurring)
    const updatedTask = await updateTaskByIDService(taskId, updateData);
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error updating task by ID:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const updatedTask = await updateTaskStatusService(taskId, status);
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  createTask,
  getTasks,
  deleteTaskByID,
  updateTaskByID,
  updateTaskStatus,
};
