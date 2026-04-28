import apiClient from "./apiClient";

const BASE_URL = "/v1/api/chat";

export const getMyChatRoomsAPI = () => apiClient.get(`${BASE_URL}/rooms/my`);

export const createChatRoomAPI = (data) =>
  apiClient.post(`${BASE_URL}/rooms/create`, data);

export const addMemberToChatRoomAPI = ({ roomId, memberId, role }) =>
  apiClient.post(`${BASE_URL}/rooms/add-member`, { roomId, memberId, role });

export const searchChatRoomsAndUsersAPI = ({ keyword }) =>
  apiClient.get(`${BASE_URL}/rooms/search`, {
    params: { keyword },
  });

export const getPinnedMessagesAPI = (roomId) =>
  apiClient.get(`${BASE_URL}/rooms/${roomId}/pinned`);

export const updateChatRoomAPI = (roomId, data) =>
  apiClient.put(`${BASE_URL}/rooms/${roomId}/update`, data);