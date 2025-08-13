import {
  NewComponentQuality,
  ComponentQualityUpdate,
  NewOptimizationRun,
  OptimizationRunUpdate,
  NewQualityMetric,
  NewComponentAnalysis,
} from "./schema";
import { db } from "./connection";

// Component Quality Operations
export async function upsertComponentQuality(
  data: NewComponentQuality,
  id?: string,
) {
  if (id) {
    return await db
      .updateTable("component_quality")
      .set({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .where("id", "=", id)
      .returning(["id"])
      .executeTakeFirst();
  }

  return await db
    .insertInto("component_quality")
    .values(data)
    .returning(["id"])
    .executeTakeFirst();
}

export async function getComponentQuality(id: string) {
  return await db
    .selectFrom("component_quality")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
}

export async function getComponentQualityStats() {
  const result = await db
    .selectFrom("component_quality")
    .select([
      "component_type",
      db.fn.count<number>("id").as("total_components"),
      db.fn.avg("quality_score").as("avg_score"),
      db.fn.sum("quality_score").as("total_score"),
      db.fn.sum("max_possible_score").as("max_possible_total"),
    ])
    .groupBy("component_type")
    .execute();

  const overall = await db
    .selectFrom("component_quality")
    .select([
      db.fn.count<number>("id").as("total_components"),
      db.fn.avg("quality_score").as("avg_score"),
      db.fn.sum("quality_score").as("total_score"),
      db.fn.sum("max_possible_score").as("max_possible_total"),
    ])
    .executeTakeFirst();

  return { by_type: result, overall };
}

// Optimization Run Operations
export async function createOptimizationRun(data: NewOptimizationRun) {
  return await db
    .insertInto("optimization_runs")
    .values(data)
    .returning(["id"])
    .executeTakeFirst();
}

export async function updateOptimizationRun(
  id: string,
  updates: OptimizationRunUpdate,
) {
  return await db
    .updateTable("optimization_runs")
    .set(updates)
    .where("id", "=", id)
    .executeTakeFirst();
}

// Quality Metrics Operations
export async function recordQualityMetric(data: NewQualityMetric) {
  return await db
    .insertInto("quality_metrics")
    .values(data)
    .returning(["id"])
    .executeTakeFirst();
}

// Component Analysis Operations
export async function saveComponentAnalysis(data: NewComponentAnalysis) {
  return await db
    .insertInto("component_analysis")
    .values(data)
    .returning(["id"])
    .executeTakeFirst();
}

export async function getComponentAnalysisHistory(
  componentId: string,
  limit = 10,
) {
  return await db
    .selectFrom("component_analysis")
    .where("component_id", "=", componentId)
    .orderBy("created_at", "desc")
    .limit(limit)
    .selectAll()
    .execute();
}

// Dashboard Data
export async function getDashboardData() {
  const [qualityStats, recentOptimizations, topComponents, bottomComponents] =
    await Promise.all([
      getComponentQualityStats(),

      db
        .selectFrom("optimization_runs")
        .orderBy("created_at", "desc")
        .limit(5)
        .selectAll()
        .execute(),

      db
        .selectFrom("component_quality")
        .orderBy("quality_score", "desc")
        .limit(10)
        .selectAll()
        .execute(),

      db
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
export async function healthCheck() {
  try {
    await db.selectFrom("component_quality").select("id").limit(1).execute();
    return { status: "healthy", timestamp: new Date().toISOString() };
  } catch (error) {
    return {
      status: "unhealthy",
      error: String(error),
      timestamp: new Date().toISOString(),
    };
  }
}
