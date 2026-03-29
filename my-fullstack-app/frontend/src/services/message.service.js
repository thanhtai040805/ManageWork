import apiClient from "./apiClient";

const BASE_URL = "/v1/api/message";

export const loadMessagesAPI = ({ roomId, cursorMessageId, cursorCreatedAt }) =>
  apiClient.get(`${BASE_URL}/load`, {
    params: { roomId, cursorMessageId, cursorCreatedAt },
  });

export const searchMessagesAPI = ({ roomId, query }) =>
  apiClient.get(`${BASE_URL}/search`, {
    params: { roomId, query },
  });
