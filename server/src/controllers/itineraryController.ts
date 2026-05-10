import type { Response } from "express";
import { db } from "../db/index.js";
import { trips, stops, activities } from "../db/schema.js";
import { eq, asc } from "drizzle-orm";
import type { AuthRequest } from "../middleware/authMiddleware.js";

// 4. My Trips (Trip List)
export const getAllUserTrips = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const allTrips = await db.query.trips.findMany({
      where: eq(trips.userId, userId),
      with: {
        stops: true, // Used to show "destination count"
      },
      orderBy: [asc(trips.startDate)],
    });
    res.json(allTrips);
  } catch (error) {
    res.status(500).json({ message: "Error fetching trips", error });
  }
};

// Get Single Trip by ID (for Itinerary Builder)
export const getTripById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const trip = await db.query.trips.findFirst({
      where: (trips, { eq, and }) =>
        and(eq(trips.id, parseInt(id as string)), eq(trips.userId, userId)),
      with: {
        stops: {
          orderBy: (stops, { asc }) => [
            asc(stops.order),
            asc(stops.arrivalDate),
          ],
          with: {
            activities: {
              orderBy: (activities, { asc }) => [asc(activities.startTime)],
            },
          },
        },
      },
    });

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: "Error fetching trip details", error });
  }
};

// 5. Itinerary Builder: Add a Stop (City)
export const addStopToTrip = async (req: AuthRequest, res: Response) => {
  const { tripId, cityName, arrivalDate, departureDate, order } = req.body;

  try {
    const newArrDate = new Date(arrivalDate);
    const newDepDate = new Date(departureDate);

    if (newDepDate < newArrDate) {
      return res
        .status(400)
        .json({ message: "Departure date must be after arrival date" });
    }

    const trip = await db.query.trips.findFirst({
      where: eq(trips.id, tripId),
      with: { stops: true },
    });

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const tripStart = new Date(trip.startDate as Date);
    const tripEnd = new Date(trip.endDate as Date);

    tripStart.setHours(0, 0, 0, 0);
    tripEnd.setHours(23, 59, 59, 999);

    if (newArrDate < tripStart || newDepDate > tripEnd) {
      return res
        .status(400)
        .json({ message: "Stop dates must be within the trip's date range" });
    }

    const hasOverlap = trip.stops.some((stop) => {
      const existingArr = new Date(stop.arrivalDate as Date);
      const existingDep = new Date(stop.departureDate as Date);
      return newArrDate < existingDep && existingArr < newDepDate;
    });

    if (hasOverlap) {
      return res.status(400).json({
        message: "Stop dates overlap with an existing stop in this itinerary",
      });
    }

    const newStop = await db
      .insert(stops)
      .values({
        tripId,
        cityName,
        arrivalDate: newArrDate,
        departureDate: newDepDate,
        order,
      })
      .returning();

    res.status(201).json(newStop[0]);
  } catch (error) {
    res.status(500).json({ message: "Failed to add stop", error });
  }
};

// 5. Itinerary Builder: Assign Activities to Stop
export const addActivityToStop = async (req: AuthRequest, res: Response) => {
  const { stopId, title, cost, category, startTime } = req.body;

  try {
    const stop = await db.query.stops.findFirst({
      where: eq(stops.id, stopId),
      with: { activities: true },
    });

    if (!stop) {
      return res.status(404).json({ message: "Stop not found" });
    }

    if (startTime) {
      const actTime = new Date(startTime);
      const stopArr = new Date(stop.arrivalDate as Date);
      const stopDep = new Date(stop.departureDate as Date);

      stopArr.setHours(0, 0, 0, 0);
      stopDep.setHours(23, 59, 59, 999);

      if (actTime < stopArr || actTime > stopDep) {
        return res.status(400).json({
          message: "Activity time must be within the section's date range",
        });
      }

      const actTimeMs = actTime.getTime();
      const hasDuplicateTime = stop.activities.some((act) => {
        if (!act.startTime) return false;
        return new Date(act.startTime).getTime() === actTimeMs;
      });

      if (hasDuplicateTime) {
        return res.status(400).json({
          message:
            "An activity already exists at this exact date and time in this section",
        });
      }
    }

    const newActivity = await db
      .insert(activities)
      .values({
        stopId,
        title,
        cost: cost.toString(),
        category,
        startTime: startTime ? new Date(startTime) : null,
      })
      .returning();

    res.status(201).json(newActivity[0]);
  } catch (error) {
    res.status(500).json({ message: "Failed to add activity", error });
  }
};

// Delete Trip
export const deleteTrip = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    await db.delete(trips).where(eq(trips.id, parseInt(id as string)));
    res.json({ message: "Trip deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error });
  }
};
