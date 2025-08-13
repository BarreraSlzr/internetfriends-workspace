import { sql } from "kysely";
import { db } from "../connection";

export async function createOptimizationRunsTable() {
  try {
    await db.schema
      .createTable("optimization_runs")
      .ifNotExists()
      .addColumn("id", "uuid", (col) =>
        col.defaultTo(sql`gen_random_uuid()`).primaryKey(),
      )
      .addColumn("total_components", "integer", (col) => col.notNull())
      .addColumn("components_optimized", "integer", (col) =>
        col.notNull().defaultTo(0),
      )
      .addColumn("average_score_before", "real", (col) =>
        col.notNull().defaultTo(0),
      )
      .addColumn("average_score_after", "real", (col) =>
        col.notNull().defaultTo(0),
      )
      .addColumn("total_points_gained", "real", (col) =>
        col.notNull().defaultTo(0),
      )
      .addColumn("duration_ms", "integer", (col) => col.notNull().defaultTo(0))
      .addColumn("optimization_type", "text", (col) => col.notNull())
      .addColumn("status", "text", (col) => col.notNull().defaultTo("running"))
      .addColumn("created_at", "timestamptz", (col) =>
        col.defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .execute();

    console.log('Table "optimization_runs" is ready');
  } catch (error) {
    console.error("Error creating optimization_runs table:", error);
  }
}
