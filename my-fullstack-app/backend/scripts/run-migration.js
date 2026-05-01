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
    await runMigration("006_recurring_tasks_nullable_project.sql");

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

