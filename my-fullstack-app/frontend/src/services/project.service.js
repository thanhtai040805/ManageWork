import apiClient from "./apiClient";

const createProjectAPI = (name, description) => {
  const URL_API = "/v1/api/projects";
  return apiClient.post(URL_API, { name, description });
};

const getProjectsAPI = () => {
  const URL_API = "/v1/api/projects";
  return apiClient.get(URL_API);
};

const getProjectAPI = (projectId) => {
  const URL_API = `/v1/api/projects/${projectId}`;
  return apiClient.get(URL_API);
};

const updateProjectAPI = (projectId, updateData) => {
  const URL_API = `/v1/api/projects/${projectId}`;
  return apiClient.put(URL_API, updateData);
};

const deleteProjectAPI = (projectId) => {
  const URL_API = `/v1/api/projects/${projectId}`;
  return apiClient.delete(URL_API);
};

const getProjectMembersAPI = (projectId) => {
  const URL_API = `/v1/api/projects/${projectId}/members`;
  return apiClient.get(URL_API);
};

const addProjectMemberAPI = (projectId, user_id, role = "viewer") => {
  const URL_API = `/v1/api/projects/${projectId}/members`;
  return apiClient.post(URL_API, { user_id, role });
};

const removeProjectMemberAPI = (projectId, userId) => {
  const URL_API = `/v1/api/projects/${projectId}/members/${userId}`;
  return apiClient.delete(URL_API);
};

const getProjectStatsAPI = (projectId) => {
  const URL_API = `/v1/api/projects/${projectId}/stats`;
  return apiClient.get(URL_API);
};

export {
  createProjectAPI,
  getProjectsAPI,
  getProjectAPI,
  updateProjectAPI,
  deleteProjectAPI,
  getProjectMembersAPI,
  addProjectMemberAPI,
  removeProjectMemberAPI,
  getProjectStatsAPI,
};

