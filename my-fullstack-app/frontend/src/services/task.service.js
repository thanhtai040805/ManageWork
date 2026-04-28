import apiClient from "./apiClient";

const createToDoTaskAPI = (
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
  const URL_API = "/v1/api/tasks";
  const data = {
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
    projectId,
  };
  return apiClient.post(URL_API, data);
};

const getTasksAPI = () => {
  const URL_API = "/v1/api/tasks";
  return apiClient.get(URL_API);
}

const deleteTaskByIDAPI = (taskId) => {
  const URL_API = `/v1/api/tasks/${taskId}`;
  return apiClient.delete(URL_API);
}

const editTaskByIDAPI = (taskId, updateData, applyTo = 'this') => {
  const URL_API = `/v1/api/tasks/${taskId}`;
  return apiClient.put(URL_API, { ...updateData, applyTo });
};

const updateTaskStatusAPI = (taskId, status) => {
  const URL_API = `/v1/api/tasks/${taskId}/status`;
  return apiClient.patch(URL_API, { status });
};

export { createToDoTaskAPI, getTasksAPI, deleteTaskByIDAPI, editTaskByIDAPI, updateTaskStatusAPI };

