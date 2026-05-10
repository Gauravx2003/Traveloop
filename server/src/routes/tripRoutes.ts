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
  toggleTripVisibility
} from "../controllers/shareController.js";


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

export default router;
