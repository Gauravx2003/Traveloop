import { Router } from "express";
import { createTrip, getDashboardData } from "../controllers/tripController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Dashboard route [cite: 32]
router.get("/dashboard", protect, getDashboardData);

// Create trip route [cite: 36]
router.post("/create", protect, createTrip);

export default router;
