/**

 * Clear Seeded Data Script

 *

 * Removes all seeded data from the database

 * WARNING: This will delete all data! Use with caution.

 *

 * Usage: npm run seed:clear

 */

import { AppDataSource } from "../config/database";

async function clearData() {
  console.log("🗑️  Starting data cleanup...\n");

  try {
    await AppDataSource.initialize();

    console.log("✅ Database connected\n");

    // Delete in reverse order of dependencies

    const tables = [
      "notifications",

      "notification_preferences",

      "feedback_replies",

      "feedbacks",

      "messages",

      "term_reports",

      "behaviors",

      "tests",

      "assignments",

      "attendances",

      "students",

      "parents",

      "classes",

      "teachers",

      "subjects",

      "admins",
    ];

    for (const table of tables) {
      const result = await AppDataSource.query(`DELETE FROM ${table}`);

      console.log(`✅ Cleared ${table}`);
    }

    console.log("\n🎉 All seeded data has been cleared!\n");
  } catch (error) {
    console.error("❌ Clear failed:", error);

    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

clearData()
  .then(() => process.exit(0))

  .catch((error) => {
    console.error("Fatal error:", error);

    process.exit(1);
  });
