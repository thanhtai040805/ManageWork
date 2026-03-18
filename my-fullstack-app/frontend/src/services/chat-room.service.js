import apiClient from "./apiClient";

const BASE_URL = "/v1/api/chat-rooms";

export const getMyChatRoomsAPI = () => apiClient.get(`${BASE_URL}/my-rooms`);

export const createChatRoomAPI = (data) =>
  apiClient.post(`${BASE_URL}/create`, data);

export const addMemberToChatRoomAPI = ({ roomId, memberId, role }) =>
  apiClient.post(`${BASE_URL}/${roomId}/members`, { memberId, role });

export const searchChatRoomsAndUsersAPI = ({ keyword }) =>
  apiClient.get(`${BASE_URL}/search`, {
    params: { keyword },
  });