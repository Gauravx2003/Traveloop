import { db } from "./index.js";
import { globalCities, globalActivities } from "./schema.js";

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

  const activitySeeds = [
    {
      cityName: "Paris",
      title: "Louvre Museum",
      type: "Sightseeing",
      cost: "20.00",
      duration: "3h",
    },
    {
      cityName: "Tokyo",
      title: "Shibuya Food Tour",
      type: "Food",
      cost: "55.00",
      duration: "4h",
    },
    {
      cityName: "Bali",
      title: "Surfing Lesson",
      type: "Adventure",
      cost: "30.00",
      duration: "2h",
    },
  ];
  await db.insert(globalActivities).values(activitySeeds);
  console.log("✅ Seeding complete!");
  process.exit(0);
};

seed();
