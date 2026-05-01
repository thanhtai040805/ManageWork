import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8888/v1/api";

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
});

const getVelocityChartAPI = async (projectId = null) => {
  const params = projectId ? { projectId } : {};
  const response = await axios.get(`${API_URL}/analytics/velocity`, { params, ...getAuthHeaders() });
  return response.data;
};

const getPerformanceMetricsAPI = async (projectId = null) => {
  const params = projectId ? { projectId } : {};
  const response = await axios.get(`${API_URL}/analytics/metrics`, { params, ...getAuthHeaders() });
  return response.data;
};

const getBurndownChartAPI = async (projectId) => {
  const response = await axios.get(`${API_URL}/analytics/project/${projectId}/burndown`, getAuthHeaders());
  return response.data;
};

export {
  getVelocityChartAPI,
  getPerformanceMetricsAPI,
  getBurndownChartAPI
};
