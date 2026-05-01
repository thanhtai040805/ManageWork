require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "managework",
});

async function runMigration() {
  try {
    console.log("🚀 Running migration 005_cloudinary_files.sql...");
    
    const migrationPath = path.join(__dirname, "../src/migrations/005_cloudinary_files.sql");
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");
    
    await pool.query(migrationSQL);
    console.log("✅ Migration 005_cloudinary_files.sql completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();