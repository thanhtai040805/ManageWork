import { create } from "zustand";
import {
  getMyChannelsAPI,
  createChannelAPI,
  deleteChannelAPI,
} from "@/services/channel.service";

export const useChannelStore = create((set, get) => ({
  channels: [],
  currentChannel: null,
  loading: false,
  error: null,
  posts: [],

  // Get all channels for a project
  fetchChannels: async (projectId) => {
    try {
      set({ loading: true });
      const channels = await getMyChannelsAPI(projectId);
      set({ channels: channels || [], loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Create new channel
  addChannel: async (channelData) => {
    try {
      const newChannel = await createChannelAPI(channelData);
      set(state => ({ 
        channels: [...state.channels, newChannel] 
      }));
      return newChannel;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Delete channel
  removeChannel: async (channelId) => {
    try {
      await deleteChannelAPI(channelId);
      set(state => ({
        channels: state.channels.filter(c => c.channel_id !== channelId),
        currentChannel: state.currentChannel?.channel_id === channelId ? null : state.currentChannel
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Set current channel
  setCurrentChannel: (channel) => set({ currentChannel: channel }),
  
  // Clear current channel
  clearCurrentChannel: () => set({ currentChannel: null }),

  // Posts actions for real-time
  setPosts: (posts) => set({ posts }),

  addPost: (post) => set(state => {
    const exists = state.posts.some(p => p.post_id === post.post_id);
    if (exists) return state;
    return { posts: [...state.posts, post] };
  }),

  addReplyToPost: (postId, reply) => set(state => ({
  posts: state.posts.map(p => {
    if (p.post_id !== postId) return p;

    const replies = p.replies || [];

    if (replies.some(r => r.reply_id === reply.reply_id)) {
      return p;
    }
    return {
      ...p,
      replies: [...replies, reply],
      reply_count: (p.reply_count || 0) + 1
    };
  })})),
  
}));

export default useChannelStore;