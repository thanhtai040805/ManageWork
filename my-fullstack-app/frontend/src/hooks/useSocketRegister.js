import { useEffect } from "react";
import { registerSocketEvents } from "../socket/socketEvents";
import { useMessageStore } from "../stores/chat/messageStore";
import { useTypingStore } from "../stores/chat/typingStore";
import { useOnlineStore } from "../stores/chat/useOnlineStore";
import { useChatStore } from "../stores/chat/chatStore";

const useSocketRegister = () => {
  useEffect(() => {
    const cleanup = registerSocketEvents({
      onNotification: (notification) => {
        // Trigger a custom event or use a store to update Header
        window.dispatchEvent(new CustomEvent("notification:received", { detail: notification }));
      },
      onNewMessage: ({ roomId, message }) => {
        useMessageStore.getState().addMessage(roomId, message);
        useChatStore.getState().updateRoomLastMessage(roomId, message);
      },

      onEditMessage: ({ roomId, newMessage }) => {
        useMessageStore.getState().editMessage(roomId, newMessage);
      },

      onDeleteMessage: ({ roomId, messageId }) => {
        useMessageStore.getState().removeMessage(roomId, messageId);
      },

      onReactionUpdate: ({ roomId, messageId, reactions }) => {
        useMessageStore.getState().updateReactions(roomId, messageId, reactions);
      },

      onPinUpdate: ({ roomId, messageId, isPinned }) => {
        useMessageStore.getState().updatePinStatus(roomId, messageId, isPinned);
      },

      onRoomUpdate: (updatedRoom) => {
        useChatStore.getState().updateRoom(updatedRoom);
      },

      onUserOnline: ({ userId }) => {
        useOnlineStore.getState().setOnline(userId);
      },

      onUserOffline: ({ userId }) => {
        useOnlineStore.getState().setOffline(userId);
      },

      onOnlineList: (users) => {
        useOnlineStore.getState().setOnlineList(users);
      },

      onConnect: () => {
        console.log("✅ socket connected");
      },

      onDisconnect: () => {
        console.log("❌ socket disconnected");
        useTypingStore.getState().clearAll?.();
      },
    });

    return cleanup;
  }, []);
};

export default useSocketRegister;