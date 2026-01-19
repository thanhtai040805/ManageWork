// socket/socketEvents.js
import socket from "./socket";

export const registerSocketEvents = ({
  onNewMessage,
  onEditMessage,
  onDeleteMessage,
  onTyping,
  onUserOnline,
  onUserOffline,
}) => {
  // clear cũ để tránh bị nhân event
  socket.off("message:new");
  socket.off("message:update");
  socket.off("message:delete");
  socket.off("room:typing");
  socket.off("user:online");
  socket.off("user:offline");

  socket.on("message:new", (message) => {
    onNewMessage?.(message);
  });

  socket.on("message:update", (message) => {
    onEditMessage?.(message);
  });

  socket.on("message:delete", ({ messageId }) => {
    onDeleteMessage?.(messageId);
  });

  socket.on("room:typing", ({ userId }) => {
    onTyping?.(userId);
  });

  socket.on("user:online", (userId) => {
    onUserOnline?.(userId);
  });

  socket.on("user:offline", (userId) => {
    onUserOffline?.(userId);
  });
};
