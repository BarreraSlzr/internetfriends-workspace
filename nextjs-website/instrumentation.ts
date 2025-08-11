// Temporarily disabled database initialization for development
// import { createContactSubmissionsTable } from "./app/(internetfriends)/lib/db/init/contact_submissions";

export async function setupDatabase() {
  // Database setup disabled for development
  console.log("Database setup temporarily disabled");
  return;

  // Check for required database environment variables
  if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
    console.log("No database configuration found, skipping database setup");
    return;
  }

  console.log("Starting database setup...");

  try {
    // TODO: Implement createContactSubmissionsTable when database schema is ready
    // await Promise.all([createContactSubmissionsTable()]);
    console.log("Instrumentation registered successfully");
    console.log("Database setup completed successfully.");
  } catch (error) {
    console.error("Error during database setup:", error);
    // Don't throw error in development to prevent app crash
    if (process.env.NODE_ENV === "production") {
      throw error;
    }
  }
}

export async function register() {
  if (process.env.NODE_ENV === "production") {
    await setupDatabase();
  }
}
