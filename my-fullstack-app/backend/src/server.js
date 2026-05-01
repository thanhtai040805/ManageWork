require("dotenv").config();
const express = require("express");
const path = require("path");
const http = require("http");
const initSocket = require("./shared/sockets/socket");
const rootRouter = require("./routes/index");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const pool = require("./shared/config/database");
const errorHandler = require("./shared/middlewares/errorHandler");
const { swaggerDocs } = require("./shared/config/swagger");
const { initCronJobs } = require("./shared/cron");

const app = express();
const server = http.createServer(app);

// ===== SOCKET.IO INIT =====
const io = initSocket(server);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 *     security: []
 */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Swagger documentation
swaggerDocs(app);

// Routes
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/v1/api", rootRouter);

// Error handling middleware (must be last)
app.use(errorHandler);

const port = process.env.PORT || 8888;

// Start server with database connection test
(async () => {
  try {
    const client = await pool.connect(); // lấy 1 connection
    console.log("✅ Connected to PostgreSQL successfully!");

    // test query đơn giản
    const result = await client.query("SELECT NOW()");
    console.log("⏰ DB Time:", result.rows[0].now);

    client.release(); // trả connection về pool

    server.listen(port, () => {
      console.log(
        `� Swagger docs available at http://localhost:${port}/api-docs`,
      );
      console.log(`🚀 Backend + Socket.IO running on http://localhost:${port}`);
      
      // Clear stale online users on restart
      if (process.env.REDIS_ENABLED === "true") {
        const { redis } = require("./shared/redis/redis");
        if (redis) {
          redis.del("online_users").then(() => {
            console.log("🧹 Cleared stale online_users in Redis");
          });
        }
      }

      initCronJobs();
      console.log("✅ Cron jobs started successfully!");
    });
  } catch (error) {
    console.error("❌ Error connect to DB:", error);
    process.exit(1);
  }
})();

module.exports = { app, io };