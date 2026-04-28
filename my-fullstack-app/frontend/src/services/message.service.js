import apiClient from "./apiClient";

const BASE_URL = "/v1/api/chat";

export const loadMessagesAPI = ({ roomId, cursorMessageId, cursorCreatedAt }) =>
  apiClient.get(`${BASE_URL}/messages/load`, {
    params: { roomId, cursorMessageId, cursorCreatedAt },
  });

export const searchMessagesAPI = ({ roomId, query }) =>
  apiClient.get(`${BASE_URL}/messages/search`, {
    params: { roomId, query },
  });
