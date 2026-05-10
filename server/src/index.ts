import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import { db } from "./db/index.js"; // Ensure the .js extension is used for ESM
import authRoutes from "./routes/auth.js";
import tripRoutes from "./routes/tripRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get("/health", (req, res) => {
  res.json({ status: "Traveloop API is running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/admin", adminRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Traveloop Server spinning on http://localhost:${PORT}`);
});
