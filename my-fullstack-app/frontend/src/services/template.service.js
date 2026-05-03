import apiClient from "./apiClient";

const BASE_URL = "/v1/api/templates";

export const templateService = {
  getTemplates: () => apiClient.get(BASE_URL),
  
  getTemplate: (templateId) => apiClient.get(`${BASE_URL}/${templateId}`),
  
  createTemplate: (data) => apiClient.post(BASE_URL, data),
  
  deleteTemplate: (templateId) => apiClient.delete(`${BASE_URL}/${templateId}`),
  
  getTaskTemplates: (templateId) => apiClient.get(`${BASE_URL}/${templateId}/tasks`),
  
  createTaskTemplate: (templateId, data) => apiClient.post(`${BASE_URL}/${templateId}/tasks`, data)
};