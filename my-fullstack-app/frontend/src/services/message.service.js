import apiClient from "./apiClient";

const BASE_URL = "/v1/api/messages";

export const loadMessagesAPI = ({ roomId, cursorMessageId, cursorCreatedAt }) =>
  apiClient.get(BASE_URL, {
    params: { roomId, cursorMessageId, cursorCreatedAt },
  });

export const searchMessagesAPI = ({ roomId, query }) =>
  apiClient.get(`${BASE_URL}/search`, {
    params: { roomId, query },
  });
