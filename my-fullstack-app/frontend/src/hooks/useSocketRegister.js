import { useEffect } from "react";
import { registerSocketEvents } from "../socket/socketEvents";
import { useMessageStore } from "../stores/chat/messageStore";
import { useTypingStore } from "../stores/chat/typingStore";
// nếu có online store thì import thêm

const useSocketRegister = () => {
  useEffect(() => {
    const cleanup = registerSocketEvents({
      // ========================
      // MESSAGE EVENTS
      // ========================
      onNewMessage: ({ roomId, message }) => {
        console.log("🔥 new message", message);
        useMessageStore.getState().addMessage(roomId, message);
      },

      onEditMessage: ({ roomId, newMessage }) => {
        useMessageStore.getState().editMessage(roomId, newMessage);
      },

      onDeleteMessage: ({ roomId, messageId }) => {
        useMessageStore.getState().removeMessage(roomId, messageId);
      },

      // ========================
      // USER ONLINE / OFFLINE
      // ========================
      onUserOnline: ({ userId }) => {
        console.log("🟢 user online:", userId);

        // nếu bạn có store online
        // useOnlineStore.getState().setOnline(userId);

        // hoặc đơn giản:
        useTypingStore.getState().setOnline?.(userId);
      },

      onUserOffline: ({ userId }) => {
        console.log("🔴 user offline:", userId);

        // useOnlineStore.getState().setOffline(userId);
        useTypingStore.getState().removeOnline?.(userId);
      },

      onOnlineList: ({ users }) => {
        console.log("📋 online list:", users);

        // useOnlineStore.getState().setOnlineList(users);
        useTypingStore.getState().setOnlineList?.(users);
      },

      // ========================
      // SOCKET CONNECTION
      // ========================
      onConnect: () => {
        console.log("✅ socket connected");
      },

      onDisconnect: () => {
        console.log("❌ socket disconnected");

        // có thể clear typing khi disconnect
        useTypingStore.getState().clearAll?.();
      },
    });

    return cleanup;
  }, []);
};

export default useSocketRegister;