import socket from "./socket";

/**
 * helper emit có ack + timeout
 */
const emitWithAck = (event, payload, timeout = 5000) =>
  new Promise((resolve, reject) => {
    if (!socket.connected) return reject(new Error("Socket not connected"));

    const timer = setTimeout(() => {
      reject(new Error("Timeout"));
    }, timeout);

    socket.emit(event, payload, (res) => {
      clearTimeout(timer);

      if (!res) return resolve(null);
      if (res.ok === false) reject(new Error(res.error));
      else resolve(res.data || res.message || res);
    });
  });

/* ===============================
   MESSAGE
================================= */

export const emitSendMessage = (roomId, content) => {
  return emitWithAck("message:send", { roomId, content });
};

export const emitEditMessage = (payload) => {
  return emitWithAck("message:edit", payload);
};

export const emitDeleteMessage = (payload) => {
  return emitWithAck("message:delete", payload);
};

export const emitGetMessages = (payload) => {
  return emitWithAck("message:get", payload);
};

/* ===============================
   ROOM
================================= */

export const emitOpenRoom = (roomId) => {
  socket.emit("room:open", { roomId });
};

/* ===============================
   TYPING (fire & forget)
================================= */

export const emitTyping = (roomId) => {
  socket.emit("typing", { roomId });
};
