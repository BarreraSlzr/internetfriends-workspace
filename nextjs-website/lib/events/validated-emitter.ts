/**
 * validated-emitter.ts
 * InternetFriends Validated Event Emission Layer
 *
 * Bridges the canonical EventCatalog with the lower-level event.system emitter.
 * Provides:
 *  - Schema validation (Zod) before emission for catalogued events
 *  - Soft handling (warn) for non-catalogued / legacy event types (Phase A)
 *  - Per-event-type emission counters & lightweight perf metrics
 *  - Optional strict mode toggle (future Phase D)
 *
 * Phased Adoption (types-schemas-events-v1 epic):
 *  Phase A: Log + count unknown events (non-blocking)
 *  Phase B: CI agent fails if unknown events > threshold
 *  Phase C: Strict mode rejects unknown emits unless whitelisted
 *  Phase D: Versioned / deprecated event warnings
 */

import { performance } from "perf_hooks";
import { z } from "zod";
import {
  EventCatalog,
  getEventSchema,
  listEventTypes,
  EventType,
} from "./catalog";
// NOTE: This file assumes the existence of event.system.ts exporting emit/on abstractions.
import {
  emit as baseEmit,
  on as baseOn,
  EventType as LegacyEventType, // legacy enum/type (may be broader)
} from "./event.system";

/* -------------------------------------------------------------------------- */
/*  Configuration Flags (adjust via env or future config service)             */
/* -------------------------------------------------------------------------- */

/**
 * When true, unknown events (not in EventCatalog) will throw instead of warn.
 * Keep false in Phase A; set true only after coverage reaches 100%.
 */
const STRICT_MODE = process.env.IF_EVENTS_STRICT === "true";

/**
 * Allowlist of event types permitted to bypass catalog validation
 * during transition. Populate intentionally; keep list minimal.
 */
const LEGACY_ALLOW_UNCATALOGUED: string[] = [];

/* -------------------------------------------------------------------------- */
/*  Metrics State (in-memory)                                                 */
/*  NOTE: Reset on process restart. Intended for short-lived snapshotting.    */
/* -------------------------------------------------------------------------- */

interface EmissionMetric {
  type: string;
  count: number;
  firstEmitted: number;
  lastEmitted: number;
  avgValidationMs: number;
  totalValidationMs: number;
  failures: number;
  lastError?: string;
}

const emissionMetrics: Record<string, EmissionMetric> = {};
let unknownEmissionCount = 0;

/* -------------------------------------------------------------------------- */
/*  Validation Wrapper                                                         */
/* -------------------------------------------------------------------------- */

function recordMetric(
  type: string,
  validationMs: number,
  success: boolean,
  error?: string,
) {
  const now = Date.now();
  if (!emissionMetrics[type]) {
    emissionMetrics[type] = {
      type,
      count: 0,
      firstEmitted: now,
      lastEmitted: now,
      avgValidationMs: 0,
      totalValidationMs: 0,
      failures: 0,
    };
  }
  const m = emissionMetrics[type];
  m.count += success ? 1 : 0;
  m.lastEmitted = now;
  if (success) {
    m.totalValidationMs += validationMs;
    m.avgValidationMs = m.totalValidationMs / m.count;
  } else {
    m.failures += 1;
    m.lastError = error;
  }
}

/**
 * Validate & emit a catalogued (or legacy) event.
 * - For catalogued types: payload must conform to schema.
 * - For uncatalogued types:
 *    * STRICT_MODE => throw
 *    * else => warn and pass through (Phase A compatibility).
 *
 * Returns the raw result of baseEmit for parity with underlying system.
 */
export function emitValidated<T extends string>(
  type: T,
  payload: unknown,
  options?: {
    /**
     * When true, bypass validation even if schema exists (use sparingly
     * for controlled performance experiments).
     */
    skipValidation?: boolean;
    /**
     * Override timestamp injection (if underlying system expects timestamp
     * inside payload and not already present).
     */
    injectTimestamp?: boolean;
  },
) {
  const start = performance.now();
  const schema = getEventSchema(type);

  if (schema && !options?.skipValidation) {
    // Ensure provided payload contains correct literal type (or apply injection).
    let candidate = payload as any;
    if (candidate?.type !== type) {
      candidate = { ...(candidate || {}), type };
    }
    if (options?.injectTimestamp && !candidate.timestamp) {
      candidate.timestamp = new Date().toISOString();
    }
    const parsed = schema.safeParse(candidate);
    const elapsed = performance.now() - start;
    if (!parsed.success) {
      recordMetric(type, elapsed, false, parsed.error.message);
      console.warn(
        `[events] Validation failed for '${type}': ${parsed.error.issues
          .map((i) => i.path.join(".") + " " + i.message)
          .join("; ")}`,
      );
      // We choose to not emit invalid payloads:
      return {
        ok: false,
        error: "validation_failed",
        issues: parsed.error.issues,
      };
    }
    recordMetric(type, elapsed, true);
    return baseEmit(type, parsed.data);
  }

  // Uncatalogued event path
  if (!schema) {
    unknownEmissionCount++;
    const allowed = LEGACY_ALLOW_UNCATALOGUED.includes(type);
    if (STRICT_MODE && !allowed) {
      const elapsed = performance.now() - start;
      recordMetric(type, elapsed, false, "Unknown event in strict mode");
      throw new Error(
        `[events] Unknown event type '${type}' emitted under STRICT_MODE`,
      );
    }
    const elapsed = performance.now() - start;
    recordMetric(type, elapsed, true);
    console.warn(
      `[events] (legacy) Emitting uncatalogued event '${type}'` +
        (allowed ? " [allowlisted]" : ""),
    );
    return baseEmit(type, payload);
  }

  // Fallback (should not be reachable)
  return baseEmit(type, payload);
}

/* -------------------------------------------------------------------------- */
/*  Listener Attachment (validation optional on receive)                      */
/* -------------------------------------------------------------------------- */

type EventListener<T> = (payload: T) => void;

/**
 * Subscribe to a catalogued event with automatic schema validation
 * before invoking the listener. Invalid payloads are dropped with warning.
 */
export function onValidated<K extends EventType>(
  type: K,
  listener: EventListener<z.infer<(typeof EventCatalog)[K]>>,
) {
  const schema = getEventSchema(type);
  if (!schema) {
    console.warn(
      `[events] onValidated called for unknown type '${type}'. Listener attached without validation.`,
    );
    return baseOn(type as LegacyEventType, listener as any);
  }
  return baseOn(type as LegacyEventType, (payload: unknown) => {
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      console.warn(
        `[events] Dropping invalid incoming event '${type}': ${parsed.error.message}`,
      );
      return;
    }
    listener(parsed.data);
  });
}

/**
 * Direct pass-through subscription (no validation). Provided for parity with legacy code.
 */
export function onRaw(type: string, listener: (payload: any) => void) {
  return baseOn(type as LegacyEventType, listener);
}

/* -------------------------------------------------------------------------- */
/*  Metrics & Introspection                                                    */
/* -------------------------------------------------------------------------- */

export interface EmissionMetricsSnapshot {
  timestamp: string;
  cataloguedTypes: string[];
  unknownEmissionCount: number;
  strictMode: boolean;
  metrics: EmissionMetric[];
}

/**
 * Get snapshot of emission metrics; safe for JSON serialization.
 */
export function getEmissionMetrics(): EmissionMetricsSnapshot {
  return {
    timestamp: new Date().toISOString(),
    cataloguedTypes: listEventTypes(),
    unknownEmissionCount,
    strictMode: STRICT_MODE,
    metrics: Object.values(emissionMetrics).sort((a, b) =>
      a.type.localeCompare(b.type),
    ),
  };
}

/**
 * Print concise summary (intended for dev-agent usage).
 */
export function printEmissionSummary() {
  const snap = getEmissionMetrics();
  const lines = [
    `Event Emission Summary @ ${snap.timestamp}`,
    `  Catalogued Types: ${snap.cataloguedTypes.length}`,
    `  Unknown Emissions: ${snap.unknownEmissionCount}`,
    `  Strict Mode: ${snap.strictMode ? "ON" : "off"}`,
    `  Metrics:`,
  ];
  for (const m of snap.metrics) {
    lines.push(
      `   - ${m.type}: count=${m.count}, avgValMs=${m.avgValidationMs.toFixed(
        3,
      )}, failures=${m.failures}`,
    );
  }
  console.log(lines.join("\n"));
}

/* -------------------------------------------------------------------------- */
/*  CLI Entrypoint (Optional)                                                  */
/*  Usage: bun -e "import { printEmissionSummary } from './lib/events/validated-emitter'; printEmissionSummary()" */
/* -------------------------------------------------------------------------- */

if (process.argv.includes("--summary")) {
  printEmissionSummary();
}

/* -------------------------------------------------------------------------- */
/*  Future Enhancements                                                       */
/* -------------------------------------------------------------------------- */
/* - Hook into a metrics exporter (Prometheus / OTEL)
+ * - Add structured logging (JSON lines) for downstream ingestion
+ * - Introduce queue / backpressure instrumentation
+ * - Add event replay validator using catalog schemas
+ * - Support "deprecated" flag in EventCatalog with warning count
+ */
