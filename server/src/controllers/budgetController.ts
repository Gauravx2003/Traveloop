import type { Response } from "express";
import { db } from "../db/index.js";
import { activities, stops, trips, globalActivities } from "../db/schema.js";
import { eq, sql, and } from "drizzle-orm";
import type { AuthRequest } from "../middleware/authMiddleware.js";

// 8. Activity Search: Browse things to do in a specific stop
export const searchActivities = async (req: AuthRequest, res: Response) => {
  const { city, type, maxCost } = req.query;

  try {
    const results = await db.query.globalActivities.findMany({
      where: and(
        eq(globalActivities.cityName, city as string),
        type ? eq(globalActivities.type, type as string) : undefined,
        maxCost ? sql`${globalActivities.cost} <= ${maxCost}` : undefined,
      ),
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Activity search failed", error });
  }
};

// 9. Budget Breakdown: Summarized financial view
export const getTripBudget = async (req: AuthRequest, res: Response) => {
  const { tripId } = req.params;

  try {
    // Breakdown by category (Transport, Stay, Activities, Meals) [cite: 71]
    const breakdown = await db
      .select({
        category: activities.category,
        total: sql<number>`sum(${activities.cost})`,
      })
      .from(activities)
      .innerJoin(stops, eq(activities.stopId, stops.id))
      .where(eq(stops.tripId, parseInt(tripId as string)))
      .groupBy(activities.category);

    // Calculate total cost and average per day [cite: 69, 72]
    const trip = await db.query.trips.findFirst({
      where: eq(trips.id, parseInt(tripId as string)),
    });

    const totalCost = breakdown.reduce(
      (acc, curr) => acc + Number(curr.total),
      0,
    );

    // Logic for "Average cost per day"
    const days =
      trip?.startDate && trip?.endDate
        ? Math.ceil(
            (trip.endDate.getTime() - trip.startDate.getTime()) /
              (1000 * 60 * 60 * 24),
          ) || 1
        : 1;

    res.json({
      totalCost,
      averagePerDay: (totalCost / days).toFixed(2),
      breakdown, // Use this for your Pie/Bar charts
    });
  } catch (error) {
    res.status(500).json({ message: "Error calculating budget", error });
  }
};
