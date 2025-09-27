require("dotenv").config();
const app = require("./app");
const pool = require("./config/database"); // Kết nối DB

const port = process.env.PORT || 8888;

(async () => {
  try {
    // Kiểm tra kết nối DB
    await pool.getConnection();
    console.log("✅ Database connected successfully!");

    // Start server
    app.listen(port, () => {
      console.log(`🚀 Backend running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("❌ Error connect to DB:", error);
    process.exit(1); // thoát app nếu DB fail
  }
})();
