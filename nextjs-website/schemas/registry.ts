/**
 * InternetFriends Schema Registry
 * Central index of Zod schemas w/ domain tagging, fixture validation, and metrics helpers.
 *
 * Conventions:
 *  - Every schema registered here should have:
 *      name:       Unique PascalCase identifier
 *      domain:     auth | compute | design-system | events | forms | ui | analytics | misc (extend as needed)
 *      version:    Optional semantic version or incremental number (for future migrations)
 *      description:Short human description (keep it concise)
 *
 *  - New schema files SHOULD live in:
 *        /schemas/*.schema.ts            (pure domain / cross-cutting schemas)
 *        /schemas/*.form.schema.ts       (form-related)
 *        /lib/**                         (if tightly coupled to subsystems; still imported here)
 *
 *  - All *.schema.ts & *.form.schema.ts files should EITHER:
 *        (a) be registered here
 *        (b) be intentionally ignored (future ignore list if noise emerges)
 *
 *  - Fixtures:
 *        Place sample payloads in /schemas/fixtures/<Name>.json
 *        The registry can validate them via validateFixtures().
 *
 *  - CLI usage:
 *        bun -e "import { listSchemas } from './schemas/registry'; console.log(listSchemas())"
 *        bun -e "import { printSummary } from './schemas/registry'; printSummary()"
 *
 *  - The dev-agent will import getRegistryStats() to compute coverage metrics.
 */

import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*  Imports of Existing Schemas (seed set)                                    */
/*  Add additional import lines as more schemas are formalized.              */
/* -------------------------------------------------------------------------- */

import { UserAuthSchema } from "../lib/auth/session-integration";
import { AIModelSchema } from "../lib/compute/models";
import { GestureConfigSchema } from "../lib/design-system/gestures";

/* Newly registered existing schemas (types-schemas-events-v1 epic expansion) */
import { BugFormSchema } from "./bug.form.schema";
import { FeedbackFormSchema } from "./feedback.form.schema";
import { PRFormSchema } from "./pr.form.schema";
import { BaseFormSchema } from "./form.schema";
import { DebugV2ReportSchema } from "./debug.schema";
import { ConsoleLogExportSchema } from "./console-log.schema";
import { BaseEventSchema } from "./event.schema";
import { InternetFriendResultsSchema } from "./internetFriendResults.schema";
import { MLDatasetFossilSchema } from "./ml.schema";
import {
  FunnelsPlanSchema,
  SLARulesSchema,
  CommitMetadataSchema,
} from "./zod.schema";

// NOTE: The project contains additional raw schemas under /schemas/*.ts (e.g. form, fossil, ml).
// They will be incrementally registered here as part of the types-schemas-events-v1 epic.

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface SchemaEntry {
  name: string;
  schema: z.ZodTypeAny;
  domain: string;
  version?: string;
  description?: string;
  tags?: string[];
}

export interface RegistryStats {
  totalRegistered: number;
  domains: Record<string, number>;
  names: string[];
  // Extended metrics (populated externally by agent orchestrator)
  discoveredFileCount?: number; // total found schema-like files
  coveragePct?: number; // totalRegistered / discoveredFileCount
  orphanFiles?: string[]; // unregistered schema file paths
}

/* -------------------------------------------------------------------------- */
/*  Registry Declaration (Seed Entries)                                       */
/* -------------------------------------------------------------------------- */

export const SchemaRegistry: SchemaEntry[] = [
  {
    name: "UserAuth",
    schema: UserAuthSchema,
    domain: "auth",
    description: "User authentication identity baseline (session integration)",
    tags: ["core", "user"],
  },
  {
    name: "AIModel",
    schema: AIModelSchema,
    domain: "compute",
    description: "AI model configuration and metadata",
    tags: ["core", "compute", "ai"],
  },
  {
    name: "GestureConfig",
    schema: GestureConfigSchema,
    domain: "design-system",
    description: "Client gesture interaction tuning parameters",
    tags: ["ui", "interaction"],
  },

  /* --------------------------- Newly Added Schemas --------------------------- */
  {
    name: "BaseForm",
    schema: BaseFormSchema,
    domain: "forms",
    description: "Base form envelope shared by specialized form schemas",
    tags: ["form", "base"],
  },
  {
    name: "BugForm",
    schema: BugFormSchema,
    domain: "forms",
    description: "Bug report submission form",
    tags: ["form", "bug", "issue"],
  },
  {
    name: "FeedbackForm",
    schema: FeedbackFormSchema,
    domain: "forms",
    description: "General feedback / feature / sponsor intake form",
    tags: ["form", "feedback"],
  },
  {
    name: "PRForm",
    schema: PRFormSchema,
    domain: "forms",
    description: "Pull request review / metadata submission form",
    tags: ["form", "pr", "code-review"],
  },
  {
    name: "DebugReport",
    schema: DebugV2ReportSchema,
    domain: "observability",
    description: "Structured debug / diagnostics report aggregate",
    tags: ["debug", "report", "observability"],
  },
  {
    name: "ConsoleLogExport",
    schema: ConsoleLogExportSchema,
    domain: "observability",
    description: "Serialized console log export bundle",
    tags: ["log", "console", "export"],
  },
  {
    name: "BaseEvent",
    schema: BaseEventSchema,
    domain: "events",
    description: "Generic base event envelope (pre-catalog canonicalization)",
    tags: ["events", "envelope"],
  },
  {
    name: "InternetFriendResults",
    schema: InternetFriendResultsSchema,
    domain: "analytics",
    description:
      "Structured matrix / vector / hybrid diagnostic result formats",
    tags: ["analytics", "results", "diagnostics"],
  },
  {
    name: "MLDatasetFossil",
    schema: MLDatasetFossilSchema,
    domain: "ml",
    description: "Machine learning dataset fossil metadata & payload snapshot",
    tags: ["ml", "dataset", "fossil"],
  },
  {
    name: "FunnelsPlan",
    schema: FunnelsPlanSchema,
    domain: "operations",
    description: "Marketing / product funnels plan configuration schema",
    tags: ["funnels", "plan", "ops"],
  },
  {
    name: "SLARules",
    schema: SLARulesSchema,
    domain: "operations",
    description: "Service Level Agreement rule definitions",
    tags: ["sla", "rules", "ops"],
  },
  {
    name: "CommitMetadata",
    schema: CommitMetadataSchema,
    domain: "operations",
    description:
      "Structured commit metadata enrichment (automation / analysis)",
    tags: ["commit", "metadata", "automation"],
  },
];

/* -------------------------------------------------------------------------- */
/*  Registry Helpers                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Return all schema names.
 */
export function listSchemas(): string[] {
  return SchemaRegistry.map((s) => s.name);
}

/**
 * Find schema by name.
 */
export function getSchema(name: string): SchemaEntry | undefined {
  return SchemaRegistry.find((s) => s.name === name);
}

/**
 * General statistics (does NOT discover files on disk itself).
 * External tooling supplies discovered counts for coverage calculations.
 */
export function getRegistryStats(partial?: {
  discoveredFileCount?: number;
  orphanFiles?: string[];
}): RegistryStats {
  const domains: Record<string, number> = {};
  for (const entry of SchemaRegistry) {
    domains[entry.domain] = (domains[entry.domain] || 0) + 1;
  }

  let coveragePct: number | undefined;
  if (partial?.discoveredFileCount && partial.discoveredFileCount > 0) {
    coveragePct = +(
      (SchemaRegistry.length / partial.discoveredFileCount) *
      100
    ).toFixed(2);
  }

  return {
    totalRegistered: SchemaRegistry.length,
    domains,
    names: listSchemas(),
    discoveredFileCount: partial?.discoveredFileCount,
    coveragePct,
    orphanFiles: partial?.orphanFiles,
  };
}

/* -------------------------------------------------------------------------- */
/*  Fixture Validation (Optional Use)                                         */
/* -------------------------------------------------------------------------- */

import * as fs from "fs";
import * as path from "path";

/**
 * Validate all available fixtures in /schemas/fixtures.
 * Fixture filename MUST match SchemaEntry.name (e.g., UserAuth.json).
 *
 * Returns an object summarizing success/failures.
 */
export function validateFixtures(
  fixturesDir = path.join(process.cwd(), "schemas", "fixtures"),
): {
  totalFixtures: number;
  validated: number;
  failures: { name: string; error: string }[];
} {
  const failures: { name: string; error: string }[] = [];
  let validated = 0;
  let total = 0;

  if (!fs.existsSync(fixturesDir)) {
    return { totalFixtures: 0, validated: 0, failures };
  }

  for (const entry of SchemaRegistry) {
    const fPath = path.join(fixturesDir, `${entry.name}.json`);
    if (fs.existsSync(fPath)) {
      total++;
      try {
        const raw = JSON.parse(fs.readFileSync(fPath, "utf-8"));
        entry.schema.parse(raw);
        validated++;
      } catch (e: any) {
        failures.push({
          name: entry.name,
          error: e?.message || "Unknown parse error",
        });
      }
    }
  }

  return { totalFixtures: total, validated, failures };
}

/* -------------------------------------------------------------------------- */
/*  Documentation Generation Helpers (in-memory)                              */
/*  The actual docs script can import these to serialize metadata.            */
/* -------------------------------------------------------------------------- */

/**
 * Produce a lightweight doc model for every registered schema.
 * (Avoids leaking internals of Zod definition; introspection kept minimal.)
 */
export function getSchemaDocModel() {
  return SchemaRegistry.map((entry) => ({
    name: entry.name,
    domain: entry.domain,
    version: entry.version || "unversioned",
    description: entry.description || "",
    tags: entry.tags || [],
  }));
}

/* -------------------------------------------------------------------------- */
/*  CLI Utilities (invoked via bun -e)                                        */
/* -------------------------------------------------------------------------- */

export function printSummary() {
  const stats = getRegistryStats();
  // Minimal JSON output for automation parsing.
  console.log(
    JSON.stringify(
      {
        totalRegistered: stats.totalRegistered,
        domains: stats.domains,
        names: stats.names,
      },
      null,
      2,
    ),
  );
}

if (process.argv.includes("--summary")) {
  printSummary();
}

if (process.argv.includes("--fixtures")) {
  const result = validateFixtures();
  console.log(JSON.stringify(result, null, 2));
}

/* -------------------------------------------------------------------------- */
/*  Extension Guidelines                                                       */
/* -------------------------------------------------------------------------- *
 * 1. When adding a new schema:
 *      - Create the schema file (prefer *.schema.ts suffix).
 *      - Add import above.
 *      - Add entry to SchemaRegistry.
 *      - (Optional) Create fixtures/Name.json and run with --fixtures flag.
 * 2. Keep domains consistent; introduce new domains only if conceptually broad.
 * 3. For versioning, add `version: "1.0.0"`; future migrations can maintain multiple entries.
 * 4. Resist the urge to auto-glob import early; explicit registration = intentional design.
 * 5. If the registry grows large, consider splitting per-domain arrays & merging.
 */

/* -------------------------------------------------------------------------- */
/*  Export Default (if convenient)                                            */
/* -------------------------------------------------------------------------- */

export default SchemaRegistry;
