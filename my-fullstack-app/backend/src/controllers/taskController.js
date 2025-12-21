const {
  createTodoTaskService,
  getTasksByUserIDService,
  deleteTaskService,
  updateTaskByIDService,
  updateTaskStatusService,
  createRecurringTasksService,
} = require("../services/taskService");

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
      projectId = null
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
    
    if (tasks.length === 1) {
      // Nếu chỉ có 1 task, trả về như cũ
      res.status(201).json(tasks[0]);
    } else {
      // Nếu có nhiều tasks, trả về array
      res.status(201).json({
        message: `Created ${tasks.length} task(s) successfully`,
        tasks: tasks,
        count: tasks.length
      });
    }
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ 
      error: error.message || "Internal Server Error" 
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
    const updateData = req.body;
    const updatedTask = await updateTaskByIDService(taskId, updateData);
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error updating task by ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
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
