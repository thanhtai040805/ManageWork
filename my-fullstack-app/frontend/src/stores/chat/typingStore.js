import { create } from "zustand";

export const useTypingStore = create((set) => ({
  typingUsers: {},

  setTyping: (roomId, userId, name) =>
    set((state) => {
      const room = state.typingUsers[roomId] || {};

      return {
        typingUsers: {
          ...state.typingUsers,
          [roomId]: {
            ...room,
            [userId]: { userId, name },
          },
        },
      };
    }),

  removeTyping: (roomId, userId) =>
    set((state) => {
      const room = { ...(state.typingUsers[roomId] || {}) };

      delete room[userId];

      return {
        typingUsers: {
          ...state.typingUsers,
          [roomId]: room,
        },
      };
    }),
}));