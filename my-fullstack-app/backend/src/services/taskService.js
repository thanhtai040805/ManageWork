require("dotenv");
const taskModel = require("../models/task");

const createTodoTaskService = async (title, description, status, priority, startDate, dueDate, assignedUserId, projectId = null) => {
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
    const tasks = await taskModel.getUserTasks(userId);
    return tasks;
  } catch (error) {
    console.error("Error getting tasks by user ID:", error);
    throw error;
  }
};

const updateTaskByIDService = async (taskId, updateData) => {
  try {
    const task = await taskModel.update(taskId, {
      title : updateData.title,
      description : updateData.description,
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
    const tasks = [];
    
    // Nếu không có recurrence, tạo 1 task duy nhất
    if (!repeatType || repeatType === 'none') {
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
      });
      return [task];
    }
    
    // Validation: start và due phải cùng ngày
    if (!isSameDay(startDate, dueDate)) {
      throw new Error("Start date and due date must be on the same day to use recurrence");
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
    
    // Lấy giờ và phút từ start và due dates (dùng UTC để tránh timezone issues)
    const startHours = start.getUTCHours();
    const startMinutes = start.getUTCMinutes();
    const dueHours = due.getUTCHours();
    const dueMinutes = due.getUTCMinutes();
    
    // Lấy ngày của due_date để tính toán recurring (dùng UTC)
    const dueYear = due.getUTCFullYear();
    const dueMonth = due.getUTCMonth();
    const dueDay = due.getUTCDate();
    // getDay() trả về day of week (0-6) và không phụ thuộc timezone
    const dueDayOfWeek = due.getDay();
    
    // Generate tasks
    const currentDate = new Date(Date.UTC(dueYear, dueMonth, dueDay)); // Bắt đầu từ due_date (UTC)
    const endUTC = new Date(repeatUntil); // end date (đã là UTC từ ISO string)
    const maxTasks = 100; // Giới hạn tối đa 100 tasks
    let taskCount = 0;
    
    // Xác định các ngày cần tạo tasks
    let targetDays = [];
    if (repeatType === 'weekly') {
      // Lặp lại vào cùng ngày trong tuần với due_date
      targetDays = [dueDayOfWeek];
    } else if (repeatType === 'custom') {
      // Lặp lại vào các ngày đã chọn
      if (repeatDays.length === 0) {
        throw new Error("repeatDays is required for custom repeat type");
      }
      targetDays = repeatDays;
    }
    
    // Tạo tasks từ due_date đến repeat_until
    while (currentDate <= endUTC && taskCount < maxTasks) {
      // getDay() trả về day of week (0-6) và không phụ thuộc timezone
      const dayOfWeek = currentDate.getDay();
      
      if (targetDays.includes(dayOfWeek)) {
        // Tạo new start và due dates với UTC (giữ nguyên giờ/phút từ original)
        const year = currentDate.getUTCFullYear();
        const month = currentDate.getUTCMonth();
        const day = currentDate.getUTCDate();
        
        const newStart = new Date(Date.UTC(year, month, day, startHours, startMinutes, 0, 0));
        const newDue = new Date(Date.UTC(year, month, day, dueHours, dueMinutes, 0, 0));
        
        // Chỉ tạo nếu newDue không vượt quá end date
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
          });
          
          tasks.push(task);
          taskCount++;
        }
      }
      
      // Di chuyển đến ngày tiếp theo (UTC)
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
    
    if (tasks.length === 0) {
      throw new Error("No tasks were created. Please check your recurrence settings.");
    }
    
    return tasks;
  } catch (error) {
    console.error("Error creating recurring tasks:", error);
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
};
