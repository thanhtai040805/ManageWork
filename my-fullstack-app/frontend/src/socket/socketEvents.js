// socket/socketEvents.js
import socket from "./socket";

/**
 * Debug log toggle
 */
const DEBUG = false;
const log = (...args) => DEBUG && console.log("[socketEvents]", ...args);

/**
 * Register socket listeners
 * @param handlers object callback handlers
 * @returns cleanup function
 */
export const registerSocketEvents = (handlers = {}) => {
  if (!socket) {
    console.warn("Socket not initialized");
    return () => {};
  }

  const {
    onNewMessage,
    onEditMessage,
    onDeleteMessage,
    onTyping,
    onUserOnline,
    onUserOffline,
    onConnect,
    onDisconnect,
  } = handlers;

  /**
   * normalize wrapper
   * đảm bảo handler tồn tại mới gọi
   */
  const wrap = (name, fn) => (payload) => {
    log(name, payload);
    fn?.(payload);
  };

  /**
   * listeners map
   */
  const listeners = {
    "message:new": wrap("message:new", onNewMessage),
    "message:update": wrap("message:update", onEditMessage),
    "message:delete": wrap("message:delete", onDeleteMessage),
    "room:typing": wrap("room:typing", onTyping),
    "user:online": wrap("user:online", onUserOnline),
    "user:offline": wrap("user:offline", onUserOffline),
    connect: wrap("connect", onConnect),
    disconnect: wrap("disconnect", onDisconnect),
  };

  /**
   * register listeners
   */
  Object.entries(listeners).forEach(([event, handler]) => {
    socket.on(event, handler);
  });

  log("registered events");

  /**
   * cleanup function
   */
  return () => {
    Object.entries(listeners).forEach(([event, handler]) => {
      socket.off(event, handler);
    });

    log("cleaned events");
  };
};
