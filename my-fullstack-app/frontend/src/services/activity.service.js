import apiClient from "./apiClient";

const BASE_URL = "/v1/api/activity";

export const activityService = {
  getUserActivity: (params) =>
    apiClient.get(BASE_URL, { params }),

  getTaskActivity: (taskId, params) =>
    apiClient.get(`${BASE_URL}/task/${taskId}`, { params }),

  getProjectActivity: (projectId, params) =>
    apiClient.get(`${BASE_URL}/project/${projectId}`, { params }),

  getTeamActivity: (teamId, params) =>
    apiClient.get(`${BASE_URL}/team/${teamId}`, { params }),

  getActivityStats: (days = 30) =>
    apiClient.get(`${BASE_URL}/stats`, { params: { days } })
};