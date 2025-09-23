require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Simple test route
app.get("/", (req, res) => {
  res.send("Welcome to VitaTrack Backend 🚀");
});

// Example API routes (to be filled in)
app.use("/auth", require("./routes/authRoutes"));
app.use("/food", require("./routes/foodRoutes"));
app.use("/workouts", require("./routes/workoutRoutes"));
app.use("/goals", require("./routes/goalRoutes"));

// Start server
app.listen(PORT, () => {
  console.log(`✅ VitaTrack server running on port ${PORT}`);
});