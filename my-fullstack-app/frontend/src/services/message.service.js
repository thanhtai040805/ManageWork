import apiClient from "./apiClient";

export const loadMessagesAPI = async (payload) => {
  return await apiClient.post("/v1/api/messages/load", payload);
};

export const searchMessagesAPI = async (payload) => {
  return await apiClient.post("/v1/api/messages/search", payload);
};
