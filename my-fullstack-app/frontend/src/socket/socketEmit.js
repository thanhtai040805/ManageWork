// socket/socketEmit.js
import socket from "./socket";

export const emitTyping = (roomId) => {
  socket.emit("typing", { roomId });
};

export const emitSendMessage = (roomId, content) => {
  socket.emit("message:send", { roomId, content });
};

export const emitGetMessages = (payload) => {
  socket.emit("message:get", payload);
};

export const emitEditMessage = (payload) => {
  socket.emit("message:edit", payload);
};

export const emitDeleteMessage = (payload) => {
  socket.emit("message:delete", payload);
};

export const emitOpenRoom = (roomId) => {
  socket.emit("room:open", { roomId });
};
