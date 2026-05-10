import { Router } from "express";
import { getAdminStats, getAllUsers } from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/stats", protect, getAdminStats); // Track trends and platform usage
router.get("/users", protect, getAllUsers); // User management tools

export default router;
