import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Simple test route
app.get("/api", (req: express.Request, res: express.Response) => {
  res.send("Welcome to VitaTrack Backend 🚀");
});

// Import and use all routes
import authRoutes from "./routes/authRoutes.js";
import foodLogRoutes from "./routes/foodLogRoutes.js";
import workoutRoutes from "./routes/workoutRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import nutritionRoutes from "./routes/nutritionRoutes.js";

// Mount API routes FIRST (before static files and catch-all)
app.use("/auth", authRoutes);
app.use("/api/food-logs", foodLogRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/ai", nutritionRoutes);

// Serve tableviewer static files at root
app.use(express.static(path.join(__dirname, 'tableviewer')));

// Catch-all route for tableviewer SPA (must be LAST and NOT match /api or /auth)
app.get('*', (req, res) => {
    // Only serve tableviewer for non-API routes
    if (!req.path.startsWith('/api') && !req.path.startsWith('/auth')) {
        res.sendFile(path.join(__dirname, 'tableviewer', 'index.html'));
    } else {
        // If an API route isn't found, send 404
        res.status(404).json({ error: 'Route not found' });
    }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ VitaTrack server running on port ${PORT}`);
});

export default app;