import { create } from "zustand";

export const useMessageStore = create((set) => ({
  messagesByRoom: {},
  loadingByRoom: {},

  setLoading: (roomId, value) =>
    set((s) => ({
      loadingByRoom: { ...s.loadingByRoom, [roomId]: value },
    })),

  addMessage: (roomId, message) =>
    set((state) => {
      const prev = state.messagesByRoom[roomId] || [];

      if (prev.some((m) => m.message_id === message.message_id)) return state;

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
      const existing = new Set(prev.map((m) => m.message_id));
      const filtered = messages.filter((m) => !existing.has(m.message_id));

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

  clearRoom: (roomId) =>
    set((state) => {
      const clone = { ...state.messagesByRoom };
      delete clone[roomId];
      return { messagesByRoom: clone };
    }),
}));
