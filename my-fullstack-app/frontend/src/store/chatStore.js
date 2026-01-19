import { create } from "zustand";

export const useChatStore = create((set) => ({
  connected: false,
  currentRoomId: null,

  messagesByRoom: {},
  typingUsers: {},

  setConnected: (status) => set({ connected: status }),
  setCurrentRoom: (roomId) => set({ currentRoomId: roomId }),

  addMessage: (roomId, message) =>
    set((state) => {
      const prev = state.messagesByRoom[roomId] || [];

      if (prev.some((m) => m.message_id === message.message_id)) {
        return state; // ignore duplicate
      }
      return {
        messagesByRoom: {
          ...state.messagesByRoom,
          [roomId]: [...prev, message],
        },
      };
    }),

  setMessages: (roomId, messages) =>
    set((state) => ({
      messagesByRoom: {
        ...state.messagesByRoom,
        [roomId]: messages,
      },
    })),

  prependMessages: (roomId, messages) =>
    set((state) => {
      const prev = state.messagesByRoom[roomId] || [];

      const existingIds = new Set(prev.map((m) => m.message_id));
      const filtered = messages.filter((m) => !existingIds.has(m.message_id));

      return {
        messagesByRoom: {
          ...state.messagesByRoom,
          [roomId]: [...filtered, ...prev],
        },
      };
    }),

  editMessage: (roomId, updatedMessage) =>
    set((state) => ({
      messagesByRoom: {
        ...state.messagesByRoom,
        [roomId]: (state.messagesByRoom[roomId] || []).map((m) =>
          m.message_id === updatedMessage.message_id ? updatedMessage : m,
        ),
      },
    })),

  removeMessage: (roomId, messageId) =>
    set((state) => ({
      messagesByRoom: {
        ...state.messagesByRoom,
        [roomId]: (state.messagesByRoom[roomId] || []).map((m) =>
          m.message_id === messageId ? { ...m, is_deleted: true } : m,
        ),
      },
    })),

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

  clearRoom: (roomId) =>
    set((state) => {
      const clone = { ...state.messagesByRoom };
      delete clone[roomId];
      return { messagesByRoom: clone };
    }),
}));
