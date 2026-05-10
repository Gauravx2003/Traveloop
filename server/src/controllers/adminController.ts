import type { Response } from "express";
import { db } from "../db/index.js";
import { users, trips, stops, activities } from "../db/schema.js";
import { sql, desc, eq, count } from "drizzle-orm";
import type { AuthRequest } from "../middleware/authMiddleware.js";

export const getAdminStats = async (req: AuthRequest, res: Response) => {
  // Security Check: Only admins can access this data
  const user = await db.query.users.findFirst({
    where: eq(users.id, req.user!.id),
  });
  if (user?.role !== "admin")
    return res.status(403).json({ message: "Access Denied" });

  try {
    // 1. Total User Engagement Stats
    const totalUsers = await db.select({ value: count() }).from(users);
    const totalTrips = await db.select({ value: count() }).from(trips);

    // 2. Top Cities/Destinations
    const popularCities = await db
      .select({
        city: stops.cityName,
        count: count(stops.id),
      })
      .from(stops)
      .groupBy(stops.cityName)
      .orderBy(desc(count(stops.id)))
      .limit(5);

    // 3. Trip Creation Trends (Grouped by Month) [cite: 97, 100]
    const tripTrends = await db.execute(sql`
      SELECT TO_CHAR(created_at, 'Mon') as month, COUNT(id) as count
      FROM trips
      GROUP BY month
      ORDER BY MIN(created_at)
    `);

    res.json({
      summary: {
        totalUsers: totalUsers[0]!.value,
        totalTrips: totalTrips[0]!.value,
      },
      popularCities,
      tripTrends: tripTrends.rows,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch admin stats", error });
  }
};

// User Management Tool
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role,
      })
      .from(users);
    res.json(allUsers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};
