import { useEffect } from "react";
import socket from "../socket/socket";
import { useChatStore } from "../store/chatStore";

const useSocketEvents = () => {
  useEffect(() => {
    const onNewMessage = ({ roomId, message }) => {
      useChatStore.getState().addMessage(roomId, message);
    };

    const onUpdateMessage = ({ roomId, newMessage }) => {
      useChatStore.getState().editMessage(roomId, newMessage);
    };

    const onDeleteMessage = ({ roomId, messageId }) => {
      useChatStore.getState().removeMessage(roomId, messageId);
    };

    socket.on("message:new", onNewMessage);
    socket.on("message:update", onUpdateMessage);
    socket.on("message:delete", onDeleteMessage);

    return () => {
      socket.off("message:new", onNewMessage);
      socket.off("message:update", onUpdateMessage);
      socket.off("message:delete", onDeleteMessage);
    };
  }, []);
};

export default useSocketEvents;
