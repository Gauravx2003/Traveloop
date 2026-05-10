import type { Response } from "express";
import { db } from "../db/index.js";
import { trips, stops, activities } from "../db/schema.js";
import { eq, desc, sql } from "drizzle-orm";
import type { AuthRequest } from "../middleware/authMiddleware.js";

// Create Trip: Form to initiate a new trip [cite: 37]
export const createTrip = async (req: AuthRequest, res: Response) => {
  const { name, description, startDate, endDate, totalBudget } = req.body;
  const coverPhoto = req.file?.path || req.body.coverPhoto;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: "User not found" });

  try {
    const newTrip = await db
      .insert(trips)
      .values({
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        coverPhoto,
        totalBudget: totalBudget ? totalBudget.toString() : "0",
        userId,
        shareSlug: Math.random().toString(36).substring(7),
      })
      .returning();

    res.status(201).json(newTrip[0]);
  } catch (error) {
    res.status(500).json({ message: "Failed to create trip", error });
  }
};

// Dashboard Data: Recent trips, budget highlights, and quick actions [cite: 33, 35]
export const getDashboardData = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const recentTrips = await db.query.trips.findMany({
      where: eq(trips.userId, userId),
      limit: 5,
      orderBy: [desc(trips.createdAt)],
      with: {
        stops: true, // For destination count
      },
    });

    // Simple Budget Highlights: Total spent across all trips
    const budgetSummary = await db
      .select({
        totalBudget: sql<number>`sum(${activities.cost})`,
      })
      .from(activities)
      .innerJoin(stops, eq(activities.stopId, stops.id))
      .innerJoin(trips, eq(stops.tripId, trips.id))
      .where(eq(trips.userId, userId));

    res.json({
      welcomeMessage: "Welcome back, Traveler!",
      recentTrips,
      budgetHighlights: budgetSummary[0]?.totalBudget || 0,
    });
  } catch (error) {
    console.log("ERROR: ", error);
    res.status(500).json({ message: "Error fetching dashboard", error });
  }
};
