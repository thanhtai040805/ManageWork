import { create } from "zustand";

export const useOnlineStore = create((set) => ({
  onlineUsers: new Set(),

  setOnline: (userId) =>
    set((state) => {
      const newSet = new Set(state.onlineUsers);
      newSet.add(userId);
      return { onlineUsers: newSet };
    }),

  setOffline: (userId) =>
    set((state) => {
      const newSet = new Set(state.onlineUsers);
      newSet.delete(userId);
      return { onlineUsers: newSet };
    }),

  setOnlineList: (users) =>
    set({
      onlineUsers: new Set(users),
    }),

  isOnline: (userId) => {
    return useOnlineStore.getState().onlineUsers.has(userId);
  },
}));