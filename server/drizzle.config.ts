import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Manually load env here to ensure DATABASE_URL is available
dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is missing in .env file");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql", // This must be exactly 'postgresql'
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
