const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const registerSocketEvents = require("./socketEvents");
const socketAuth = require("../middlewares/socketAuth");
const { pub, sub } = require("../redis/redis");
const initRealtimeSubscriber = require("./presenceSubscriber");


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


  // ✅ chỉ dùng adapter nếu Redis bật
  if (process.env.REDIS_ENABLED === "true" && pub && sub) {
    io.adapter(createAdapter(pub, sub));
  }

  io.on("connection", (socket) => {
    console.log("🟢 Connected:", socket.id);

    if (!socket.user) {
      console.log("❌ no user in socket");
      socket.disconnect();
      return;
    }

    socket.join(`user:${socket.user.uid}`);

    if (socket._registered) return;
    socket._registered = true;

    socket.onAny((event, ...args) => {
      console.log("SERVER GOT EVENT:", event, args);
    });

    registerSocketEvents(io, socket);
  });

  return io;
};

module.exports = initSocket;