import type { Request, Response } from "express";
import { db } from "../db/index.js";
import {
  packingItems,
  trips,
  stops,
  activities,
  tripNotes,
} from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import type { AuthRequest } from "../middleware/authMiddleware.js";

// 10. Packing Checklist: Management Logic
export const getPackingList = async (req: AuthRequest, res: Response) => {
  const { tripId } = req.params;
  try {
    const list = await db.query.packingItems.findMany({
      where: eq(packingItems.tripId, parseInt(tripId as string)),
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: "Error fetching checklist", error });
  }
};

export const togglePackingItem = async (req: AuthRequest, res: Response) => {
  const { itemId } = req.params;
  const { isPacked } = req.body; // Boolean [cite: 77]
  try {
    await db
      .update(packingItems)
      .set({ isPacked })
      .where(eq(packingItems.id, parseInt(itemId as string)));
    res.json({ message: "Item status updated" });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error });
  }
};

export const addPackingItem = async (req: AuthRequest, res: Response) => {
  const { tripId } = req.params;
  const { item, category } = req.body;
  try {
    const newItem = await db
      .insert(packingItems)
      .values({
        tripId: parseInt(tripId as string),
        item,
        category: category || "General",
      })
      .returning();
    res.json(newItem[0]);
  } catch (error) {
    res.status(500).json({ message: "Failed to add packing item", error });
  }
};

export const deletePackingItem = async (req: AuthRequest, res: Response) => {
  const { itemId } = req.params;
  try {
    await db
      .delete(packingItems)
      .where(eq(packingItems.id, parseInt(itemId as string)));
    res.json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete packing item", error });
  }
};

export const resetPackingList = async (req: AuthRequest, res: Response) => {
  const { tripId } = req.params;
  try {
    await db
      .update(packingItems)
      .set({ isPacked: false })
      .where(eq(packingItems.tripId, parseInt(tripId as string)));
    res.json({ message: "Packing list reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to reset packing list", error });
  }
};

// 11. Shared/Public View: Read-only access by share_slug
export const getPublicItinerary = async (req: Request, res: Response) => {
  const { slug } = req.params;
  try {
    const publicTrip = await db.query.trips.findFirst({
      where: and(eq(trips.shareSlug, slug as string), eq(trips.isPublic, true)),
      with: {
        stops: {
          with: { activities: true },
        },
      },
    });

    if (!publicTrip)
      return res
        .status(404)
        .json({ message: "Itinerary not found or private" });
    res.json(publicTrip);
  } catch (error) {
    res.status(500).json({ message: "Error fetching public itinerary", error });
  }
};

export const copyTrip = async (req: AuthRequest, res: Response) => {
  const { slug } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized to copy trip" });
  }

  try {
    // 1. Fetch the public trip with all relations
    const publicTrip = await db.query.trips.findFirst({
      where: and(eq(trips.shareSlug, slug as string), eq(trips.isPublic, true)),
      with: {
        stops: { with: { activities: true, notes: true } },
        packingItems: true,
        notes: true,
      },
    });

    if (!publicTrip) {
      return res
        .status(404)
        .json({ message: "Itinerary not found or private" });
    }

    // 2. Insert new Trip
    const newTrip = await db
      .insert(trips)
      .values({
        userId,
        name: `Copy of ${publicTrip.name}`,
        description: publicTrip.description,
        startDate: publicTrip.startDate,
        endDate: publicTrip.endDate,
        coverPhoto: publicTrip.coverPhoto,
        totalBudget: publicTrip.totalBudget,
        isPublic: false,
        status: "planning",
        shareSlug: Math.random().toString(36).substring(7),
      })
      .returning();

    const newTripId = newTrip[0]!.id;

    // 3. Insert Stops and their Activities/Notes
    if (publicTrip.stops && publicTrip.stops.length > 0) {
      for (const stop of publicTrip.stops) {
        const newStop = await db
          .insert(stops)
          .values({
            tripId: newTripId,
            cityName: stop.cityName,
            arrivalDate: stop.arrivalDate,
            departureDate: stop.departureDate,
            order: stop.order,
          })
          .returning();

        const newStopId = newStop[0]!.id;

        if (stop.activities && stop.activities.length > 0) {
          await db.insert(activities).values(
            stop.activities.map((act) => ({
              stopId: newStopId,
              title: act.title,
              category: act.category,
              cost: act.cost,
              startTime: act.startTime,
              duration: act.duration,
            })),
          );
        }

        if (stop.notes && stop.notes.length > 0) {
          await db.insert(tripNotes).values(
            stop.notes.map((note) => ({
              tripId: newTripId,
              stopId: newStopId,
              content: note.content,
            })),
          );
        }
      }
    }

    // 4. Insert global trip notes (without stopId)
    const globalNotes = publicTrip.notes?.filter((n) => !n.stopId);
    if (globalNotes && globalNotes.length > 0) {
      await db.insert(tripNotes).values(
        globalNotes.map((note) => ({
          tripId: newTripId,
          content: note.content,
        })),
      );
    }

    // 5. Insert Packing Items
    if (publicTrip.packingItems && publicTrip.packingItems.length > 0) {
      await db.insert(packingItems).values(
        publicTrip.packingItems.map((item) => ({
          tripId: newTripId,
          item: item.item,
          category: item.category,
          isPacked: false, // Reset packed status for the copied trip
        })),
      );
    }

    res.status(201).json(newTrip[0]);
  } catch (error) {
    res.status(500).json({ message: "Failed to copy trip", error });
  }
};

export const toggleTripVisibility = async (req: AuthRequest, res: Response) => {
  const { tripId } = req.params;
  const { isPublic } = req.body;
  try {
    const updated = await db
      .update(trips)
      .set({ isPublic })
      .where(eq(trips.id, parseInt(tripId as string)))
      .returning();
    res.json(updated[0]);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update visibility", error: err });
  }
};
