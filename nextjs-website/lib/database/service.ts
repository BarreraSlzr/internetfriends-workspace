import { Kysely } from "kysely";
import { createKysely } from "@vercel/postgres-kysely";
import { Database } from "./schema";

class DatabaseService {
  private static instance: DatabaseService | null = null;
  private db: Kysely<Database>;

  private constructor() {
    this.db = createKysely<Database>();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public getDb(): Kysely<Database> {
    return this.db;
  }

  // Component Quality Operations
  async upsertComponentQuality(component: {
    component_name: string;
    component_path: string;
    component_type: "atomic" | "molecular" | "organisms";
    quality_score: number;
    max_possible_score: number;
    optimization_status?: "pending" | "in_progress" | "completed" | "failed";
  }) {
    const existing = await this.db
      .selectFrom("component_quality")
      .where("component_path", "=", component.component_path)
      .selectAll()
      .executeTakeFirst();

    if (existing) {
      return await this.db
        .updateTable("component_quality")
        .set({
          ...component,
          optimization_status:
            component.optimization_status || existing.optimization_status,
          last_analyzed: new Date(),
          updated_at: new Date(),
        })
        .where("id", "=", existing.id)
        .returning(["id"])
        .executeTakeFirst();
    } else {
      return await this.db
        .insertInto("component_quality")
        .values({
          ...component,
          optimization_status: component.optimization_status || "pending",
          last_analyzed: new Date(),
        })
        .returning(["id"])
        .executeTakeFirst();
    }
  }

  async getComponentQualityStats() {
    const result = await this.db
      .selectFrom("component_quality")
      .select([
        "component_type",
        this.db.fn.count<number>("id").as("total_components"),
        this.db.fn.avg("quality_score").as("avg_score"),
        this.db.fn.sum("quality_score").as("total_score"),
        this.db.fn.sum("max_possible_score").as("max_possible_total"),
      ])
      .groupBy("component_type")
      .execute();

    const overall = await this.db
      .selectFrom("component_quality")
      .select([
        this.db.fn.count<number>("id").as("total_components"),
        this.db.fn.avg("quality_score").as("avg_score"),
        this.db.fn.sum("quality_score").as("total_score"),
        this.db.fn.sum("max_possible_score").as("max_possible_total"),
      ])
      .executeTakeFirst();

    return { by_type: result, overall };
  }

  // Optimization Run Operations
  async createOptimizationRun(run: {
    total_components: number;
    optimization_type: "phase1" | "phase2" | "comprehensive";
    status?: "running" | "completed" | "failed";
  }) {
    return await this.db
      .insertInto("optimization_runs")
      .values({
        ...run,
        run_timestamp: new Date(),
        status: run.status || "running",
        components_optimized: 0,
        average_score_before: 0,
        average_score_after: 0,
        total_points_gained: 0,
        duration_ms: 0,
      })
      .returning(["id"])
      .executeTakeFirst();
  }

  async updateOptimizationRun(
    id: string,
    updates: {
      components_optimized?: number;
      average_score_before?: number;
      average_score_after?: number;
      total_points_gained?: number;
      duration_ms?: number;
      status?: "running" | "completed" | "failed";
    },
  ) {
    return await this.db
      .updateTable("optimization_runs")
      .set(updates)
      .where("id", "=", id)
      .executeTakeFirst();
  }

  // Quality Metrics Operations
  async recordQualityMetric(metric: {
    component_id: string;
    metric_type:
      | "stamp"
      | "test_id"
      | "props_interface"
      | "disabled_prop"
      | "typescript"
      | "accessibility"
      | "performance";
    metric_value: number;
    max_value: number;
    details?: string;
  }) {
    return await this.db
      .insertInto("quality_metrics")
      .values({
        ...metric,
        measured_at: new Date(),
      })
      .returning(["id"])
      .executeTakeFirst();
  }

  // Component Analysis Operations
  async saveComponentAnalysis(analysis: {
    component_id: string;
    analysis_data: string;
    fossil_hash: string;
    analysis_version: string;
  }) {
    return await this.db
      .insertInto("component_analysis")
      .values(analysis)
      .returning(["id"])
      .executeTakeFirst();
  }

  async getComponentAnalysisHistory(componentId: string, limit = 10) {
    return await this.db
      .selectFrom("component_analysis")
      .where("component_id", "=", componentId)
      .orderBy("created_at", "desc")
      .limit(limit)
      .selectAll()
      .execute();
  }

  // Dashboard Data
  async getDashboardData() {
    const [qualityStats, recentOptimizations, topComponents, bottomComponents] =
      await Promise.all([
        this.getComponentQualityStats(),

        this.db
          .selectFrom("optimization_runs")
          .orderBy("run_timestamp", "desc")
          .limit(5)
          .selectAll()
          .execute(),

        this.db
          .selectFrom("component_quality")
          .orderBy("quality_score", "desc")
          .limit(10)
          .selectAll()
          .execute(),

        this.db
          .selectFrom("component_quality")
          .orderBy("quality_score", "asc")
          .limit(10)
          .selectAll()
          .execute(),
      ]);

    return {
      quality_stats: qualityStats,
      recent_optimizations: recentOptimizations,
      top_components: topComponents,
      bottom_components: bottomComponents,
    };
  }

  // Health check
  async healthCheck() {
    try {
      await this.db
        .selectFrom("component_quality")
        .select("id")
        .limit(1)
        .execute();
      return { status: "healthy", timestamp: new Date().toISOString() };
    } catch (error) {
      return {
        status: "unhealthy",
        error: String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Contact Form Operations
  async upsertContactSubmission(data: {
    first_name: string;
    last_name: string;
    company_name: string;
    email: string;
    project_start_date: string;
    budget: string;
    project_scope: string;
  }) {
    const existing = await this.db
      .selectFrom("contact_submissions")
      .where("email", "=", data.email)
      .selectAll()
      .executeTakeFirst();

    if (existing) {
      return await this.db
        .updateTable("contact_submissions")
        .set({
          ...data,
          updated_at: new Date(),
        })
        .where("id", "=", existing.id)
        .returning(["id"])
        .executeTakeFirst();
    } else {
      return await this.db
        .insertInto("contact_submissions")
        .values(data)
        .returning(["id"])
        .executeTakeFirst();
    }
  }

  async getContactSubmissions(limit = 50) {
    return await this.db
      .selectFrom("contact_submissions")
      .orderBy("created_at", "desc")
      .limit(limit)
      .selectAll()
      .execute();
  }
}

export const dbService = DatabaseService.getInstance();
