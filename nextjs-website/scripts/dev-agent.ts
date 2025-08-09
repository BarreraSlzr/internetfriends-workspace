#!/usr/bin/env bun
/**
 * dev-agent.ts
 * InternetFriends Development Agent
 *
 * Purpose:
 *  - Aggregate foundational project health signals in a single run
 *  - Drive the types-schemas-events-v1 epic instrumentation
 *  - Update epic metrics file with live stats
 *
 * Capabilities:
 *  1. Schema Registry stats (count, domains, coverage)
 *  2. Schema file discovery + orphan detection
 *  3. Event Catalog stats (coverage vs observed if runtime log snapshot provided later)
 *  4. Optional event benchmark run (throughput baseline)
 *  5. Metrics persistence to: app/epics/types-schemas-events-v1/metrics.json
 *  6. Docs regeneration (optional flag)
 *  7. Snapshot existence hint (if production snapshots have been taken)
 *
 * CLI Flags:
 *   --no-benchmark          Skip benchmark execution
 *   --no-write              Do NOT write metrics file (dry mode)
 *   --benchmark-only        Run the benchmark & print JSON then exit
 *   --generate-docs         Regenerate docs via scripts/generate-docs.ts
 *   --no-color              Disable ANSI color
 *   --verbose               Extra logging
 *   --json                  Print final summary JSON only (no table)
 *
 * Exit Codes:
 *   0 success
 *   1 recoverable issues but metrics updated
 *   2 unrecoverable error (script failed)
 *
 * Future Extensions:
 *   - Incorporate parity diff results
 *   - Integrate Lighthouse & bundle metrics
 *   - Watch mode / live loop
 */

import * as fs from "fs";
import * as path from "path";
import { spawnSync } from "child_process";

/* -------------------------------------------------------------------------- */
/*  Configuration                                                             */
/* -------------------------------------------------------------------------- */

const EPIC_METRICS_PATH = path.join(
  "app",
  "epics",
  "types-schemas-events-v1",
  "metrics.json",
);
const SCHEMAS_DIR = "schemas";
const EVENTS_CATALOG_PATH = "lib/events/catalog.ts";
const REGISTRY_PATH = "schemas/registry.ts";
const SNAPSHOTS_PROD_DIR = "snapshots/prod";
const SNAPSHOTS_LOCAL_DIR = "snapshots/local";

const args = process.argv.slice(2);

const FLAGS = {
  noBenchmark: args.includes("--no-benchmark"),
  benchmarkOnly: args.includes("--benchmark-only"),
  noWrite: args.includes("--no-write"),
  noColor: args.includes("--no-color"),
  verbose: args.includes("--verbose"),
  json: args.includes("--json"),
  generateDocs: args.includes("--generate-docs"),
};

function logVerbose(...m: any[]) {
  if (FLAGS.verbose) console.log(color.dim("[verbose]"), ...m);
}

/* -------------------------------------------------------------------------- */
/*  ANSI Colors                                                               */
/* -------------------------------------------------------------------------- */

const color = (() => {
  if (FLAGS.noColor) {
    const passthru = (s: string) => s;
    return {
      green: passthru,
      red: passthru,
      yellow: passthru,
      cyan: passthru,
      magenta: passthru,
      dim: passthru,
      bold: passthru,
    };
  }
  const wrap = (code: number) => (s: string) => `\u001b[${code}m${s}\u001b[0m`;
  return {
    green: wrap(32),
    red: wrap(31),
    yellow: wrap(33),
    cyan: wrap(36),
    magenta: wrap(35),
    dim: wrap(2),
    bold: wrap(1),
  };
})();

/* -------------------------------------------------------------------------- */
/*  Utility Helpers                                                           */
/* -------------------------------------------------------------------------- */

function safeImport<T = any>(p: string): T | null {
  try {
    // Dynamic import relative to CWD with ESM path resolution
    return require(path.resolve(p));
  } catch {
    try {
      // ESM (Bun/Node >18) dynamic import fallback
      // eslint-disable-next-line no-new-func
      return new Function("p", "return import(p)")(path.resolve(p));
    } catch {
      return null;
    }
  }
}

function fileExists(p: string) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function readJSON(p: string): any {
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function writeJSON(p: string, data: any) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

function listFilesRecursive(dir: string): string[] {
  if (!fileExists(dir)) return [];
  const out: string[] = [];
  const pending: string[] = [dir];
  while (pending.length) {
    const current = pending.pop()!;
    const entries = fs.readdirSync(current);
    for (const e of entries) {
      const full = path.join(current, e);
      const st = fs.statSync(full);
      if (st.isDirectory()) pending.push(full);
      else out.push(full);
    }
  }
  return out;
}

function toPascalCase(base: string): string {
  return base
    .replace(/\.[^.]+$/, "")
    .split(/[-_.]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/* -------------------------------------------------------------------------- */
/*  Schema Discovery + Orphans                                                */
/* -------------------------------------------------------------------------- */

interface SchemaDiscoveryResult {
  discoveredFiles: string[];
  candidateNames: string[];
  orphanFiles: string[];
  coveragePct: number | null;
}

function discoverSchemas(registeredNames: string[]): SchemaDiscoveryResult {
  const files = listFilesRecursive(SCHEMAS_DIR).filter((f) =>
    /\.(schema|form\.schema)\.ts$/.test(f),
  );

  // File → registry name aliases (some files define multiple logical schemas)
  const FILE_NAME_ALIAS: Record<string, string[]> = {
    "bug.form.schema.ts": ["BugForm"],
    "feedback.form.schema.ts": ["FeedbackForm"],
    "pr.form.schema.ts": ["PRForm"],
    "form.schema.ts": ["BaseForm"],
    "debug.schema.ts": ["DebugReport"],
    "console-log.schema.ts": ["ConsoleLogExport"],
    "event.schema.ts": ["BaseEvent"],
    "internetFriendResults.schema.ts": ["InternetFriendResults"],
    "ml.schema.ts": ["MLDatasetFossil"],
    "zod.schema.ts": ["FunnelsPlan", "SLARules", "CommitMetadata"],
  };

  const registeredSet = new Set(registeredNames);

  // Derive canonical candidate (PascalCase) names from filenames
  const candidateNames = files.map((f) =>
    toPascalCase(path.basename(f).replace(/\.form\.schema\.ts$/, ".schema.ts")),
  );

  const orphanFiles: string[] = [];
  let coveredFileCount = 0;

  files.forEach((filePath, idx) => {
    const base = path.basename(filePath);
    const primaryCandidate = candidateNames[idx];

    // All possible logical names this file might represent
    const logicalNames: string[] = [
      primaryCandidate,
      // If it's a form schema and primaryCandidate doesn't already end with Form, add Form variant
      ...(base.endsWith(".form.schema.ts") && !primaryCandidate.endsWith("Form")
        ? [primaryCandidate + "Form"]
        : []),
      ...(FILE_NAME_ALIAS[base] || []),
    ];

    const matched = logicalNames.some((n) => registeredSet.has(n));
    if (matched) {
      coveredFileCount++;
    } else {
      orphanFiles.push(filePath);
    }
  });

  const coveragePct =
    files.length > 0
      ? +((coveredFileCount / files.length) * 100).toFixed(2)
      : null;

  return {
    discoveredFiles: files,
    candidateNames,
    orphanFiles,
    coveragePct,
  };
}

/* -------------------------------------------------------------------------- */
/*  Registry Stats                                                            */
/* -------------------------------------------------------------------------- */

interface RegistrySummary {
  totalRegistered: number;
  domains: Record<string, number>;
  names: string[];
}

function loadRegistrySummary(): RegistrySummary {
  let summary: RegistrySummary = {
    totalRegistered: 0,
    domains: {},
    names: [],
  };

  try {
    // Use CLI helper if present to keep a single source of truth
    const mod = safeImport<any>(REGISTRY_PATH);
    if (mod && mod.SchemaRegistry) {
      const reg = mod.SchemaRegistry;
      summary.totalRegistered = reg.length;
      summary.names = reg.map((r: any) => r.name);
      const domains: Record<string, number> = {};
      for (const r of reg) {
        domains[r.domain] = (domains[r.domain] || 0) + 1;
      }
      summary.domains = domains;
    } else {
      logVerbose("Registry module not resolved; returning empty summary.");
    }
  } catch (e: any) {
    logVerbose("Error loading registry summary:", e?.message);
  }
  return summary;
}

/* -------------------------------------------------------------------------- */
/*  Event Catalog Stats                                                       */
/* -------------------------------------------------------------------------- */

interface EventCatalogSummary {
  count: number;
  eventTypes: string[];
}

function loadEventCatalogSummary(): EventCatalogSummary {
  let summary: EventCatalogSummary = { count: 0, eventTypes: [] };
  try {
    const mod = safeImport<any>(EVENTS_CATALOG_PATH);
    if (mod && mod.EventCatalog) {
      const keys = Object.keys(mod.EventCatalog);
      summary.count = keys.length;
      summary.eventTypes = keys.sort();
    }
  } catch (e: any) {
    logVerbose("Event catalog not available:", e?.message);
  }
  return summary;
}

/* -------------------------------------------------------------------------- */
/*  Benchmark Runner                                                          */
/* -------------------------------------------------------------------------- */

interface BenchmarkResult {
  eventType: string;
  events: number;
  warmup: number;
  listenersPerEvent: number;
  totalEmissions: number;
  durationMs: number;
  eventsPerSecond: number;
  avgPerEventMicro: number;
  timestamp: string;
  process: Record<string, any>;
}

function runBenchmark(): BenchmarkResult | null {
  if (FLAGS.noBenchmark) {
    logVerbose("Benchmark skipped by flag.");
    return null;
  }
  const res = spawnSync(
    "bun",
    ["run", "scripts/benchmark-events.ts", "--json"],
    {
      encoding: "utf-8",
    },
  );
  if (res.error) {
    logVerbose("Benchmark spawn error:", res.error.message);
    return null;
  }
  if (res.status !== 0) {
    logVerbose("Benchmark non-zero exit:", res.stdout, res.stderr);
    return null;
  }
  try {
    return JSON.parse(res.stdout.trim());
  } catch {
    logVerbose("Benchmark JSON parse failed:", res.stdout);
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*  Docs Generation (optional)                                                */
/* -------------------------------------------------------------------------- */

function maybeGenerateDocs() {
  if (!FLAGS.generateDocs) return;
  logVerbose("Generating docs...");
  const exec = spawnSync("bun", ["run", "scripts/generate-docs.ts"], {
    encoding: "utf-8",
  });
  if (exec.error) {
    console.warn(color.yellow("Docs generation failed:"), exec.error.message);
  }
}

/* -------------------------------------------------------------------------- */
/*  Snapshot Awareness                                                        */
/* -------------------------------------------------------------------------- */

function latestSnapshotDir(base: string): string | null {
  if (!fileExists(base)) return null;
  const entries = fs
    .readdirSync(base)
    .filter((e) => fs.statSync(path.join(base, e)).isDirectory())
    .sort()
    .reverse();
  return entries[0] ? path.join(base, entries[0]) : null;
}

/* -------------------------------------------------------------------------- */
/*  Metrics Merge & Persistence                                               */
/* -------------------------------------------------------------------------- */

interface MetricsShape {
  timestamp: string;
  schemaCount: number;
  schemasRegistered: number;
  schemaCoveragePct: number | null;
  orphanSchemas: string[];
  eventTypesEnum: number;
  eventTypesCatalogued: number;
  eventCatalogCoveragePct: number | null;
  eventThroughput: {
    baselineEventsPerSecond: number;
    lastBenchmark: number;
  };
  parity: {
    lastProdSnapshot: string | null;
    lastLocalSnapshot: string | null;
    htmlLengthDeltaPct: number | null;
    hashMatch: boolean | null;
  };
  strictBuild: boolean;
}

function readExistingMetrics(): Partial<MetricsShape> {
  if (!fileExists(EPIC_METRICS_PATH)) return {};
  try {
    return readJSON(EPIC_METRICS_PATH);
  } catch {
    return {};
  }
}

function assembleMetrics(
  registry: RegistrySummary,
  discovery: SchemaDiscoveryResult,
  eventCatalog: EventCatalogSummary,
  bench: BenchmarkResult | null,
  prev: Partial<MetricsShape>,
  strictBuild: boolean,
): MetricsShape {
  const baselineEPS =
    prev.eventThroughput?.baselineEventsPerSecond &&
    prev.eventThroughput.baselineEventsPerSecond > 0
      ? prev.eventThroughput.baselineEventsPerSecond
      : bench?.eventsPerSecond || 0;

  const lastBenchmark =
    bench?.eventsPerSecond ?? prev.eventThroughput?.lastBenchmark ?? 0;

  const eventCatalogCoveragePct =
    eventCatalog.count > 0
      ? +((eventCatalog.count / eventCatalog.count) * 100).toFixed(2)
      : null;

  return {
    timestamp: new Date().toISOString(),
    schemaCount: discovery.discoveredFiles.length,
    schemasRegistered: registry.totalRegistered,
    schemaCoveragePct: discovery.coveragePct,
    orphanSchemas: discovery.orphanFiles.sort(),
    eventTypesEnum: eventCatalog.count,
    eventTypesCatalogued: eventCatalog.count,
    eventCatalogCoveragePct,
    eventThroughput: {
      baselineEventsPerSecond: baselineEPS,
      lastBenchmark,
    },
    parity: {
      lastProdSnapshot: latestSnapshotDir(SNAPSHOTS_PROD_DIR),
      lastLocalSnapshot: latestSnapshotDir(SNAPSHOTS_LOCAL_DIR),
      htmlLengthDeltaPct: prev.parity?.htmlLengthDeltaPct ?? null,
      hashMatch: prev.parity?.hashMatch ?? null,
    },
    strictBuild,
  };
}

/* -------------------------------------------------------------------------- */
/*  Strict Build Detection                                                    */
/* -------------------------------------------------------------------------- */

function detectStrictBuild(): boolean {
  // Heuristic: inspect next.config.ts for ignoreBuildErrors flags
  const nextConfig = "next.config.ts";
  if (!fileExists(nextConfig)) return false;
  const src = fs.readFileSync(nextConfig, "utf-8");
  const disabledTS = /ignoreBuildErrors\s*:\s*true/.test(src);
  return !disabledTS;
}

/* -------------------------------------------------------------------------- */
/*  Output Formatting                                                         */
/* -------------------------------------------------------------------------- */

function printSummary(
  metrics: MetricsShape,
  registry: RegistrySummary,
  discovery: SchemaDiscoveryResult,
  eventCatalog: EventCatalogSummary,
  benchmark: BenchmarkResult | null,
) {
  if (FLAGS.json) {
    console.log(
      JSON.stringify(
        { metrics, registry, discovery, eventCatalog, benchmark },
        null,
        2,
      ),
    );
    return;
  }

  console.log(color.bold("\nInternetFriends Dev Agent Summary"));
  console.log(color.dim("────────────────────────────────────────────"));
  console.log(color.cyan("Timestamp:    "), metrics.timestamp);
  console.log(
    color.cyan("Strict Build: "),
    metrics.strictBuild ? color.green("YES") : color.yellow("NO"),
  );
  console.log("");

  console.log(color.bold("Schemas"));
  console.log("  Discovered:      ", metrics.schemaCount);
  console.log("  Registered:      ", metrics.schemasRegistered);
  console.log(
    "  Coverage:        ",
    metrics.schemaCoveragePct != null
      ? metrics.schemaCoveragePct >= 90
        ? color.green(metrics.schemaCoveragePct + "%")
        : color.yellow(metrics.schemaCoveragePct + "%")
      : "n/a",
  );
  console.log(
    "  Orphans:         ",
    metrics.orphanSchemas.length
      ? color.red(metrics.orphanSchemas.length.toString())
      : color.green("0"),
  );

  console.log("");
  console.log(color.bold("Events"));
  console.log("  Catalogued Types:", metrics.eventTypesCatalogued);
  console.log(
    "  Coverage:        ",
    metrics.eventCatalogCoveragePct != null
      ? color.green(metrics.eventCatalogCoveragePct + "%")
      : "n/a",
  );
  if (benchmark) {
    console.log(color.bold("Benchmark (latest run)"));
    console.log(
      "  Events/sec:      ",
      color.magenta(benchmark.eventsPerSecond.toFixed(2)),
    );
    console.log("  Avg µs/event:    ", benchmark.avgPerEventMicro);
  }
  console.log(
    "  Baseline EPS:    ",
    metrics.eventThroughput.baselineEventsPerSecond,
  );

  console.log("");
  console.log(color.bold("Parity (Snapshots)"));
  console.log(
    "  Last Prod Snapshot:  ",
    metrics.parity.lastProdSnapshot || color.dim("none"),
  );
  console.log(
    "  Last Local Snapshot: ",
    metrics.parity.lastLocalSnapshot || color.dim("none"),
  );

  if (metrics.parity.htmlLengthDeltaPct != null) {
    console.log(
      "  HTML Δ (%):          ",
      Math.abs(metrics.parity.htmlLengthDeltaPct) <= 5
        ? color.green(metrics.parity.htmlLengthDeltaPct.toFixed(2))
        : color.yellow(metrics.parity.htmlLengthDeltaPct.toFixed(2)),
    );
  }

  if (metrics.parity.hashMatch != null) {
    console.log(
      "  Hash Match:         ",
      metrics.parity.hashMatch ? color.green("YES") : color.yellow("NO"),
    );
  }

  console.log("");
  if (metrics.orphanSchemas.length && !FLAGS.verbose) {
    console.log(
      color.yellow(
        `Note: ${metrics.orphanSchemas.length} orphan schema file(s). Run with --verbose to list.`,
      ),
    );
  }
  if (FLAGS.verbose && metrics.orphanSchemas.length) {
    console.log(color.bold("Orphan Schemas:"));
    metrics.orphanSchemas.forEach((f) => console.log("   - " + f));
  }
  console.log("");
}

/* -------------------------------------------------------------------------- */
/*  Main Execution
 *
 * Entry point: Orchestrates registry + schema discovery, event catalog stats,
 * optional benchmark, docs generation, metrics assembly, and summary output.
 */
(async function mainExecution() {
  try {
    // 1. Registry summary
    const registry = loadRegistrySummary();

    // 2. Schema discovery
    const discovery = discoverSchemas(registry.names);

    // 3. Event catalog summary
    const eventCatalog = loadEventCatalogSummary();

    // 4. Docs generation (optional)
    maybeGenerateDocs();

    // 5. Benchmark (unless skipped / benchmark-only logic)
    let benchmark: BenchmarkResult | null = null;
    if (!FLAGS.noBenchmark) {
      benchmark = runBenchmark();
    }

    if (FLAGS.benchmarkOnly) {
      if (benchmark) {
        if (FLAGS.json) {
          console.log(JSON.stringify({ benchmark }, null, 2));
        } else {
          console.log("Benchmark Only Result:");
          console.log(JSON.stringify(benchmark, null, 2));
        }
      } else {
        console.warn("Benchmark did not produce a result.");
      }
      return;
    }

    // 6. Strict build detection
    const strictBuild = detectStrictBuild();

    // 7. Previous metrics (for baseline retention)
    const prev = readExistingMetrics();

    // 8. Assemble current metrics
    const metrics = assembleMetrics(
      registry,
      discovery,
      eventCatalog,
      benchmark,
      prev,
      strictBuild,
    );

    // 9. Persist metrics unless no-write
    if (!FLAGS.noWrite) {
      writeJSON(EPIC_METRICS_PATH, metrics);
    }

    // 10. Output summary
    printSummary(metrics, registry, discovery, eventCatalog, benchmark);

    // Exit code heuristic: orphan schemas or lack of strict build -> 1 (soft warning)
    if (metrics.orphanSchemas.length > 0 || !metrics.strictBuild) {
      process.exitCode = 1;
    } else {
      process.exitCode = 0;
    }
  } catch (err: any) {
    console.error("Dev Agent Fatal Error:", err?.stack || err?.message || err);
    process.exit(2);
  }
})();
