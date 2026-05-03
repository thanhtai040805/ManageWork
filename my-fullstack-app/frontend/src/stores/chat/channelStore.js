import { create } from "zustand";
import {
  getCategoriesAPI,
  getMyChannelsAPI,
  createChannelAPI,
  createCategoryAPI,
  deleteChannelAPI,
  deleteCategoryAPI,
} from "@/services/channel.service";

export const useChannelStore = create((set, get) => ({
  categories: [],
  channels: [],
  currentChannel: null,
  loading: false,
  error: null,

  // Get all categories and channels for a project
  fetchChannels: async (projectId) => {
    if (!projectId) {
      // Fetch all accessible channels
      try {
        set({ loading: true });
        const channels = await getMyChannelsAPI();
        set({ channels: channels || [], loading: false });
      } catch (error) {
        set({ error: error.message, loading: false });
      }
      return;
    }

    try {
      set({ loading: true });
      const categories = await getCategoriesAPI(projectId);
      
      // Flatten channels from categories
      const allChannels = categories.reduce((acc, cat) => {
        if (cat.channels) {
          return [...acc, ...cat.channels.map(c => ({ ...c, category_name: cat.name }))];
        }
        return acc;
      }, []);

      set({ 
        categories: categories || [], 
        channels: allChannels,
        loading: false 
      });
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

  // Create new category
  addCategory: async (categoryData) => {
    try {
      const newCategory = await createCategoryAPI(categoryData);
      set(state => ({ 
        categories: [...state.categories, newCategory] 
      }));
      return newCategory;
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

  // Delete category
  removeCategory: async (categoryId) => {
    try {
      await deleteCategoryAPI(categoryId);
      set(state => ({
        categories: state.categories.filter(c => c.category_id !== categoryId)
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
}));

export default useChannelStore;