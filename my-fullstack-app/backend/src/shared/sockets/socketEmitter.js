let io = null;

const setIO = (socketIO) => {
  io = socketIO;
};

const getIO = () => io;

const emitToProject = (projectId, event, data) => {
  if (io) {
    io.to(`project:${projectId}`).emit(event, data);
  }
};

const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

const emitTaskUpdated = (task, previousStatus) => {
  if (!io || !task) {
    console.log('[SocketEmitter] No io or task, skipping emit');
    return;
  }
  
  const emitData = {
    taskId: task.task_id,
    projectId: task.project_id,
    title: task.title,
    status: task.status,
    previousStatus,
    updatedAt: task.updated_at,
    orderIndex: task.order_index,
  };

  console.log('[SocketEmitter] Emitting task:updated', emitData);

  if (task.project_id) {
    console.log('[SocketEmitter] Emitting to project channel:', `project:${task.project_id}`);
    emitToProject(task.project_id, 'task:updated', emitData);
  }

  if (task.assigned_to) {
    console.log('[SocketEmitter] Emitting to assigned user:', `user:${task.assigned_to}`);
    emitToUser(task.assigned_to, 'task:updated', emitData);
  }

  if (task.created_by) {
    console.log('[SocketEmitter] Emitting to creator:', `user:${task.created_by}`);
    emitToUser(task.created_by, 'task:updated', emitData);
  }
};

const emitTaskReordered = (projectId, columnId, tasks) => {
  if (!io || !projectId) return;
  
  emitToProject(projectId, 'task:reordered', {
    columnId,
    tasks,
    projectId,
  });
};

const emitNotification = (userId, notification) => {
  if (io && userId) {
    emitToUser(userId, 'notification:new', notification);
  }
};

module.exports = {
  setIO,
  getIO,
  emitToProject,
  emitToUser,
  emitTaskUpdated,
  emitTaskReordered,
  emitNotification,
};