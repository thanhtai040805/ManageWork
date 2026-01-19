const jwt = require("jsonwebtoken");
const userModel = require("../models/user");

const socketAuth = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("AUTH_TOKEN_MISSING"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findByUsername(decoded.username);

    socket.user = {
      uid: decoded.uid,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
      theme_color: user?.theme_color || "#f87171",
      full_name: user?.full_name || null,
      avatar_url: user?.avatar_url || null,
    };

    next();
  } catch (err) {
    console.log("Socket auth error:", err.message);
    next(new Error("INVALID_TOKEN"));
  }
};

module.exports = socketAuth;
