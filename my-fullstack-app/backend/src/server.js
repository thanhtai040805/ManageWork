require("dotenv").config();
const express = require("express");
const apiRoutes = require("./routes/api");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const pool = require("./config/database");
const errorHandler = require("./middlewares/errorHandler");
const { swaggerDocs } = require("./config/swagger");

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
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
app.use("/v1/api", apiRoutes);

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

    app.listen(port, () => {
      console.log(`🚀 Backend running on http://localhost:${port}`);
      console.log(
        `� Swagger docs available at http://localhost:${port}/api-docs`
      );
      console.log(`📊 Health check: http://localhost:${port}/health`);
    });
  } catch (error) {
    console.error("❌ Error connect to DB:", error);
    process.exit(1);
  }
})();

module.exports = app;
