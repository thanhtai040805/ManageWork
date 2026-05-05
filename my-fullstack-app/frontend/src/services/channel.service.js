import apiClient from "./apiClient";

// Channels
const getChannelsAPI = (projectId) => {
  const URL_API = `/v1/api/channels/by-project?project_id=${projectId}`;
  return apiClient.get(URL_API);
};

const getMyChannelsAPI = (projectId) => {
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