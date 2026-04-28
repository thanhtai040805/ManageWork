import { create } from "zustand";

export const useChatUIStore = create((set) => ({
  replyingToMessage: null,
  setReplyingToMessage: (message) => set({ replyingToMessage: message }),
  clearReply: () => set({ replyingToMessage: null }),
}));
