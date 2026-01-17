require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "your_password_here",
  database: process.env.DB_NAME || "ManageWork",
});

async function runMigration(migrationFile) {
  try {
    console.log(`🚀 Running migration: ${migrationFile}...`);
    
    const migrationPath = path.join(__dirname, "../src/migrations", migrationFile);
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");
    
    await pool.query(migrationSQL);
    console.log(`✅ Migration ${migrationFile} completed successfully!`);
  } catch (error) {
    console.error(`❌ Migration ${migrationFile} failed:`, error.message);
    throw error;
  }
}

async function runMigrations() {
  try {
    // Run migration 003
    await runMigration("003_chat_feature.sql");

    console.log("🎉 All migrations completed successfully!");
  } catch (error) {
    console.error("❌ Migration process failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations;

