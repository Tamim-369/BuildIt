import { storage } from "./storage";
import "./db"; // Initialize MongoDB connection

async function seedDatabase() {
  console.log("Seeding MongoDB database with educational content...");

  const contentItems = [
    {
      title: "Low-Fat Smoothie Recipe",
      description: "Easy-to-digest smoothie recipe specifically designed to help manage nausea during GLP-1 treatment.",
      type: "nutrition",
      tags: ["nausea", "high-fiber"],
      url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      duration: "5 min read"
    },
    {
      title: "5-Minute Energy Boost Walk",
      description: "Gentle walking routine designed to combat fatigue while maintaining your treatment schedule.",
      type: "exercise", 
      tags: ["fatigue"],
      url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      duration: "8 min watch"
    },
    {
      title: "Managing Treatment Plateaus",
      description: "Proven strategies to overcome weight loss plateaus during GLP-1 treatment.",
      type: "behavioral",
      tags: ["plateau", "motivation"],
      url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      duration: "12 min watch"
    },
    {
      title: "Anti-Nausea Meal Planning",
      description: "Weekly meal plans designed to minimize digestive side effects.",
      type: "nutrition",
      tags: ["nausea", "meal-planning"],
      url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      duration: "7 min read"
    }
  ];

  try {
    for (const item of contentItems) {
      await storage.createContent(item);
      console.log(`Created content: ${item.title}`);
    }
    console.log("MongoDB database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding MongoDB database:", error);
  }
}

// Run the seed function
seedDatabase().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});

export { seedDatabase };