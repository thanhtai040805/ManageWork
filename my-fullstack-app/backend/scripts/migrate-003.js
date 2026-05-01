const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const fs = require("fs");
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function runMigration() {
  try {
    console.log("🚀 Starting migration 003: Task Full-Text Search...");

    const migrationPath = path.join(
      __dirname,
      "../src/shared/migrations/003_task_full_text_search.sql"
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    await pool.query(migrationSQL);
    console.log("✅ Migration 003 completed successfully!");

  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
