require("dotenv").config();
const express = require("express");
const apiRoutes = require("./routes/api");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get("/", (req, res) => {
  res.json({ message: "ManageWork API is running!" });
});

const port = process.env.PORT || 8888;

app.listen(port, () => {
  console.log(`🚀 Backend running on http://localhost:${port}`);
});

module.exports = app;
