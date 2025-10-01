import dotenv from "dotenv";
import express from "express";
import cors from "cors";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Simple test route
app.get("/", (req: express.Request, res: express.Response) => {
  res.send("Welcome to VitaTrack Backend 🚀");
});

// Import and use auth routes
import authRoutes from "./routes/authRoutes.js";
app.use("/auth", authRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`✅ VitaTrack server running on port ${PORT}`);
});

export default app;