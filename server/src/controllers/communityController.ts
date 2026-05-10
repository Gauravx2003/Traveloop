import type { Response } from "express";
import { db } from "../db/index.js";
import { communityPosts, users } from "../db/schema.js";
import { eq, desc, asc, ilike, and } from "drizzle-orm";
import type { AuthRequest } from "../middleware/authMiddleware.js";

// Fetch community posts with search, filter, and sort
export const getCommunityPosts = async (req: AuthRequest, res: Response) => {
  const { search, category, sortBy } = req.query;

  try {
    let query = db
      .select({
        id: communityPosts.id,
        content: communityPosts.content,
        category: communityPosts.category,
        imageUrl: communityPosts.imageUrl,
        createdAt: communityPosts.createdAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profilePhoto: users.profilePhoto,
        },
      })
      .from(communityPosts)
      .innerJoin(users, eq(communityPosts.userId, users.id));

    // Dynamic Filtering
    const conditions = [];

    if (search && typeof search === "string") {
      conditions.push(ilike(communityPosts.content, `%${search}%`));
    }

    if (category && typeof category === "string" && category !== "All") {
      conditions.push(eq(communityPosts.category, category));
    }

    // Apply AND conditions
    if (conditions.length > 0) {
      // Create a temporary variable to hold the conditions
      const filterCondition = conditions.length === 1 ? conditions[0] : and(...conditions);
      // Create a new variable to hold the modified query to avoid TypeScript errors
      const filteredQuery = query.where(filterCondition);
      
      // Dynamic Sorting on filtered query
      if (sortBy === "oldest") {
        filteredQuery.orderBy(asc(communityPosts.createdAt));
      } else {
        filteredQuery.orderBy(desc(communityPosts.createdAt));
      }
      const posts = await filteredQuery;
      return res.json(posts);
    } else {
      // Dynamic Sorting on unfiltered query
      if (sortBy === "oldest") {
        query.orderBy(asc(communityPosts.createdAt));
      } else {
        query.orderBy(desc(communityPosts.createdAt));
      }
      const posts = await query;
      return res.json(posts);
    }
  } catch (error) {
    console.error("Error fetching community posts:", error);
    res.status(500).json({ message: "Failed to fetch community posts" });
  }
};

// Create a new community post
export const createCommunityPost = async (req: AuthRequest, res: Response) => {
  const { content, category } = req.body;
  const userId = req.user?.id;
  const imageUrl = req.file?.path || req.body.imageUrl;

  if (!userId) return res.status(401).json({ message: "User not found" });
  if (!content) return res.status(400).json({ message: "Content is required" });

  try {
    const newPost = await db
      .insert(communityPosts)
      .values({
        userId,
        content,
        category: category || "General",
        imageUrl: imageUrl || null,
      })
      .returning();

    const postWithUser = await db
      .select({
        id: communityPosts.id,
        content: communityPosts.content,
        category: communityPosts.category,
        imageUrl: communityPosts.imageUrl,
        createdAt: communityPosts.createdAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profilePhoto: users.profilePhoto,
        },
      })
      .from(communityPosts)
      .innerJoin(users, eq(communityPosts.userId, users.id))
      .where(eq(communityPosts.id, newPost[0].id));

    res.status(201).json(postWithUser[0]);
  } catch (error) {
    console.error("Error creating community post:", error);
    res.status(500).json({ message: "Failed to create post" });
  }
};
