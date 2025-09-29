require("dotenv").config();
const express = require("express");
const apiRoutes = require("./routes/api");
const cors = require("cors");
const pool = require("./config/database");

const app = express();

//config cors
app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/v1/api", apiRoutes);

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
    });
  } catch (error) {
    console.error("❌ Error connect to DB:", error);
    process.exit(1);
  }
})();

module.exports = app;
