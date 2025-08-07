import { createContactSubmissionsTable } from "./app/(internetfriends)/lib/db/init/contact_submissions";

export async function setupDatabase() {
  // Skip database setup in development without proper configuration
  if (process.env.NODE_ENV === "development") {
    console.log("Skipping database setup in development mode");
    return;
  }

  // Check for required database environment variables
  if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
    console.log("No database configuration found, skipping database setup");
    return;
  }

  console.log("Starting database setup...");

  try {
    await Promise.all([createContactSubmissionsTable()]);
    console.log("Database setup completed successfully.");
  } catch (error) {
    console.error("Error during database setup:", error);
    // don't throw error in development to prevent app crash
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
