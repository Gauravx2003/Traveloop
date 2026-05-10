import { Router } from "express";
import { createTrip, getDashboardData } from "../controllers/tripController.js";
import {
  getAllUserTrips,
  getTripById,
  addStopToTrip,
  addActivityToStop,
  deleteTrip,
} from "../controllers/itineraryController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  getFullItinerary,
  searchCities,
} from "../controllers/searchController.js";

const router = Router();

// Dashboard & List View
router.get("/dashboard", protect, getDashboardData);
router.get("/list", protect, getAllUserTrips); // [cite: 41]
router.get("/:id", protect, getTripById); // Ensure this is below specific routes like /dashboard and /list

// Trip Management
router.post("/create", protect, createTrip); // [cite: 36]
router.delete("/:id", protect, deleteTrip); //

// Itinerary Builder [cite: 47]
router.post("/stops", protect, addStopToTrip); //
router.post("/activities", protect, addActivityToStop); //

// 6. Itinerary View (Supports timeline/list view toggles)
router.get("/itinerary/:tripId", protect, getFullItinerary); //

// 7. City Search (Supports discovery with cost index and country info)
router.get("/search/cities", protect, searchCities); // [cite: 58, 62]

export default router;
