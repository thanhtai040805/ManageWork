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
const Notification = require("../notifications/notification.model");
const { emitTaskUpdated, emitTaskReordered, emitNotification } = require("../../shared/sockets/socketEmitter");
const TaskOrderService = require("../../shared/services/taskOrder.service");
const TaskCacheService = require("../../shared/services/taskCache.service");
const pool = require("../../shared/config/database");
const Project = require("../projects/project.model");

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
    
    // Permission check: User must be project member (owner, admin, member)
    if (projectId) {
      const ownerCheck = await pool.query(
        `SELECT owner_id FROM projects WHERE project_id = $1`,
        [projectId]
      );

      const isOwner = ownerCheck.rows.length > 0 && ownerCheck.rows[0].owner_id === userId;

      if (!isOwner) {
        const result = await pool.query(
          `SELECT role FROM project_members
           WHERE project_id = $1 AND user_id = $2`,
          [projectId, userId]
        );

        if (result.rows.length === 0) {
          return res.status(403).json({ error: "Not a project member" });
        }

        const role = result.rows[0].role;
        if (!['admin', 'member'].includes(role)) {
          return res.status(403).json({ error: "Insufficient permissions to create tasks in this project" });
        }
      }

      // If assignee is provided, verify they are also a member of the project
      if (assignedUserId) {
        const members = await Project.getProjectMembers(projectId);
        const isMember = members.some(m => m.user_id === assignedUserId);
        if (!isMember) {
          return res.status(400).json({ message: "Assignee must be a project member" });
        }
      }
    }

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
      const task = tasks[0];
      if (task.project_id) {
        const order = await TaskOrderService.getNextOrder(task.project_id, task.status);
        await TaskOrderService.setTaskOrder(task.project_id, task.status, task.task_id, order);
        await TaskCacheService.invalidateProject(task.project_id);
      }
      if (task.assigned_to) {
        await TaskCacheService.invalidateUserTaskCache(task.assigned_to);
      }
      if (task.created_by && task.created_by !== task.assigned_to) {
        await TaskCacheService.invalidateUserTaskCache(task.created_by);
      }
      emitTaskUpdated(task, null);
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
    const task = await taskModel.findById(taskId);
    await deleteTaskService(taskId);
    
    if (task?.project_id) {
      await TaskOrderService.removeTask(task.project_id, task.status, taskId);
      await TaskCacheService.invalidateProject(task.project_id);
      emitTaskUpdated({ task_id: taskId, project_id: task.project_id, status: 'deleted' }, null);
    }
    if (task?.assigned_to) {
      await TaskCacheService.invalidateUserTaskCache(task.assigned_to);
    }
    if (task?.created_by && task.created_by !== task.assigned_to) {
      await TaskCacheService.invalidateUserTaskCache(task.created_by);
    }
    
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
    if (!currentTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Permission check: User must be project member (owner, admin, member)
    if (currentTask.project_id) {
      const ownerCheck = await pool.query(
        `SELECT owner_id FROM projects WHERE project_id = $1`,
        [currentTask.project_id]
      );

      const isOwner = ownerCheck.rows.length > 0 && ownerCheck.rows[0].owner_id === userId;

      if (!isOwner) {
        const result = await pool.query(
          `SELECT role FROM project_members
           WHERE project_id = $1 AND user_id = $2`,
          [currentTask.project_id, userId]
        );

        if (result.rows.length === 0) {
          return res.status(403).json({ error: "Not a project member" });
        }

        const role = result.rows[0].role;
        if (!['admin', 'member'].includes(role)) {
          return res.status(403).json({ error: "Insufficient permissions to edit tasks in this project" });
        }
      }
    } else if (currentTask.created_by !== userId) {
      // Personal task: only creator can edit
      return res.status(403).json({ error: "Insufficient permissions to edit this task" });
    }

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
      // If assignee changed, verify the new assignee is a member of the project
      if (updateData.assignedUserId && updatedTask.project_id) {
        const members = await Project.getProjectMembers(updatedTask.project_id);
        const isMember = members.some(m => m.user_id === updateData.assignedUserId);
        if (!isMember) {
          return res.status(400).json({ message: "New assignee must be a project member" });
        }
      }

      // Invalidate project cache
      if (updatedTask.project_id) {
        await TaskCacheService.invalidateProject(updatedTask.project_id);
      }
      
      // Invalidate new assignee's cache
      if (updatedTask.assigned_to) {
        await TaskCacheService.invalidateUserTaskCache(updatedTask.assigned_to);
      }
      
      // Invalidate old assignee's cache if changed
      if (currentTask.assigned_to && currentTask.assigned_to !== updatedTask.assigned_to) {
        await TaskCacheService.invalidateUserTaskCache(currentTask.assigned_to);
      }
      
      // Invalidate creator's cache
      if (currentTask.created_by) {
        await TaskCacheService.invalidateUserTaskCache(currentTask.created_by);
      }
      
      emitTaskUpdated(updatedTask, null);
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

    const currentTask = await taskModel.findById(taskId);
    if (!currentTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Permission check: User must be project member (owner, admin, member)
    if (currentTask.project_id) {
      const ownerCheck = await pool.query(
        `SELECT owner_id FROM projects WHERE project_id = $1`,
        [currentTask.project_id]
      );

      const isOwner = ownerCheck.rows.length > 0 && ownerCheck.rows[0].owner_id === userId;

      if (!isOwner) {
        const result = await pool.query(
          `SELECT role FROM project_members
           WHERE project_id = $1 AND user_id = $2`,
          [currentTask.project_id, userId]
        );

        if (result.rows.length === 0) {
          return res.status(403).json({ error: "Not a project member" });
        }

        const role = result.rows[0].role;
        if (!['admin', 'member'].includes(role)) {
          return res.status(403).json({ error: "Insufficient permissions to update tasks in this project" });
        }
      }
    } else if (currentTask.created_by !== userId && currentTask.assigned_to !== userId) {
      // Personal task: only creator or assignee can update status
      return res.status(403).json({ error: "Insufficient permissions to update this task's status" });
    }

    const updatedTask = await updateTaskStatusService(taskId, status);
    
    if (updatedTask) {
      if (status === 'done') {
        await ActivityLog.logTaskCompleted(userId, taskId, updatedTask.title);
      } else if (previousStatus && previousStatus !== status) {
        await ActivityLog.logTaskUpdated(userId, taskId, updatedTask.title, `Status changed from ${previousStatus} to ${status}`);
      }
      
      // Notify task creator if status changed and not done by the creator
      if (previousStatus && previousStatus !== status && currentTask.created_by && currentTask.created_by !== userId) {
        const statusMessages = {
          'todo': 'moved task back to To Do',
          'in_progress': 'started working on task',
          'done': 'completed task'
        };
        const message = statusMessages[status] || `changed task status to ${status}`;
        const notification = await Notification.createTaskNotification(
          currentTask.created_by,
          `${message}: ${updatedTask.title}`
        );
        if (notification) {
          emitNotification(currentTask.created_by, notification);
        }
      }
      
      if (updatedTask.project_id) {
        const newOrder = await TaskOrderService.getNextOrder(updatedTask.project_id, status);
        await TaskOrderService.setTaskOrder(updatedTask.project_id, status, taskId, newOrder);
        if (previousStatus && previousStatus !== status) {
          await TaskOrderService.removeTask(updatedTask.project_id, previousStatus, taskId);
        }
        await TaskCacheService.invalidateProject(updatedTask.project_id);
      }
      
      // Invalidate caches for assigned_to, old assigned_to, and creator
      if (updatedTask.assigned_to) {
        await TaskCacheService.invalidateUserTaskCache(updatedTask.assigned_to);
      }
      if (currentTask.assigned_to && currentTask.assigned_to !== updatedTask.assigned_to) {
        await TaskCacheService.invalidateUserTaskCache(currentTask.assigned_to);
      }
      if (currentTask.created_by) {
        await TaskCacheService.invalidateUserTaskCache(currentTask.created_by);
      }
      
      emitTaskUpdated(updatedTask, previousStatus);
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
    
    if (taskOrders.length > 0) {
      const firstTask = await taskModel.findById(taskOrders[0].taskId);
      if (firstTask?.project_id) {
        await TaskOrderService.syncColumn(
          firstTask.project_id, 
          firstTask.status, 
          taskOrders.map(t => t.taskId)
        );
        await TaskCacheService.invalidateProject(firstTask.project_id);
        emitTaskReordered(firstTask.project_id, firstTask.status, taskOrders);
      }
    }
    
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
