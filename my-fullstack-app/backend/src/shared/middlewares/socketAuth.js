const jwt = require("jsonwebtoken");
// Unused userModel removed as JWT payload is trusted

const socketAuth = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("AUTH_TOKEN_MISSING"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Minimize DB calls by trusting JWT payload
    socket.user = {
      uid: decoded.uid,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err) {
    console.log("Socket auth error:", err.message);
    next(new Error("INVALID_TOKEN"));
  }
};

module.exports = socketAuth;
