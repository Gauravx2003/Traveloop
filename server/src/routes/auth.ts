import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { protect } from "../middleware/authMiddleware.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";

import { upload } from "../config/cloudinary.js";

const router = express.Router();

const generateToken = (id: number) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: "30d",
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  "/register",
  upload.single("image"),
  async (req, res): Promise<any> => {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        phone,
        city,
        country,
        additionalInfo,
      } = req.body;

      const userExists = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .execute();

      if (userExists.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await db
        .insert(users)
        .values({
          firstName,
          lastName,
          email,
          password: hashedPassword,
          phone,
          city,
          country,
          additionalInfo,
          ...(req.file && { profilePhoto: req.file.path }),
        })
        .returning();

      if (newUser[0]) {
        res.status(201).json({
          id: newUser[0].id,
          firstName: newUser[0].firstName,
          lastName: newUser[0].lastName,
          email: newUser[0].email,
          token: generateToken(newUser[0].id),
        });
      } else {
        res.status(400).json({ message: "Invalid user data" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// @route   POST /api/auth/login
// @desc    Auth user & get token
// @access  Public
router.post("/login", async (req, res): Promise<any> => {
  try {
    const { email, password } = req.body;

    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .execute();

    if (
      user.length > 0 &&
      (await bcrypt.compare(password, user[0]!.password))
    ) {
      res.json({
        id: user[0]!.id,
        firstName: user[0]!.firstName,
        lastName: user[0]!.lastName,
        role: user[0]!.role,
        email: user[0]!.email,
        token: generateToken(user[0]!.id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/auth/me
// @desc    Get user profile
// @access  Private
router.get("/me", protect, async (req: AuthRequest, res): Promise<any> => {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user!.id))
      .execute();
    if (user.length > 0) {
      const { password, ...userData } = user[0];
      res.json(userData);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
