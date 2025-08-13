import { createComponentQualityTable } from "../lib/database/init/component_quality";
import { createOptimizationRunsTable } from "../lib/database/init/optimization_runs";
import { healthCheck } from "../lib/database/queries";

async function setupAllTables() {
  console.log("🔄 Setting up database tables...");

  try {
    // Create all tables
    await createComponentQualityTable();
    await createOptimizationRunsTable();

    // Create quality metrics table
    await createQualityMetricsTable();

    // Create component analysis table
    await createComponentAnalysisTable();

    // Test connection
    const health = await healthCheck();
    console.log("🏥 Database health:", health);

    console.log("✅ All database tables ready!");
  } catch (error) {
    console.error("❌ Database setup failed:", error);
    process.exit(1);
  }
}

async function createQualityMetricsTable() {
  const { db } = await import("../lib/database/connection");
  const { sql } = await import("kysely");

  try {
    await db.schema
      .createTable("quality_metrics")
      .ifNotExists()
      .addColumn("id", "uuid", (col) =>
        col.defaultTo(sql`gen_random_uuid()`).primaryKey(),
      )
      .addColumn("component_id", "uuid", (col) => col.notNull())
      .addColumn("metric_type", "text", (col) => col.notNull())
      .addColumn("metric_value", "real", (col) => col.notNull())
      .addColumn("max_value", "real", (col) => col.notNull())
      .addColumn("details", "text")
      .addColumn("created_at", "timestamptz", (col) =>
        col.defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .execute();

    console.log('Table "quality_metrics" is ready');
  } catch (error) {
    console.error("Error creating quality_metrics table:", error);
  }
}

async function createComponentAnalysisTable() {
  const { db } = await import("../lib/database/connection");
  const { sql } = await import("kysely");

  try {
    await db.schema
      .createTable("component_analysis")
      .ifNotExists()
      .addColumn("id", "uuid", (col) =>
        col.defaultTo(sql`gen_random_uuid()`).primaryKey(),
      )
      .addColumn("component_id", "uuid", (col) => col.notNull())
      .addColumn("analysis_data", "text", (col) => col.notNull())
      .addColumn("fossil_hash", "text", (col) => col.notNull())
      .addColumn("analysis_version", "text", (col) => col.notNull())
      .addColumn("created_at", "timestamptz", (col) =>
        col.defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .execute();

    console.log('Table "component_analysis" is ready');
  } catch (error) {
    console.error("Error creating component_analysis table:", error);
  }
}

if (import.meta.main) {
  setupAllTables();
}
