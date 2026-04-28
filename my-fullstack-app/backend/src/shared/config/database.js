// src/config/database.js
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD, // No default password for security
  database: process.env.DB_NAME || "managework",
});

// Fail early if DB password is missing in production
if (process.env.NODE_ENV === "production" && !process.env.DB_PASSWORD) {
  console.error("❌ ERROR: DB_PASSWORD is required in production environment!");
  process.exit(1);
}

module.exports = pool;
