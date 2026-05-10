import type { Response } from "express";
import { db } from "../db/index.js";
import { users, tripNotes } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";
import type { AuthRequest } from "../middleware/authMiddleware.js";

// 12. User Profile: Update information and preferences
export const updateProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { firstName, lastName, profilePhoto, languagePreference } = req.body;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const updatedUser = await db
      .update(users)
      .set({ firstName, lastName, profilePhoto, languagePreference })
      .where(eq(users.id, userId))
      .returning();

    res.json(updatedUser[0]);
  } catch (error) {
    res.status(500).json({ message: "Profile update failed", error });
  }
};

// 13. Trip Notes: Add/Edit reminders tied to a trip or stop
export const saveTripNote = async (req: AuthRequest, res: Response) => {
  const { tripId, stopId, content } = req.body;

  try {
    const note = await db
      .insert(tripNotes)
      .values({
        tripId,
        stopId, // Optional: Can be tied to a specific city
        content,
      })
      .returning();

    res.status(201).json(note[0]);
  } catch (error) {
    res.status(500).json({ message: "Failed to save note", error });
  }
};

export const getTripNotes = async (req: AuthRequest, res: Response) => {
  const { tripId } = req.params;

  try {
    const notes = await db.query.tripNotes.findMany({
      where: eq(tripNotes.tripId, parseInt(tripId as string)),
      orderBy: [desc(tripNotes.createdAt)], // Sorted by date
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notes", error });
  }
};

export const updateTripNote = async (req: AuthRequest, res: Response) => {
  const { noteId } = req.params;
  const { content } = req.body;
  try {
    const note = await db
      .update(tripNotes)
      .set({ content })
      .where(eq(tripNotes.id, parseInt(noteId as string)))
      .returning();
    res.json(note[0]);
  } catch (error) {
    res.status(500).json({ message: "Failed to update note", error });
  }
};

export const deleteTripNote = async (req: AuthRequest, res: Response) => {
  const { noteId } = req.params;
  try {
    await db
      .delete(tripNotes)
      .where(eq(tripNotes.id, parseInt(noteId as string)));
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete note", error });
  }
};
