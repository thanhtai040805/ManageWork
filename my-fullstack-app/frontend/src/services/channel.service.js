import apiClient from "./apiClient";

// Categories
const getCategoriesAPI = (projectId) => {
  const URL_API = `/v1/api/channels/categories?project_id=${projectId}`;
  return apiClient.get(URL_API);
};

const createCategoryAPI = (data) => {
  const URL_API = "/v1/api/channels/categories";
  return apiClient.post(URL_API, data);
};

const updateCategoryAPI = (categoryId, data) => {
  const URL_API = `/v1/api/channels/categories/${categoryId}`;
  return apiClient.put(URL_API, data);
};

const deleteCategoryAPI = (categoryId) => {
  const URL_API = `/v1/api/channels/categories/${categoryId}`;
  return apiClient.delete(URL_API);
};

// Channels
const getChannelsAPI = (projectId) => {
  const URL_API = `/v1/api/channels/by-project?project_id=${projectId}`;
  return apiClient.get(URL_API);
};

const getMyChannelsAPI = (projectId = null) => {
  const URL_API = projectId 
    ? `/v1/api/channels/my?project_id=${projectId}` 
    : "/v1/api/channels/my";
  return apiClient.get(URL_API);
};

const getChannelAPI = (channelId) => {
  const URL_API = `/v1/api/channels/${channelId}`;
  return apiClient.get(URL_API);
};

const createChannelAPI = (data) => {
  const URL_API = "/v1/api/channels";
  return apiClient.post(URL_API, data);
};

const updateChannelAPI = (channelId, data) => {
  const URL_API = `/v1/api/channels/${channelId}`;
  return apiClient.put(URL_API, data);
};

const deleteChannelAPI = (channelId) => {
  const URL_API = `/v1/api/channels/${channelId}`;
  return apiClient.delete(URL_API);
};

// Members
const addChannelMemberAPI = (channelId, userId, role = "member") => {
  const URL_API = `/v1/api/channels/${channelId}/members`;
  return apiClient.post(URL_API, { user_id: userId, role });
};

const removeChannelMemberAPI = (channelId, userId) => {
  const URL_API = `/v1/api/channels/${channelId}/members/${userId}`;
  return apiClient.delete(URL_API);
};

const getChannelMembersAPI = (channelId) => {
  const URL_API = `/v1/api/channels/${channelId}/members`;
  return apiClient.get(URL_API);
};

export {
  // Categories
  getCategoriesAPI,
  createCategoryAPI,
  updateCategoryAPI,
  deleteCategoryAPI,
  // Channels
  getChannelsAPI,
  getMyChannelsAPI,
  getChannelAPI,
  createChannelAPI,
  updateChannelAPI,
  deleteChannelAPI,
  // Members
  addChannelMemberAPI,
  removeChannelMemberAPI,
  getChannelMembersAPI,
};