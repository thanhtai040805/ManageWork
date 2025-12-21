const jwt = require("jsonwebtoken");
const userModel = require("../models/user");
require("dotenv");

const auth = async (req, res, next) => {
  const whiteList = ["/", "/register", "/login"];
  if (whiteList.find((item) => "/v1/api" + item === req.originalUrl)) {
    next();
  } else {
    if (req?.headers?.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Fetch user data from database to get theme_color and other user info
        const user = await userModel.findByUsername(decoded.username);
        
        req.user = {
          username: decoded.username,
          email: decoded.email,
          uid: decoded.uid,
          role: decoded.role,
          theme_color: user?.theme_color || "#f87171",
          full_name: user?.full_name || null,
          avatar_url: user?.avatar_url || null,
        };
        
        console.log("Decoded:", decoded);
        next();
      } catch (error) {
        res.status(401).json({ message: "Invalid token or token expired" });
      }
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  }
};

module.exports = auth;
