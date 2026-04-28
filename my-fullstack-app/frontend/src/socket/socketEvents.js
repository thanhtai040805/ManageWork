// socket/socketEvents.js
import socket from "./socket";
import { useTypingStore } from "../stores/chat/typingStore";

const DEBUG = false;
const log = (...args) => DEBUG && console.log("[socketEvents]", ...args);

/**
 * debounce typing clear (auto stop typing)
 */
const typingTimeouts = new Map();
const TYPING_DURATION = 2000;

const handleTyping = (payload) => {
  const { roomId, userId , userName} = payload || {};
  if (!roomId || !userId) return;
  log("room:typing", payload);
  const store = useTypingStore.getState();
  // set typing
  store.setTyping(roomId, userId, userName);

  // clear old timeout
  if (typingTimeouts.has(userId)) {
    clearTimeout(typingTimeouts.get(userId));
  }

  // auto remove typing sau 2s
  const timeout = setTimeout(() => {
    store.removeTyping(roomId, userId);
    typingTimeouts.delete(userId);
  }, TYPING_DURATION);

  typingTimeouts.set(userId, timeout);
};

/**
 * register socket events
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
    onReactionUpdate,
    onPinUpdate,
    onRoomUpdate,
    onUserOnline,
    onUserOffline,
    onOnlineList,
    onConnect,
    onDisconnect,
  } = handlers;

  const wrap = (name, fn) => (payload) => {
    log(name, payload);
    fn?.(payload);
  };

  const listeners = {
    "message:new": wrap("message:new", onNewMessage),
    "message:update": wrap("message:update", onEditMessage),
    "message:delete": wrap("message:delete", onDeleteMessage),
    "message:reaction:update": wrap("message:reaction:update", onReactionUpdate),
    "message:pin:update": wrap("message:pin:update", onPinUpdate),
    "room:update": wrap("room:update", onRoomUpdate),
    "room:typing": handleTyping,
    "user:online": wrap("user:online", onUserOnline),
    "user:offline": wrap("user:offline", onUserOffline),
    "users:online:list": wrap("users:online:list", onOnlineList),

    connect: () => {
      log("connect");
      onConnect?.();
    },

    disconnect: () => {
      log("disconnect");
      onDisconnect?.();
    },
  };

  /**
   * tránh duplicate listeners
   */
  Object.entries(listeners).forEach(([event, handler]) => {
    socket.off(event);
    socket.on(event, handler);
  });

  log("registered events");

  /**
   * cleanup
   */
  return () => {
    Object.entries(listeners).forEach(([event, handler]) => {
      socket.off(event, handler);
    });

    log("cleaned events");
  };
};