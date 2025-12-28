require("dotenv");
const taskModel = require("../models/task");
const recurringTaskModel = require("../models/recurringTask");



const createTodoTaskService = async (
  title,
  description,
  status,
  priority,
  startDate,
  dueDate,
  assignedUserId,
  projectId = null
) => {
  try {
    const task = await taskModel.create({
      projectId,
      title,
      description,
      status: status || "todo",
      priority: priority || "medium",
      startDate: startDate,
      dueDate: dueDate,
      createdBy: assignedUserId,
      assignedTo: assignedUserId,
    });
    return task;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

const getTasksService = async () => {
  try {
    const tasks = await taskModel.getAll();
    return tasks;
  } catch (error) {
    console.error("Error getting tasks:", error);
    throw error;
  }
};

const updateTaskService = async (taskId, updates) => {
  try {
    const task = await taskModel.update(taskId, updates);
    return task;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

const deleteTaskService = async (taskId) => {
  try {
    await taskModel.delete(taskId);
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

const getTasksByUserIDService = async (userId) => {
  try {
    const now = new Date();
    const tasks = await taskModel.getUserTasks(userId);
    return tasks.map((task) => ({
      ...task,
      isOverdue:
        task.due_date &&
        new Date(task.due_date) < now &&
        !["done", "cancelled"].includes(task.status),
    }));
  } catch (error) {
    console.error("Error getting tasks by user ID:", error);
    throw error;
  }
};

const updateTaskByIDService = async (taskId, updateData) => {
  try {
    const task = await taskModel.update(taskId, {
      title: updateData.title,
      description: updateData.description,
      status: updateData.status || "todo",
      priority: updateData.priority || "medium",
      startDate: updateData.startDate,
      dueDate: updateData.dueDate,
      assignedTo: updateData.assignedUserId,
    });
    return task;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

const updateTaskStatusService = async (taskId, status) => {
  try {
    const task = await taskModel.updateStatus(taskId, status);
    // Get full task data after status update
    const fullTask = await taskModel.findById(taskId);
    return fullTask;
  } catch (error) {
    console.error("Error updating task status:", error);
    throw error;
  }
};

// Helper function để kiểm tra 2 dates có cùng ngày không
const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
};

// Helper function để generate dates từ recurring rule
const generateRecurringDates = (startDate, endDate, repeatType, repeatDays) => {
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const current = new Date(start);

  if (repeatType === "weekly") {
    const dayOfWeek = start.getDay();
    while (current <= end) {
      if (current.getDay() === dayOfWeek) {
        dates.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }
  } else if (repeatType === "custom") {
    while (current <= end) {
      if (repeatDays.includes(current.getDay())) {
        dates.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }
  }

  return dates;
};

const createRecurringTasksService = async (
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
) => {
  try {
    // Nếu không có recurrence, tạo 1 task duy nhất
    if (!repeatType || repeatType === "none") {
      const task = await taskModel.create({
        projectId,
        title,
        description,
        status: status || "todo",
        priority: priority || "medium",
        startDate,
        dueDate,
        createdBy: assignedUserId,
        assignedTo: assignedUserId,
        recurringTaskId: null,
      });
      return [task];
    }

    // Validation: start và due phải cùng ngày
    if (!isSameDay(startDate, dueDate)) {
      throw new Error(
        "Start date and due date must be on the same day to use recurrence"
      );
    }

    // Validate repeatUntil
    if (!repeatUntil) {
      throw new Error("repeatUntil is required when repeatType is set");
    }

    const start = new Date(startDate || dueDate);
    const due = new Date(dueDate);
    const end = new Date(repeatUntil);

    // Validate dates
    if (end < due) {
      throw new Error("repeatUntil must be after due date");
    }

    // Validate không được quá 12 tuần
    const weeksDiff = (end - due) / (1000 * 60 * 60 * 24 * 7);
    if (weeksDiff > 12) {
      throw new Error("Repeat period cannot exceed 12 weeks");
    }

    // Bước 1: Tạo RecurringTask template (theo ClickUp pattern)
    const recurringTask = await recurringTaskModel.create({
      projectId,
      title,
      description,
      priority: priority || "medium",
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      repeatType,
      repeatDays: repeatType === "custom" ? repeatDays : [],
      createdBy: assignedUserId,
      assignedTo: assignedUserId,
    });

    // Bước 2: Generate dates và tạo task instances
    const startHours = start.getUTCHours();
    const startMinutes = start.getUTCMinutes();
    const dueHours = due.getUTCHours();
    const dueMinutes = due.getUTCMinutes();

    const dueYear = due.getUTCFullYear();
    const dueMonth = due.getUTCMonth();
    const dueDay = due.getUTCDate();
    const dueDayOfWeek = due.getDay();

    let targetDays = [];
    if (repeatType === "weekly") {
      targetDays = [dueDayOfWeek];
    } else if (repeatType === "custom") {
      if (repeatDays.length === 0) {
        throw new Error("repeatDays is required for custom repeat type");
      }
      targetDays = repeatDays;
    }

    // Bước 3: Tạo các task instances với recurring_task_id
    const tasks = [];
    const currentDate = new Date(Date.UTC(dueYear, dueMonth, dueDay));
    const endUTC = new Date(repeatUntil);
    const maxTasks = 100;
    let taskCount = 0;

    while (currentDate <= endUTC && taskCount < maxTasks) {
      const dayOfWeek = currentDate.getDay();

      if (targetDays.includes(dayOfWeek)) {
        const year = currentDate.getUTCFullYear();
        const month = currentDate.getUTCMonth();
        const day = currentDate.getUTCDate();

        const newStart = new Date(
          Date.UTC(year, month, day, startHours, startMinutes, 0, 0)
        );
        const newDue = new Date(
          Date.UTC(year, month, day, dueHours, dueMinutes, 0, 0)
        );

        if (newDue <= endUTC) {
          const task = await taskModel.create({
            projectId,
            title,
            description,
            status: status || "todo",
            priority: priority || "medium",
            startDate: newStart.toISOString(),
            dueDate: newDue.toISOString(),
            createdBy: assignedUserId,
            assignedTo: assignedUserId,
            recurringTaskId: recurringTask.recurring_task_id, // ← Link đến template
          });

          tasks.push(task);
          taskCount++;
        }
      }

      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    if (tasks.length === 0) {
      throw new Error(
        "No tasks were created. Please check your recurrence settings."
      );
    }

    return tasks;
  } catch (error) {
    console.error("Error creating recurring tasks:", error);
    throw error;
  }
};

// Update task với "apply to future" logic (theo ClickUp pattern)
const updateTaskWithRecurringOptionService = async (
  taskId,
  updateData,
  applyTo = "this" // 'this' or 'future'
) => {
  try {
    // 1. Lấy task hiện tại
    const currentTask = await taskModel.findById(taskId);
    if (!currentTask) {
      throw new Error("Task not found");
    }

    // 2. Nếu không có recurring_task_id → update bình thường
    if (!currentTask.recurring_task_id || applyTo === "this") {
      return await updateTaskByIDService(taskId, updateData);
    }

    // 3. Nếu có recurring_task_id và applyTo === 'future'
    // → Clone rule + regenerate (theo ClickUp pattern)
    const oldRecurringTask = await recurringTaskModel.findById(
      currentTask.recurring_task_id
    );
    if (!oldRecurringTask) {
      // Fallback: chỉ update task này
      return await updateTaskByIDService(taskId, updateData);
    }

    // Bước 1: Clone rule và update với data mới
    const newRecurringTask = await recurringTaskModel.create({
      projectId: oldRecurringTask.project_id,
      title:
        updateData.title !== undefined
          ? updateData.title
          : oldRecurringTask.title,
      description:
        updateData.description !== undefined
          ? updateData.description
          : oldRecurringTask.description,
      priority:
        updateData.priority !== undefined
          ? updateData.priority
          : oldRecurringTask.priority,
      startDate:
        updateData.startDate !== undefined
          ? updateData.startDate
          : oldRecurringTask.start_date,
      endDate: oldRecurringTask.end_date, // Giữ nguyên end_date của rule cũ
      repeatType: oldRecurringTask.repeat_type,
      repeatDays: oldRecurringTask.repeat_days,
      createdBy: oldRecurringTask.created_by,
      assignedTo:
        updateData.assignedUserId !== undefined
          ? updateData.assignedUserId
          : oldRecurringTask.assigned_to,
    });

    // Bước 2: Update task hiện tại
    const updatedTask = await updateTaskByIDService(taskId, updateData);

    // Bước 3: Re-link future tasks (>= current task's due_date) sang rule mới
    await taskModel.updateRecurringTaskId(
      oldRecurringTask.recurring_task_id,
      newRecurringTask.recurring_task_id,
      currentTask.due_date
    );

    // Bước 4: Xóa future tasks chưa done để regenerate với rule mới
    await taskModel.deleteFutureTasks(
      newRecurringTask.recurring_task_id,
      currentTask.due_date
    );

    // Bước 5: Regenerate future tasks
    const futureDates = generateRecurringDates(
      updateData.startDate || oldRecurringTask.start_date,
      oldRecurringTask.end_date,
      oldRecurringTask.repeat_type,
      oldRecurringTask.repeat_days
    );

    // Filter chỉ lấy dates >= currentTask.due_date
    const startDateObj = new Date(currentTask.due_date);
    const datesToGenerate = futureDates.filter((date) => {
      const dateOnly = new Date(date);
      dateOnly.setHours(0, 0, 0, 0);
      const startOnly = new Date(startDateObj);
      startOnly.setHours(0, 0, 0, 0);
      return dateOnly >= startOnly;
    });

    const startHours = startDateObj.getUTCHours();
    const startMinutes = startDateObj.getUTCMinutes();
    const dueHours = startDateObj.getUTCHours();
    const dueMinutes = startDateObj.getUTCMinutes();

    for (const date of datesToGenerate) {
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth();
      const day = date.getUTCDate();

      const newStart = new Date(
        Date.UTC(year, month, day, startHours, startMinutes, 0, 0)
      );
      const newDue = new Date(
        Date.UTC(year, month, day, dueHours, dueMinutes, 0, 0)
      );

      // Skip nếu đã có task ở ngày này (tránh duplicate)
      const existingTask = await taskModel.findById(currentTask.task_id);
      if (existingTask && existingTask.due_date === newDue.toISOString()) {
        continue;
      }

      await taskModel.create({
        projectId: currentTask.project_id,
        title: newRecurringTask.title,
        description: newRecurringTask.description,
        status: "todo",
        priority: newRecurringTask.priority,
        startDate: newStart.toISOString(),
        dueDate: newDue.toISOString(),
        createdBy: currentTask.created_by,
        assignedTo: newRecurringTask.assigned_to,
        recurringTaskId: newRecurringTask.recurring_task_id,
      });
    }

    return updatedTask;
  } catch (error) {
    console.error("Error updating task with recurring option:", error);
    throw error;
  }
};

module.exports = {
  createTodoTaskService,
  getTasksService,
  updateTaskService,
  deleteTaskService,
  getTasksByUserIDService,
  updateTaskByIDService,
  updateTaskStatusService,
  createRecurringTasksService,
  updateTaskWithRecurringOptionService,
};
