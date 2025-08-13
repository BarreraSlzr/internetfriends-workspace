import { sql } from "kysely";
import { db } from "../connection";

export async function createComponentQualityTable() {
  try {
    await db.schema
      .createTable("component_quality")
      .ifNotExists()
      .addColumn("id", "uuid", (col) =>
        col.defaultTo(sql`gen_random_uuid()`).primaryKey(),
      )
      .addColumn("component_name", "text", (col) => col.notNull())
      .addColumn("component_path", "text", (col) => col.notNull().unique())
      .addColumn("component_type", "text", (col) => col.notNull())
      .addColumn("quality_score", "real", (col) => col.notNull())
      .addColumn("max_possible_score", "real", (col) => col.notNull())
      .addColumn("optimization_status", "text", (col) =>
        col.notNull().defaultTo("pending"),
      )
      .addColumn("last_analyzed", "timestamptz", (col) =>
        col.defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .addColumn("created_at", "timestamptz", (col) =>
        col.defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .addColumn("updated_at", "timestamptz", (col) =>
        col.defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .execute();

    console.log('Table "component_quality" is ready');
  } catch (error) {
    console.error("Error creating component_quality table:", error);
  }
}
