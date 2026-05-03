import apiClient from "./apiClient";

const BASE_URL = "/v1/api/time";

export const timeService = {
  createEntry: (data) => apiClient.post(BASE_URL, data),
  
  getUserEntries: (limit = 50) => apiClient.get(BASE_URL, { params: { limit } }),
  
  getTaskEntries: (taskId) => apiClient.get(`${BASE_URL}/task/${taskId}`),
  
  getTaskTotalTime: (taskId) => apiClient.get(`${BASE_URL}/task/${taskId}/total`),
  
  deleteEntry: (entryId) => apiClient.delete(`${BASE_URL}/${entryId}`)
};