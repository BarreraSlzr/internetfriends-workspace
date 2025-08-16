import { sql } from "kysely";
import { dbService } from "../lib/database/service";

async function createTables() {
  console.log("🔄 Creating component quality database tables...");

  // Create component_quality table
  await dbService
    .getDb()
    .schema.createTable("component_quality")
    .ifNotExists()
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn("component_name", "varchar(255)", (col) => col.notNull())
    .addColumn("component_path", "varchar(500)", (col) =>
      col.notNull().unique(),
    )
    .addColumn("component_type", "varchar(20)", (col) =>
      col
        .notNull()
        .check(sql`component_type IN ('atomic', 'molecular', 'organisms')`),
    )
    .addColumn("quality_score", "real", (col) => col.notNull())
    .addColumn("max_possible_score", "real", (col) => col.notNull())
    .addColumn("optimization_status", "varchar(20)", (col) =>
      col
        .notNull()
        .defaultTo("pending")
        .check(
          sql`optimization_status IN ('pending', 'in_progress', 'completed', 'failed')`,
        ),
    )
    .addColumn("last_analyzed", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("created_at", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("updated_at", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  // Create optimization_runs table
  await dbService
    .getDb()
    .schema.createTable("optimization_runs")
    .ifNotExists()
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn("run_timestamp", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`),
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
    .addColumn("optimization_type", "varchar(20)", (col) =>
      col
        .notNull()
        .check(sql`optimization_type IN ('phase1', 'phase2', 'comprehensive')`),
    )
    .addColumn("status", "varchar(20)", (col) =>
      col
        .notNull()
        .defaultTo("running")
        .check(sql`status IN ('running', 'completed', 'failed')`),
    )
    .addColumn("created_at", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  // Create quality_metrics table
  await dbService
    .getDb()
    .schema.createTable("quality_metrics")
    .ifNotExists()
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn("component_id", "uuid", (col) =>
      col.notNull().references("component_quality.id").onDelete("cascade"),
    )
    .addColumn("metric_type", "varchar(50)", (col) =>
      col
        .notNull()
        .check(
          sql`metric_type IN ('stamp', 'test_id', 'props_interface', 'disabled_prop', 'typescript', 'accessibility', 'performance')`,
        ),
    )
    .addColumn("metric_value", "real", (col) => col.notNull())
    .addColumn("max_value", "real", (col) => col.notNull())
    .addColumn("details", "text")
    .addColumn("measured_at", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("created_at", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  // Create component_analysis table
  await dbService
    .getDb()
    .schema.createTable("component_analysis")
    .ifNotExists()
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn("component_id", "uuid", (col) =>
      col.notNull().references("component_quality.id").onDelete("cascade"),
    )
    .addColumn("analysis_data", "text", (col) => col.notNull())
    .addColumn("fossil_hash", "varchar(64)", (col) => col.notNull())
    .addColumn("analysis_version", "varchar(20)", (col) => col.notNull())
    .addColumn("created_at", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  // Create contact_submissions table
  await dbService
    .getDb()
    .schema.createTable("contact_submissions")
    .ifNotExists()
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn("first_name", "varchar(255)", (col) => col.notNull())
    .addColumn("last_name", "varchar(255)", (col) => col.notNull())
    .addColumn("company_name", "varchar(255)", (col) => col.notNull())
    .addColumn("email", "varchar(255)", (col) => col.notNull())
    .addColumn("project_start_date", "varchar(100)", (col) => col.notNull())
    .addColumn("budget", "varchar(100)", (col) => col.notNull())
    .addColumn("project_scope", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("updated_at", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  // Create indexes for performance
  await dbService
    .getDb()
    .schema.createIndex("idx_component_quality_type")
    .ifNotExists()
    .on("component_quality")
    .column("component_type")
    .execute();

  await dbService
    .getDb()
    .schema.createIndex("idx_component_quality_score")
    .ifNotExists()
    .on("component_quality")
    .column("quality_score")
    .execute();

  await dbService
    .getDb()
    .schema.createIndex("idx_optimization_runs_timestamp")
    .ifNotExists()
    .on("optimization_runs")
    .column("run_timestamp")
    .execute();

  await dbService
    .getDb()
    .schema.createIndex("idx_quality_metrics_component_type")
    .ifNotExists()
    .on("quality_metrics")
    .columns(["component_id", "metric_type"])
    .execute();

  console.log("✅ Database tables created successfully!");
}

async function dropTables() {
  console.log("🔄 Dropping existing tables...");

  await dbService
    .getDb()
    .schema.dropTable("component_analysis")
    .ifExists()
    .execute();
  await dbService
    .getDb()
    .schema.dropTable("quality_metrics")
    .ifExists()
    .execute();
  await dbService
    .getDb()
    .schema.dropTable("optimization_runs")
    .ifExists()
    .execute();
  await dbService
    .getDb()
    .schema.dropTable("component_quality")
    .ifExists()
    .execute();

  console.log("✅ Tables dropped successfully!");
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    if (command === "drop") {
      await dropTables();
    } else if (command === "reset") {
      await dropTables();
      await createTables();
    } else {
      await createTables();
    }

    // Test database connection
    const health = await dbService.healthCheck();
    console.log("🏥 Database health:", health);
  } catch (error) {
    console.error("❌ Database setup failed:", error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
