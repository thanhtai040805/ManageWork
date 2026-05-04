const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const registerSocketEvents = require("./socketEvents");
const socketAuth = require("../middlewares/socketAuth");
const { pub, sub, subRealtime } = require("../redis/redis");
const initRealtimeSubscriber = require("./presenceSubscriber");
const logger = require("../utils/logger");


const socketEmitter = require("./socketEmitter");

const initSocket = (server) => {
  const io = new Server(server, {
    pingInterval: 5000,
    pingTimeout: 5000,
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      credentials: true,
    },
  });

  io.use(socketAuth);

  initRealtimeSubscriber(io);


  if (process.env.REDIS_ENABLED === "true" && pub && sub) {
    io.adapter(createAdapter(pub, sub));
  }

  socketEmitter.setIO(io);

  if (subRealtime) {
    subRealtime.subscribe("chat_messages");
    subRealtime.on("message", (channel, message) => {
      if (channel === "chat_messages") {
        try {
          const data = JSON.parse(message);
          if (data.type === "new_message") {
            io.to(data.roomId).emit("message:new", {
              roomId: data.roomId,
              message: data.message
            });
          }
        } catch (err) {
          logger.error("Chat message subscriber error", { error: err.message });
        }
      }
    });
  }

  io.on("connection", (socket) => {
    logger.info("Socket connected: " + socket.id);

    if (!socket.user) {
      logger.warn("No user in socket");
      socket.disconnect();
      return;
    }

    socket.join(`user:${socket.user.uid}`);

    if (socket._registered) return;
    socket._registered = true;

    socket.onAny((event, ...args) => {
      logger.debug("SERVER GOT EVENT: " + event);
    });

    registerSocketEvents(io, socket);
  });

  return io;
};

module.exports = initSocket;