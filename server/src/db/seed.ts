import { db } from "./index.js";
import { globalCities } from "./schema.js";

const seed = async () => {
  console.log("🌱 Seeding global cities...");

  const cities = [
    {
      name: "Paris",
      country: "France",
      region: "Europe",
      costIndex: 4,
      popularity: 98,
    },
    {
      name: "Tokyo",
      country: "Japan",
      region: "Asia",
      costIndex: 4,
      popularity: 95,
    },
    {
      name: "Bali",
      country: "Indonesia",
      region: "Asia",
      costIndex: 2,
      popularity: 92,
    },
    {
      name: "New York",
      country: "USA",
      region: "North America",
      costIndex: 5,
      popularity: 99,
    },
    {
      name: "Prague",
      country: "Czech Republic",
      region: "Europe",
      costIndex: 2,
      popularity: 85,
    },
    {
      name: "Mumbai",
      country: "India",
      region: "Asia",
      costIndex: 2,
      popularity: 88,
    },
    {
      name: "Rome",
      country: "Italy",
      region: "Europe",
      costIndex: 3,
      popularity: 94,
    },
    {
      name: "Cape Town",
      country: "South Africa",
      region: "Africa",
      costIndex: 3,
      popularity: 82,
    },
  ];

  await db.insert(globalCities).values(cities);
  console.log("✅ Seeding complete!");
  process.exit(0);
};

seed();
