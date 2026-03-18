import { create } from "zustand";

export const useTypingStore = create((set) => ({
  typingUsers: {},

  setTyping: (roomId, userId, isTyping) =>
    set((state) => {
      const users = new Set(state.typingUsers[roomId] || []);
      isTyping ? users.add(userId) : users.delete(userId);

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
