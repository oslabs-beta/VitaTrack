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
app.get("/api", (req, res) => {
    res.send("Welcome to VitaTrack Backend 🚀");
});
// Import and use auth routes
import authRoutes from "./routes/authRoutes.js";
app.use("/auth", authRoutes);
// Serve tableviewer static files at root
app.use(express.static(path.join(__dirname, 'tableviewer')));
// Catch-all route for tableviewer SPA (must be LAST)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'tableviewer', 'index.html'));
});
// Start server
app.listen(PORT, () => {
    console.log(`✅ VitaTrack server running on port ${PORT}`);
});
export default app;
