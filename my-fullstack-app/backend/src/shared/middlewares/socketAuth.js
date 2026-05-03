const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

const socketAuth = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("AUTH_TOKEN_MISSING"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.user = {
      uid: decoded.uid,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err) {
    logger.error("Socket auth error", { error: err.message });
    next(new Error("INVALID_TOKEN"));
  }
};

module.exports = socketAuth;
