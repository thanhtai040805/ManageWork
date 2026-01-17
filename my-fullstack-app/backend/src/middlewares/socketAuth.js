const jwt = require("jsonwebtoken");

const socketAuth = (socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];
    if (!token) {
        return next(new Error("Authentication error: Token missing"));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = {
            uid: decoded.uid,
            username: decoded.username,
            role: decoded.role,
        };
        next();
    } catch (err) {
        return next({
          name: "AuthError",
          message: "INVALID_TOKEN",
        });
    }
}


module.exports = socketAuth;


