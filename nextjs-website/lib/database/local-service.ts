import { ContactFormData } from "@/lib/database/schema";

// Simple in-memory storage for local development
// In production, this would use the actual Vercel Postgres database
class LocalDatabaseService {
  private contactSubmissions: Map<
    string,
    ContactFormData & { id: string; created_at: Date; updated_at: Date }
  > = new Map();

  async upsertContactSubmission(data: ContactFormData) {
    const id = Math.random().toString(36).substring(7);
    const submission = {
      ...data,
      id,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // In development, just store in memory
    this.contactSubmissions.set(id, submission);

    console.log("✅ Contact form submission stored locally:", {
      id,
      email: data.email,
    });

    return { id };
  }

  async getContactSubmissions(limit = 50) {
    return Array.from(this.contactSubmissions.values())
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
      .slice(0, limit);
  }

  async healthCheck() {
    return {
      status: "healthy (local dev)",
      timestamp: new Date().toISOString(),
      submissions_count: this.contactSubmissions.size,
    };
  }
}

export const localDbService = new LocalDatabaseService();
