#!/usr/bin/env bun
/**
 * generate-docs.ts
 * InternetFriends Documentation Generator
 *
 * Generates human-readable markdown documentation for:
 *   - Registered Zod Schemas (from schemas/registry.ts)
 *   - Canonical Event Catalog (from lib/events/catalog.ts)
 *
 * Output (default):
 *   docs/generated/schemas.md
 *   docs/generated/events.md
 *   docs/generated/summary.json
 *
 * CLI Flags:
 *   --out-dir=docs/generated     Change output directory
 *   --print                      Also print markdown to stdout
 *   --json                       Print JSON summary to stdout (instead of markdown)
 *   --no-write                   Do not write files (dry output to stdout only)
 *   --include-shape              Attempt to include object shape keys for each schema
 *
 * Examples:
 *   bun run scripts/generate-docs.ts
 *   bun run scripts/generate-docs.ts --print
 *   bun run scripts/generate-docs.ts --json
 *   bun run scripts/generate-docs.ts --out-dir=docs/api --include-shape
 *
 * Notes:
 *   - Shape introspection is best-effort; non-object schemas show typeName only.
 *   - This script avoids deep private API reliance; if Zod internals change
 *     it will gracefully fall back to minimal descriptions.
 */

import * as fs from "fs";
import * as path from "path";

// Dynamic imports to avoid hard crashes if modules move mid‑epic
async function safeImport(modulePath: string) {
  try {
    return await import(modulePath);
  } catch {
    return null;
  }
}

interface SchemaDocEntry {
  name: string;
  domain: string;
  version: string;
  description: string;
  tags: string[];
  shapeKeys?: string[];
  zodType?: string;
}

interface EventDocEntry {
  type: string;
  // minimal shape extraction attempt
  fields?: string[];
}

interface Summary {
  generatedAt: string;
  schemaCount: number;
  eventCount: number;
  outputDir: string;
  files: string[];
  includeShape: boolean;
  schemas: SchemaDocEntry[];
  events: EventDocEntry[];
  notes: string[];
}

function getFlag(name: string): string | undefined {
  const prefix = `--${name}=`;
  const arg = process.argv.find((a) => a.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : undefined;
}
function hasFlag(name: string): boolean {
  return (
    process.argv.includes(`--${name}`) ||
    process.argv.includes(`--${name}=true`)
  );
}

const OUT_DIR = getFlag("out-dir") || "docs/generated";
const PRINT = hasFlag("print");
const JSON_ONLY = hasFlag("json");
const NO_WRITE = hasFlag("no-write");
const INCLUDE_SHAPE = hasFlag("include-shape");

async function loadSchemas(): Promise<SchemaDocEntry[]> {
  const mod = await safeImport("../schemas/registry");
  if (!mod) return [];
  const listFn = (mod.getSchemaDocModel || (() => [])) as () => unknown[];
  const model = listFn();

  // We also want to pull actual schema objects to attempt shape keys
  const registry = (mod.SchemaRegistry || []) as Array<{
    name: string;
    schema?: unknown;
  }>;

  const entries: SchemaDocEntry[] = [];

  for (const meta of model) {
    const regEntry = registry.find((r) => r.name === meta.name);
    let shapeKeys: string[] | undefined;
    let zodType: string | undefined;

    if (INCLUDE_SHAPE && regEntry?.schema) {
      try {
        const schema: unknown = regEntry.schema;
        // Zod object detection
        const zodSchema = schema as any;
        if (zodSchema?._def?.typeName === "ZodObject") {
          const shapeDef =
            typeof zodSchema._def.shape === "function"
              ? zodSchema._def.shape()
              : zodSchema._def.shape;
          if (shapeDef && typeof shapeDef === "object") {
            shapeKeys = Object.keys(shapeDef);
          }
        }
        zodType = (schema as any)?._def?.typeName;
      } catch {
        // ignore shape extraction errors
      }
    }

    entries.push({
      name: (meta as any).name,
      domain: (meta as any).domain,
      version: (meta as any).version,
      description: (meta as any).description,
      tags: (meta as any).tags || [],
      shapeKeys,
      zodType,
    });
  }

  return entries.sort((a, b) => a.name.localeCompare(b.name));
}

async function loadEvents(): Promise<EventDocEntry[]> {
  const mod = await safeImport("../lib/events/catalog");
  if (!mod) return [];
  const catalog = (mod.EventCatalog || {}) as Record<string, unknown>;
  const result: EventDocEntry[] = [];

  for (const type of Object.keys(catalog).sort()) {
    let fields: string[] | undefined;
    if (INCLUDE_SHAPE) {
      try {
        const schema: unknown = catalog[type];
        const zodSchema = schema as any;
        if (zodSchema?._def?.typeName === "ZodObject") {
          const shapeDef =
            typeof zodSchema._def.shape === "function"
              ? zodSchema._def.shape()
              : zodSchema._def.shape;
          if (shapeDef && typeof shapeDef === "object") {
            fields = Object.keys(shapeDef);
          }
        }
      } catch {
        // ignore
      }
    }
    result.push({ type, fields });
  }
  return result;
}

function renderSchemasMarkdown(schemas: SchemaDocEntry[]): string {
  const lines: string[] = [];
  lines.push("# Schemas");
  lines.push("");
  lines.push(`Total: ${schemas.length}`);
  lines.push("");

  for (const s of schemas) {
    lines.push(`## ${s.name}`);
    lines.push("");
    lines.push(`- Domain: \`${s.domain}\``);
    lines.push(`- Version: \`${s.version}\``);
    if (s.tags?.length)
      lines.push(`- Tags: ${s.tags.map((t) => "`" + t + "`").join(", ")}`);
    if (s.zodType) lines.push(`- Zod Type: \`${s.zodType}\``);
    lines.push("");
    if (s.description) {
      lines.push(s.description);
      lines.push("");
    }
    if (s.shapeKeys?.length) {
      lines.push("Fields (object keys):");
      lines.push("");
      for (const k of s.shapeKeys) lines.push(`- \`${k}\``);
      lines.push("");
    }
  }
  return lines.join("\n");
}

function renderEventsMarkdown(events: EventDocEntry[]): string {
  const lines: string[] = [];
  lines.push("# Events");
  lines.push("");
  lines.push(`Total: ${events.length}`);
  lines.push("");
  for (const e of events) {
    lines.push(`## ${e.type}`);
    if (e.fields?.length) {
      lines.push("");
      lines.push("Fields:");
      lines.push("");
      for (const f of e.fields) lines.push(`- \`${f}\``);
    }
    lines.push("");
  }
  return lines.join("\n");
}

async function main() {
  const schemas = await loadSchemas();
  const events = await loadEvents();

  const schemasMd = renderSchemasMarkdown(schemas);
  const eventsMd = renderEventsMarkdown(events);

  const summary: Summary = {
    generatedAt: new Date().toISOString(),
    schemaCount: schemas.length,
    eventCount: events.length,
    outputDir: OUT_DIR,
    files: [
      path.join(OUT_DIR, "schemas.md"),
      path.join(OUT_DIR, "events.md"),
      path.join(OUT_DIR, "summary.json"),
    ],
    includeShape: INCLUDE_SHAPE,
    schemas,
    events,
    notes: [
      "Shape extraction is best-effort; non-object schemas omitted.",
      "Update registry & catalog to reflect new domain models.",
    ],
  };

  if (!NO_WRITE) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(path.join(OUT_DIR, "schemas.md"), schemasMd, "utf-8");
    fs.writeFileSync(path.join(OUT_DIR, "events.md"), eventsMd, "utf-8");
    fs.writeFileSync(
      path.join(OUT_DIR, "summary.json"),
      JSON.stringify(summary, null, 2),
      "utf-8",
    );
  }

  if (JSON_ONLY) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  if (PRINT) {
    console.log("=== Schemas (Markdown) ===");
    console.log(schemasMd);
    console.log("\n=== Events (Markdown) ===");
    console.log(eventsMd);
  }

  if (!PRINT) {
    console.log(
      `Docs generated: schemas=${schemas.length} events=${events.length} -> ${OUT_DIR} (write=${
        NO_WRITE ? "no" : "yes"
      })`,
    );
  }
}

main().catch((err) => {
  console.error("generate-docs failed:", err);
  process.exit(1);
});
