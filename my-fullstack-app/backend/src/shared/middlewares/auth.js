const jwt = require("jsonwebtoken");
// Unused userModel removed as JWT payload is trusted

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Minimize DB calls by trusting JWT payload
    // If you need the latest user info (like theme_color), do it in specific endpoints
    req.user = {
      uid: decoded.uid,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ message: "Invalid token or token expired" });
  }
};

module.exports = auth;
