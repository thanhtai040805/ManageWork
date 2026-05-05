require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "your_password_here",
  database: process.env.DB_NAME || "managework",
});

async function setupDatabase() {
  try {
    console.log("🚀 Starting database setup...");

    // Get all migration files in order
    const migrationsDir = path.join(__dirname, "../src/migrations");
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    // Run each migration
    for (const file of files) {
      const migrationPath = path.join(migrationsDir, file);
      const migrationSQL = fs.readFileSync(migrationPath, "utf8");
      
      try {
        await pool.query(migrationSQL);
        console.log(`✅ Migration ${file} completed`);
      } catch (err) {
        // Ignore "already exists" errors
        if (!err.message.includes('already exists') && !err.message.includes('duplicate')) {
          console.log(`⚠️  ${file}: ${err.message}`);
        }
      }
    }

    // Test the setup
    const result = await pool.query("SELECT COUNT(*) FROM users");
    console.log(`📊 Users table created with ${result.rows[0].count} records`);
    
    // Test other tables
    const tables = [
      'team_members',
      'projects',
      'tasks',
      'tags',
      'comments',
      'chat_rooms',
      'messages',
      'files',
      'events',
      'notifications',
      'activity_logs'
    ];
    for (const table of tables) {
      try {
        await pool.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`✅ Table ${table} created successfully`);
      } catch (error) {
        console.log(`❌ Error with table ${table}:`, error.message);
      }
    }

    console.log("🎉 Database setup completed successfully!");
  } catch (error) {
    console.error("❌ Database setup failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
