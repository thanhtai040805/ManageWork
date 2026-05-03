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
const logger = require("./shared/utils/logger");
const { initSentry } = require("./shared/sentry");

const app = express();
const server = http.createServer(app);

// ===== INIT SENTRY =====
initSentry();

// ===== UNHANDLED EXCEPTIONS =====
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", { reason: String(reason) });
  if (process.env.SENTRY_DSN) {
    const { Sentry } = require("./shared/sentry");
    Sentry.captureException(reason);
  }
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", { error: error.message });
  if (process.env.SENTRY_DSN) {
    const { Sentry } = require("./shared/sentry");
    Sentry.captureException(error);
  }
  process.exit(1);
});

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

// Redis health check
app.get("/health/redis", async (req, res) => {
  const { redis } = require("./shared/redis/redis");
  
  if (!redis) {
    return res.status(503).json({
      status: "unavailable",
      reason: "Redis is disabled",
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const start = Date.now();
    await redis.ping();
    const latency = Date.now() - start;

    const onlineUsers = await redis.smembers("online_users");
    
    res.status(200).json({
      status: "healthy",
      latency_ms: latency,
      online_users_count: onlineUsers.length,
      online_users: onlineUsers,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
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
    const client = await pool.connect();
    logger.info("Connected to PostgreSQL successfully");

    const result = await client.query("SELECT NOW()");
    logger.debug("DB Time: " + result.rows[0].now);

    client.release();

    server.listen(port, () => {
      logger.info(`Swagger docs available at http://localhost:${port}/api-docs`);
      logger.info(`Backend + Socket.IO running on http://localhost:${port}`);
      
      if (process.env.REDIS_ENABLED === "true") {
        const { redis } = require("./shared/redis/redis");
        if (redis) {
          redis.del("online_users").then(() => {
            logger.info("Cleared stale online_users in Redis");
          });
        }
      }

      initCronJobs();
      logger.info("Cron jobs started successfully");
    });
  } catch (error) {
    logger.error("Error connecting to DB", { error: error.message });
    process.exit(1);
  }
})();

module.exports = { app, io };