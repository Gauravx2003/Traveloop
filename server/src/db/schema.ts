import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  numeric,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";

// 1. User Management [cite: 27, 86]
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  phone: text("phone"),
  city: text("city"),
  country: text("country"),
  additionalInfo: text("additional_info"),
  profilePhoto: text("profile_photo"),
  languagePreference: text("language").default("en"), // [cite: 90]
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. Trips: The central entity [cite: 36, 41]
export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  coverPhoto: text("cover_photo"), // [cite: 40]
  isPublic: boolean("is_public").default(false), // [cite: 22, 79]
  shareSlug: text("share_slug").unique(), // For the Public URL
  status: text("status").default("planning"), // planning, ongoing, completed
});

// 3. Stops: Multi-city itinerary management [cite: 18, 47]
export const stops = pgTable("stops", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").references(() => trips.id, {
    onDelete: "cascade",
  }),
  cityName: text("city_name").notNull(),
  arrivalDate: timestamp("arrival_date"),
  departureDate: timestamp("departure_date"),
  order: integer("order").notNull(), // For reordering cities [cite: 51]
});

// 4. Activities: Categorized events within stops [cite: 19, 52, 63]
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  stopId: integer("stop_id").references(() => stops.id, {
    onDelete: "cascade",
  }),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time"),
  cost: numeric("cost", { precision: 10, scale: 2 }).default("0"), //
  category: text("category").notNull(), // Transport, Stay, Meals, Sightseeing
  duration: text("duration"),
});

// 5. Packing Checklist: Per-trip organization [cite: 73]
export const packingItems = pgTable("packing_items", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").references(() => trips.id, {
    onDelete: "cascade",
  }),
  item: text("item").notNull(),
  isPacked: boolean("is_packed").default(false), // [cite: 77]
  category: text("category").default("General"), // Clothing, Documents, etc. [cite: 77]
});

// 6. Trip Notes/Journal: Important details [cite: 91]
export const tripNotes = pgTable("trip_notes", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").references(() => trips.id, {
    onDelete: "cascade",
  }),
  stopId: integer("stop_id").references(() => stops.id), // Can be tied to a specific city [cite: 95]
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// 7. Global Discovery Data (Read-only for users) [cite: 57, 63]
export const globalCities = pgTable("global_cities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  costIndex: integer("cost_index"), // 1 to 5 scale [cite: 58]
  popularity: integer("popularity"),
  image: text("image_url"),
});
