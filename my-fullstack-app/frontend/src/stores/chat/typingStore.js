import { create } from "zustand";

export const useTypingStore = create((set, get) => ({
  typingUsers: {},

  // ⌨️ set typing với auto clear
  setTyping: (roomId, userId) => {
    set((state) => {
      const users = new Set(state.typingUsers[roomId] || []);
      users.add(userId);

      return {
        typingUsers: {
          ...state.typingUsers,
          [roomId]: Array.from(users),
        },
      };
    });

    // 🔥 auto clear sau 2s (quan trọng)
    setTimeout(() => {
      const current = get().typingUsers[roomId] || [];

      // chỉ remove nếu vẫn còn user đó
      if (current.includes(userId)) {
        get().removeTyping(roomId, userId);
      }
    }, 2000);
  },

  removeTyping: (roomId, userId) =>
    set((state) => {
      const users = new Set(state.typingUsers[roomId] || []);
      users.delete(userId);

      return {
        typingUsers: {
          ...state.typingUsers,
          [roomId]: Array.from(users),
        },
      };
    }),

  clearRoomTyping: (roomId) =>
    set((state) => {
      const clone = { ...state.typingUsers };
      delete clone[roomId];
      return { typingUsers: clone };
    }),
}));