import axios from "./axios.customize";

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
  const URL_API = "/v1/api/createTask";
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
  return axios.post(URL_API, data);
};

const getTasksAPI = () => {
  const URL_API = "/v1/api/tasks";
  return axios.get(URL_API);
}

const deleteTaskByIDAPI = (taskId) => {
  const URL_API = `/v1/api/task/delete/${taskId}`;
  return axios.post(URL_API);
}

const editTaskByIDAPI = (taskId, updateData) => {
  const URL_API = `/v1/api/task/edit/${taskId}`;
  return axios.post(URL_API, { ...updateData });
};

const updateTaskStatusAPI = (taskId, status) => {
  const URL_API = `/v1/api/task/status/${taskId}`;
  return axios.patch(URL_API, { status });
};

export { createToDoTaskAPI, getTasksAPI, deleteTaskByIDAPI, editTaskByIDAPI, updateTaskStatusAPI };
