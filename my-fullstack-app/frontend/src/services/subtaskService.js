import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8888/v1/api";

export const getTaskSubtasksAPI = async (taskId) => {
  const response = await axios.get(`${API_URL}/subtasks/task/${taskId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
  });
  return response.data;
};

export const createSubtaskAPI = async (taskId, title) => {
  const response = await axios.post(`${API_URL}/subtasks/create`, { taskId, title }, {
    headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
  });
  return response.data;
};

export const toggleSubtaskAPI = async (subtaskId) => {
  const response = await axios.patch(`${API_URL}/subtasks/${subtaskId}/toggle`, {}, {
    headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
  });
  return response.data;
};

export const deleteSubtaskAPI = async (subtaskId) => {
  const response = await axios.delete(`${API_URL}/subtasks/${subtaskId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
  });
  return response.data;
};

export const updateSubtaskAPI = async (subtaskId, data) => {
  const response = await axios.put(`${API_URL}/subtasks/${subtaskId}`, data, {
    headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
  });
  return response.data;
};
