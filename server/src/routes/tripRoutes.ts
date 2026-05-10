import { Router } from "express";
import { createTrip, getDashboardData } from "../controllers/tripController.js";
import { upload } from "../config/cloudinary.js";
import {
  getAllUserTrips,
  getTripById,
  addStopToTrip,
  addActivityToStop,
  deleteTrip,
} from "../controllers/itineraryController.js";
import { protect, type AuthRequest } from "../middleware/authMiddleware.js";
import {
  getFullItinerary,
  searchCities,
} from "../controllers/searchController.js";
import {
  searchActivities,
  getTripBudget,
} from "../controllers/budgetController.js";
import {
  getPackingList,
  getPublicItinerary,
  togglePackingItem,
  addPackingItem,
  deletePackingItem,
  resetPackingList,
  copyTrip,
  toggleTripVisibility,
} from "../controllers/shareController.js";
import {
  getTripNotes,
  saveTripNote,
  updateProfile,
  updateTripNote,
  deleteTripNote,
} from "../controllers/userController.js";
import { db } from "../db/index.js";
import { trips, users } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router = Router();

// Dashboard & List View
router.get("/dashboard", protect, getDashboardData);
router.get("/list", protect, getAllUserTrips); // [cite: 41]
router.get("/:id", protect, getTripById); // Ensure this is below specific routes like /dashboard and /list

// Trip Management
router.post("/create", protect, upload.single("coverPhoto"), createTrip); // [cite: 36]
router.delete("/:id", protect, deleteTrip); //

// Itinerary Builder [cite: 47]
router.post("/stops", protect, addStopToTrip); //
router.post("/activities", protect, addActivityToStop); //

// 6. Itinerary View (Supports timeline/list view toggles)
router.get("/itinerary/:tripId", protect, getFullItinerary); //

// 7. City Search (Supports discovery with cost index and country info)
router.get("/search/cities", protect, searchCities); // [cite: 58, 62]

// 8. Activity Search
router.get("/search/activities", protect, searchActivities);

// 9. Budget Breakdown
router.get("/budget/:tripId", protect, getTripBudget);

// 10. Packing Checklist (Protected)
router.get("/:tripId/packing", protect, getPackingList); // [cite: 76]
router.post("/:tripId/packing", protect, addPackingItem);
router.patch("/packing/:itemId", protect, togglePackingItem); // [cite: 77]
router.delete("/packing/:itemId", protect, deletePackingItem);
router.patch("/:tripId/packing/reset", protect, resetPackingList);

// 11. Shared/Public View (Public - No Auth Required)
router.get("/share/:slug", getPublicItinerary); // [cite: 80, 85]
router.post("/share/:slug/copy", protect, copyTrip);
router.patch("/:tripId/share", protect, toggleTripVisibility);

// 12. User Profile / Settings
router.put("/profile", protect, updateProfile); // Supports name, photo, and language

// 13. Trip Notes / Journal
router.post("/notes", protect, saveTripNote); // Tie notes to specific trip/day [cite: 92]
router.get("/notes/:tripId", protect, getTripNotes); // View notes list sorted by date
router.put("/notes/:noteId", protect, updateTripNote);
router.delete("/notes/:noteId", protect, deleteTripNote);

// Upload Trip Cover Photo
router.post(
  "/upload-cover/:tripId",
  protect,
  upload.single("image"),
  async (req, res) => {
    if (!req.file) return res.status(400).send("No file uploaded.");

    const { tripId } = req.params;
    const imageUrl = req.file.path; // Cloudinary URL

    try {
      await db
        .update(trips)
        .set({ coverPhoto: imageUrl })
        .where(eq(trips.id, parseInt(tripId as string)));

      res.json({ imageUrl });
    } catch (error) {
      res.status(500).json({ message: "Update failed", error });
    }
  },
);

// Upload Profile Photo
router.post(
  "/upload-profile",
  protect,
  upload.single("image"),
  async (req: AuthRequest, res) => {
    if (!req.file) return res.status(400).send("No file uploaded.");

    const userId = req.user?.id;
    const imageUrl = req.file.path;

    try {
      await db
        .update(users)
        .set({ profilePhoto: imageUrl })
        .where(eq(users.id, userId!));

      res.json({ imageUrl });
    } catch (error) {
      res.status(500).json({ message: "Update failed", error });
    }
  },
);

export default router;
