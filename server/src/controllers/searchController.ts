import type { Response } from "express";
import { db } from "../db/index.js";
import { trips, stops, activities, globalCities } from "../db/schema.js";
import { eq, ilike, or, and } from "drizzle-orm";
import type { AuthRequest } from "../middleware/authMiddleware.js";

// 6. Itinerary View: Fetch full trip details with nested data
export const getFullItinerary = async (req: AuthRequest, res: Response) => {
  const { tripId } = req.params;

  try {
    const tripData = await db.query.trips.findFirst({
      where: eq(trips.id, parseInt(tripId as string)),
      with: {
        stops: {
          orderBy: (stops, { asc }) => [asc(stops.order)],
          with: {
            activities: {
              orderBy: (activities, { asc }) => [asc(activities.startTime)],
            },
          },
        },
      },
    });

    if (!tripData) return res.status(404).json({ message: "Trip not found" });
    res.json(tripData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching itinerary", error });
  }
};

// 7. City Search: Find destinations with meta-info
export const searchCities = async (req: AuthRequest, res: Response) => {
  const { query, region } = req.query;

  try {
    const filters = [];

    if (query) {
      filters.push(
        or(
          ilike(globalCities.name, `%${query}%`),
          ilike(globalCities.country, `%${query}%`),
        ),
      );
    }

    if (region) {
      filters.push(eq(globalCities.region, region as string));
    }

    const results = await db.query.globalCities.findMany({
      where: filters.length > 0 ? and(...filters) : undefined,
      orderBy: (globalCities, { desc }) => [desc(globalCities.popularity)],
    });

    console.log(results);

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Search failed", error });
  }
};
