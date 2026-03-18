const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const registerSocketEvents = require("./socketEvents");
const socketAuth = require("../middlewares/socketAuth");

const initSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.use(socketAuth);

  if (process.env.REDIS_ENABLED === "true") {
    const { createRedisClients } = require("../redis/redis");
    const { pub, sub } = createRedisClients();
    io.adapter(createAdapter(pub, sub));
  }

  io.on("connection", (socket) => {
    console.log("🟢 Connected:", socket.id);

    if (!socket.user) {
      console.log("❌ no user in socket");
      socket.disconnect();
      return;
    }

    // chống register nhiều lần
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
