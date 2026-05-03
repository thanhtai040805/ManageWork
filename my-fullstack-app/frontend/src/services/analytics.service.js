import apiClient from "./apiClient";

const BASE_URL = "/v1/api/analytics";

const getVelocityChartAPI = async (projectId = null) => {
  const params = projectId ? { projectId } : {};
  return apiClient.get(`${BASE_URL}/velocity`, { params });
};

const getPerformanceMetricsAPI = async (projectId = null) => {
  const params = projectId ? { projectId } : {};
  return apiClient.get(`${BASE_URL}/metrics`, { params });
};

const getBurndownChartAPI = async (projectId) => {
  return apiClient.get(`${BASE_URL}/project/${projectId}/burndown`);
};

export {
  getVelocityChartAPI,
  getPerformanceMetricsAPI,
  getBurndownChartAPI
};
