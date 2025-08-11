#!/usr/bin/env bun
/**
 * validate-fixtures.ts
 * InternetFriends Fixture Validation Script
 *
 * Purpose:
 *  - Load JSON fixtures from /schemas/fixtures
 *  - Transform placeholder ISO date markers into actual Date objects
 *  - Run Zod validation against registered schemas (schemas/registry.ts)
 *  - Produce a machine-readable summary (optionally pretty / table)
 *
 * Date Placeholder Conventions:
 *   "__ISO_DATE__<iso-timestamp>"  => new Date(<iso-timestamp>)
 *   "__NOW__"                      => new Date() at runtime
 *
 * Example Fixture:
 * {
 *   "createdAt": "__ISO_DATE__2025-01-15T12:00:00.000Z",
 *   "updatedAt": "__NOW__"
 * }
 *
 * CLI Flags:
 *   --schema=Name             Validate only a single schema's fixture
 *   --pattern=Regex           Only fixtures with names matching regex
 *   --fail-fast               Stop after first failure (exit code 2)
 *   --json                    Output JSON summary only
 *   --list                    List discovered fixture files (no validation)
 *   --dir=relative/path       Override fixtures directory (default: schemas/fixtures)
 *   --allow-missing           Do not count missing fixtures as failures
 *   --show-success            List successful schemas in human summary
 *   --no-color                Disable ANSI colors
 *
 * Exit Codes:
 *   0 - All validated (or no fixtures found with --allow-missing)
 *   1 - One or more validation failures
 *   2 - Fail-fast triggered on first error
 *
 * Usage:
 *   bun run scripts/validate-fixtures.ts
 *   bun run scripts/validate-fixtures.ts --json
 *   bun run scripts/validate-fixtures.ts --schema=UserAuth
 *   bun run scripts/validate-fixtures.ts --pattern=Form --show-success
 */

import * as fs from "fs";
import * as path from "path";
import { SchemaRegistry } from "../schemas/registry";

// ----------------------------- CLI / Flags ----------------------------------

interface Flags {
  schema?: string;
  pattern?: RegExp;
  failFast: boolean;
  json: boolean;
  list: boolean;
  dir: string;
  allowMissing: boolean;
  showSuccess: boolean;
  noColor: boolean;
}

function parseFlags(): Flags {
  const argv = process.argv.slice(2);
  const getVal = (k: string) =>
    (argv.find((a) => a.startsWith(`--${k}=`)) || "")
      .split("=")
      .slice(1)
      .join("=") || undefined;

  return {
    schema: getVal("schema"),
    pattern: (() => {
      const p = getVal("pattern");
      if (!p) return undefined;
      try {
        return new RegExp(p);
      } catch {
        console.warn(`Invalid regex for --pattern=${p}, ignoring.`);
        return undefined;
      }
    })(),
    failFast: argv.includes("--fail-fast"),
    json: argv.includes("--json"),
    list: argv.includes("--list"),
    dir: getVal("dir") || "schemas/fixtures",
    allowMissing: argv.includes("--allow-missing"),
    showSuccess: argv.includes("--show-success"),
    noColor: argv.includes("--no-color"),
  };
}

const FLAGS = parseFlags();

// ----------------------------- Color Helpers --------------------------------

const color = (() => {
  if (FLAGS.noColor) {
    const same = (s: string) => s;
    return {
      red: same,
      green: same,
      yellow: same,
      cyan: same,
      dim: same,
      bold: same,
    };
  }
  const wrap = (c: number) => (s: string) => `\u001b[${c}m${s}\u001b[0m`;
  return {
    red: wrap(31),
    green: wrap(32),
    yellow: wrap(33),
    cyan: wrap(36),
    dim: wrap(2),
    bold: wrap(1),
  };
})();

// ----------------------------- Date Transform -------------------------------

/**
 * Recursively traverse fixture object and convert placeholders:
 *   "__ISO_DATE__<iso>" -> Date(iso)
 *   "__NOW__"           -> Date()
 */
function transformDates(value: unknown): unknown {
  if (typeof value === "string") {
    if (value.startsWith("__ISO_DATE__")) {
      const iso = value.replace("__ISO_DATE__", "");
      const d = new Date(iso);
      if (isNaN(d.getTime())) {
        throw new Error(`Invalid ISO date in placeholder: ${value}`);
      }
      return d;
    }
    if (value === "__NOW__") {
      return new Date();
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(transformDates);
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = transformDates(v);
    }
    return out;
  }
  return value;
}

// ----------------------------- Fixture Loading ------------------------------

interface ValidationFailure {
  name: string;
  error: string;
  issues?: unknown;
  file?: string;
}

interface ValidationResult {
  totalSchemas: number;
  totalFixturesFound: number;
  validated: number;
  missing: string[];
  failures: ValidationFailure[];
  success: string[];
  durationMs: number;
  fixtureDir: string;
  timestamp: string;
}

function loadFixtureFile(filePath: string): unknown {
  const raw = fs.readFileSync(filePath, "utf-8");
  // Remove potential /* comments */ or // comments (allow trailing doc hints)
  const sanitized = raw
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^[ \t]*\/\/.*$/gm, "");
  let parsed: unknown;
  try {
    parsed = JSON.parse(sanitized);
  } catch (e: unknown) {
    throw new Error(
      `JSON parse error: ${e instanceof Error ? e.message : String(e)}`,
    );
  }
  return transformDates(parsed);
}

// ----------------------------- Main Validation ------------------------------

function validateFixtures(): ValidationResult {
  const start = Date.now();
  const failures: ValidationFailure[] = [];
  const success: string[] = [];
  const missing: string[] = [];
  const fixtureDir = FLAGS.dir;

  if (!fs.existsSync(fixtureDir)) {
    if (FLAGS.list || FLAGS.json) {
      // proceed with empty
    } else {
      console.warn(color.yellow(`Fixture directory not found: ${fixtureDir}`));
    }
  }

  const registryFiltered = SchemaRegistry.filter((entry) => {
    if (FLAGS.schema && entry.name !== FLAGS.schema) return false;
    if (FLAGS.pattern && !FLAGS.pattern.test(entry.name)) return false;
    return true;
  });

  if (FLAGS.list) {
    const files = fs.existsSync(fixtureDir)
      ? fs.readdirSync(fixtureDir).filter((f) => f.endsWith(".json"))
      : [];
    if (FLAGS.json) {
      console.log(
        JSON.stringify(
          {
            fixtureDir,
            files,
            count: files.length,
          },
          null,
          2,
        ),
      );
    } else {
      console.log(
        color.bold(`Fixture files in ${fixtureDir} (${files.length}):`),
      );
      files.forEach((f) => console.log(" - " + f));
    }
    process.exit(0);
  }

  let fixturesFound = 0;

  for (const entry of registryFiltered) {
    const file = path.join(fixtureDir, `${entry.name}.json`);
    if (!fs.existsSync(file)) {
      missing.push(entry.name);
      continue;
    }

    fixturesFound++;
    let data: unknown;
    try {
      data = loadFixtureFile(file);
    } catch (e: unknown) {
      failures.push({
        name: entry.name,
        error: e instanceof Error ? e.message : "Fixture load error",
        file,
      });
      if (FLAGS.failFast) {
        return {
          totalSchemas: registryFiltered.length,
          totalFixturesFound: fixturesFound,
          validated: success.length,
          missing,
          failures,
          success,
          durationMs: Date.now() - start,
          fixtureDir,
          timestamp: new Date().toISOString(),
        };
      }
      continue;
    }

    const result = entry.schema.safeParse(data);
    if (!result.success) {
      failures.push({
        name: entry.name,
        error: "Schema validation failed",
        issues: result.error.issues,
        file,
      });
      if (FLAGS.failFast) {
        return {
          totalSchemas: registryFiltered.length,
          totalFixturesFound: fixturesFound,
          validated: success.length,
          missing,
          failures,
          success,
          durationMs: Date.now() - start,
          fixtureDir,
          timestamp: new Date().toISOString(),
        };
      }
    } else {
      success.push(entry.name);
    }
  }

  return {
    totalSchemas: registryFiltered.length,
    totalFixturesFound: fixturesFound,
    validated: success.length,
    missing,
    failures,
    success,
    durationMs: Date.now() - start,
    fixtureDir,
    timestamp: new Date().toISOString(),
  };
}

// ----------------------------- Execution ------------------------------------

const summary = validateFixtures();

// If missing fixtures should count as failures and not allowed
const missingFailure =
  summary.missing.length > 0 && !FLAGS.allowMissing
    ? summary.missing.map((m) => ({
        name: m,
        error: "Missing fixture",
        file: null,
      }))
    : [];

const totalFailures = summary.failures.length + missingFailure.length;
const exitCode = totalFailures > 0 ? (FLAGS.failFast ? 2 : 1) : 0;

if (FLAGS.json) {
  console.log(
    JSON.stringify(
      {
        ...summary,
        missingCount: summary.missing.length,
        failures: [...summary.failures, ...missingFailure],
        totalFailures,
        exitCode,
      },
      null,
      2,
    ),
  );
  process.exit(exitCode);
}

// Human-readable output
console.log(color.bold("\nFixture Validation Summary"));
console.log(color.dim("────────────────────────────"));
console.log("Timestamp:        ", summary.timestamp);
console.log("Fixture Dir:      ", summary.fixtureDir);
console.log("Schemas Scanned:  ", summary.totalSchemas);
console.log("Fixtures Found:   ", summary.totalFixturesFound);
console.log("Validated:        ", summary.validated);
console.log(
  "Missing Fixtures: ",
  summary.missing.length
    ? color.yellow(summary.missing.length.toString())
    : color.green("0"),
);
console.log(
  "Failures:         ",
  summary.failures.length
    ? color.red(summary.failures.length.toString())
    : color.green("0"),
);
console.log("Duration (ms):    ", summary.durationMs);

if (summary.missing.length && !FLAGS.allowMissing) {
  console.log(color.bold("\nMissing (require fixtures):"));
  summary.missing.forEach((m) => console.log("  - " + m));
} else if (summary.missing.length && FLAGS.allowMissing) {
  console.log(color.dim("\nMissing (ignored via --allow-missing):"));
  summary.missing.forEach((m) => console.log("  - " + m));
}

if (summary.failures.length) {
  console.log(color.bold("\nValidation Failures:"));
  summary.failures.forEach((f) => {
    console.log(
      `  • ${color.red(f.name)} ${f.file ? "(" + f.file + ")" : ""} :: ${f.error}`,
    );
    if (f.issues) {
      const first = Array.isArray(f.issues) ? f.issues.slice(0, 3) : [];
      first.forEach((i) =>
        console.log(
          color.dim(
            `     - path=${JSON.stringify(i.path)} code=${i.code} msg=${i.message}`,
          ),
        ),
      );
      if (Array.isArray(f.issues) && f.issues.length > 3) {
        console.log(color.dim(`     (+${f.issues.length - 3} more issues)`));
      }
    }
  });
}

if (FLAGS.showSuccess && summary.success.length) {
  console.log(color.bold("\nSuccessful Schemas:"));
  summary.success.forEach((s) => console.log("  - " + color.green(s)));
}

console.log(""); // spacing
if (exitCode === 0) {
  console.log(color.green("✅ All fixtures validated successfully."));
} else {
  console.log(
    color.red(
      `❌ Fixture validation completed with ${totalFailures} failure(s). Exit code ${exitCode}.`,
    ),
  );
}

process.exit(exitCode);
