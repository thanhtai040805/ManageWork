import { useEffect } from "react";
import socket from "../socket/socket";
import { useMessageStore } from "../stores/chat/messageStore";

const useSocketEvents = () => {
  useEffect(() => {
    const store = useMessageStore.getState();

    const onNewMessage = ({ roomId, message }) => {
      store.addMessage(roomId, message);
    };

    const onUpdateMessage = ({ roomId, newMessage }) => {
      store.editMessage(roomId, newMessage);
    };

    const onDeleteMessage = ({ roomId, messageId }) => {
      store.removeMessage(roomId, messageId);
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
