// socket/socketEmit.js
import socket from "./socket";

/**
 * emit with ack + retry
 */
const emitWithAck = (event, payload, options = {}) => {
  const { timeout = 5000, retries = 1 } = options;

  return new Promise((resolve, reject) => {
    if (!socket || !socket.connected) {
      return reject(new Error("Socket not connected"));
    }

    let attempts = 0;

    const send = () => {
      attempts++;

      const timer = setTimeout(() => {
        if (attempts <= retries) {
          send(); // retry
        } else {
          reject(new Error("Timeout"));
        }
      }, timeout);

      socket.emit(event, payload, (res) => {
        clearTimeout(timer);

        if (!res) return resolve(null);
        if (res.ok === false) return reject(new Error(res.error));

        resolve(res.data || res.message || res);
      });
    };

    send();
  });
};

/**
 * MESSAGE
 */
export const emitSendMessage = (roomId, content) =>
  emitWithAck("message:send", { roomId, content });

export const emitEditMessage = (payload) =>
  emitWithAck("message:edit", payload);

export const emitDeleteMessage = (payload) =>
  emitWithAck("message:delete", payload);

export const emitGetMessages = (payload) =>
  emitWithAck("message:get", payload);

/**
 * ROOM
 */
export const emitOpenRoom = (roomId) => {
  socket.emit("room:open", { roomId });
};

/**
 * TYPING (debounce client)
 */
let typingTimer = null;
const TYPING_DELAY = 500;

export const emitTyping = (roomId) => {
  if (!socket.connected) return;
  if (typingTimer) return;
  socket.emit("typing", { roomId });
  typingTimer = setTimeout(() => {
    typingTimer = null;
  }, TYPING_DELAY);
};