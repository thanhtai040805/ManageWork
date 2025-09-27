// src/config/database.js
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "your_password_here",
  database: process.env.DB_NAME || "ManageWork",
});

pool
  .connect()
  .then(() => {
    console.log("✅ Connected to PostgreSQL successfully!");
  })
  .catch((err) => {
    console.error("❌ Error connecting to PostgreSQL:", err);
  });

module.exports = pool;
