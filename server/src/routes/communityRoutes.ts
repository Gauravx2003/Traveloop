import { Router } from "express";
import { getCommunityPosts, createCommunityPost } from "../controllers/communityController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = Router();

// Fetch all community posts with optional filtering/sorting
router.get("/", protect, getCommunityPosts);

// Create a new community post
router.post("/create", protect, upload.single("image"), createCommunityPost);

export default router;
