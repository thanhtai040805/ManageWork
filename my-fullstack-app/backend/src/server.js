require("dotenv").config();
const express = require("express");
const http = require("http");
const initSocket = require("./sockets/socket");
const rootRouter = require("./routes/index");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const pool = require("./config/database");
const errorHandler = require("./middlewares/errorHandler");
const { swaggerDocs } = require("./config/swagger");
const { initCronJobs } = require("./cron");

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
      initCronJobs();
      console.log("✅ Cron jobs started successfully!");
    });
  } catch (error) {
    console.error("❌ Error connect to DB:", error);
    process.exit(1);
  }
})();

module.exports = { app, io };