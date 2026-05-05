import apiClient from "./apiClient";

export const channelPostAPI = {
  getPostsByChannel: (channelId) =>
    apiClient.get(`/v1/api/channel-posts/posts-by-channel/${channelId}`),

  getPost: (postId) =>
    apiClient.get(`/v1/api/channel-posts/posts-by-id/${postId}`),

  createPost: (data) =>
    apiClient.post("/v1/api/channel-posts/posts", data),
  
  updatePost: (postId, content) =>
    apiClient.put(`/v1/api/channel-posts/posts/${postId}`, { content }),

  deletePost: (postId) =>
    apiClient.delete(`/v1/api/channel-posts/posts/${postId}`),

  togglePinPost: (postId, isPinned) =>
    apiClient.put(`/v1/api/channel-posts/posts/${postId}/pin`, { is_pinned: isPinned }),

  createReply: (data) =>
    apiClient.post("/v1/api/channel-posts/replies", data),
  
  getReplies: (postId) =>
    apiClient.get(`/v1/api/channel-posts/replies/${postId}`),
  
  updateReply: (replyId, content) =>
    apiClient.put(`/v1/api/channel-posts/replies/${replyId}`, { content }),
  
  deleteReply: (replyId) =>
    apiClient.delete(`/v1/api/channel-posts/replies/${replyId}`),
};

// Pin/Unpin chat room
export const chatRoomPinAPI = {
  togglePin: (roomId, isPinned) => 
    apiClient.put(`/chat/rooms/${roomId}/pin`, { is_pinned: isPinned }),
};