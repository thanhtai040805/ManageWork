import apiClient from "./apiClient";

export const getMyChatRoomsAPI = async () => {
  return await apiClient.get("/v1/api/chat-rooms/my-rooms");
};

export const createChatRoomAPI = async (payload) => {
  return await apiClient.post("/v1/api/chat-rooms", payload);
};

export const addMemberToChatRoomAPI = async (payload) => {
  return await apiClient.post("/v1/api/chat-rooms/add-member", payload);
};
