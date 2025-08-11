/**
 * InternetFriends Event Catalog
 * Canonical mapping: event type string -> Zod schema
 *
 * Purpose:
 *  - Central source of truth for all emitted / consumed event payload shapes.
 *  - Enables validation, documentation generation, coverage metrics, and
 *    runtime enforcement (validated emitter).
 *
 * Conventions:
 *  - Event type format: dot.delimited.names using domain-first grouping.
 *  - Each schema MUST include a literal `type` field matching the key.
 *  - Shared envelope fields standardized through BaseEventEnvelopeSchema.
 *
 * Phased Adoption Strategy (types-schemas-events-v1 epic):
 *  Phase A: Seed a small curated subset (core system & compute).
 *  Phase B: Enumerate all currently emitted event types (observation / grep).
 *  Phase C: Add schemas for 100% of stable types; log unknowns at runtime.
 *  Phase D: Enforce strict validation (unknown => reject or quarantine).
 *
 * Extension Guidelines:
 *  1. Define a new schema with BaseEventEnvelopeSchema.extend({ ... }).
 *  2. Add to EventCatalog with exact matching `type` literal.
 *  3. Re-run dev agent / docs generation to update metrics & documentation.
 *  4. Keep payload minimal & purposeful; avoid over-normalizing early.
 */

import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*  Base Envelope                                                             */
/* -------------------------------------------------------------------------- */

export const BaseEventEnvelopeSchema = z.object({
  type: z.string(), // MUST be literal in concrete schemas
  timestamp: z.string().min(1), // ISO timestamp (UTC preferred)
  id: z.string().uuid().optional(), // Optional unique event id
  origin: z.string().optional(), // Source (service / subsystem)
  correlationId: z.string().optional(), // For tracing multi-event flows
  // Additional cross-cutting metadata can be added here when justified
});

/* -------------------------------------------------------------------------- */
/*  Concrete Event Schemas (Seed Set)                                         */
/*  NOTE: Keep this initial set small; grow deliberately.                     */
/* -------------------------------------------------------------------------- */

/**
 * System Health Check Event
 * Emitted on periodic internal health probes / readiness signals.
 */
export const SystemHealthCheckEventSchema = BaseEventEnvelopeSchema.extend({
  type: z.literal("system.health_check"),
  status: z.enum(["ok", "degraded", "error"]),
  latencyMs: z.number().nonnegative().optional(),
  details: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Compute Job Queued
 * Emitted when a compute or AI workload is accepted for processing.
 */
export const ComputeJobQueuedEventSchema = BaseEventEnvelopeSchema.extend({
  type: z.literal("compute.job_queued"),
  jobId: z.string(),
  jobType: z.string(), // consider enum refinement later
  priority: z.enum(["low", "normal", "high"]).default("normal"),
  estimatedMs: z.number().int().positive().optional(),
});

/**
 * Compute Job Completed
 * Terminal success path for a compute job.
 */
export const ComputeJobCompletedEventSchema = BaseEventEnvelopeSchema.extend({
  type: z.literal("compute.job_completed"),
  jobId: z.string(),
  durationMs: z.number().int().nonnegative(),
  resultRef: z.string().optional(), // pointer to artifact / cache key
  success: z.literal(true),
});

/**
 * Compute Job Failed
 * Terminal failure path for a compute job.
 */
export const ComputeJobFailedEventSchema = BaseEventEnvelopeSchema.extend({
  type: z.literal("compute.job_failed"),
  jobId: z.string(),
  durationMs: z.number().int().nonnegative().optional(),
  errorType: z.string().optional(),
  message: z.string().optional(),
  retryable: z.boolean().default(false),
  success: z.literal(false).optional(), // kept for parity; always false
});

/**
 * User Auth Session Start
 * Emitted when a user initiates a fresh authenticated session.
 */
export const UserAuthSessionStartEventSchema = BaseEventEnvelopeSchema.extend({
  type: z.literal("auth.session_start"),
  userId: z.string(),
  sessionId: z.string(),
  method: z.enum(["email", "oauth", "token", "other"]).default("other"),
});

/* -------------------------------------------------------------------------- */
/*  Event Catalog                                                             */
/* -------------------------------------------------------------------------- */

export const EventCatalog = {
  "system.health_check": SystemHealthCheckEventSchema,
  "compute.job_queued": ComputeJobQueuedEventSchema,
  "compute.job_completed": ComputeJobCompletedEventSchema,
  "compute.job_failed": ComputeJobFailedEventSchema,
  "auth.session_start": UserAuthSessionStartEventSchema,
} as const;

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export type EventType = keyof typeof EventCatalog;

export type CanonicalEvent = {
  [K in keyof typeof EventCatalog]: z.infer<(typeof EventCatalog)[K]>;
}[keyof typeof EventCatalog];

/**
 * Map type -> inferred payload
 */
export type EventPayloadMap = {
  [K in keyof typeof EventCatalog]: z.infer<(typeof EventCatalog)[K]>;
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Return schema for a given event type (or undefined if unknown).
 */
export function getEventSchema<T extends string>(type: T) {
  return (EventCatalog as Record<string, z.ZodTypeAny>)[type];
}

/**
 * List all canonical event types.
 */
export function listEventTypes(): EventType[] {
  return Object.keys(EventCatalog) as EventType[];
}

/**
 * Validate a payload for a given event type. Returns a discriminated result.
 */
export function validateEventPayload<T extends EventType>(
  type: T,
  payload: unknown,
):
  | { success: true; data: EventPayloadMap[T] }
  | { success: false; error: string } {
  const schema = getEventSchema(type);
  if (!schema) {
    return { success: false, error: `Unknown event type: ${type}` };
  }
  const res = schema.safeParse(payload);
  if (res.success) {
    return { success: true, data: res.data as EventPayloadMap[T] };
  }
  return { success: false, error: res.error.message };
}

/**
 * Soft validation (non-throwing) returning parsed data or undefined.
 * Logs a concise warning when invalid (avoid verbose noise).
 */
export function tryParseEvent<T extends EventType>(
  type: T,
  payload: unknown,
): EventPayloadMap[T] | undefined {
  const result = validateEventPayload(type, payload);
  if (result.success) return result.data;
  // Intentionally concise to keep logs light:
  console.warn(`[events] Invalid payload for ${type}: ${result.error}`);
  return undefined;
}

/**
 * Diff a set of "observed" event types (e.g., from runtime logging)
 * against the catalog to identify coverage gaps.
 */
export function diffObservedEvents(observed: string[]) {
  const catalog = new Set(listEventTypes());
  const unknown: string[] = [];
  for (const t of observed) {
    if (!catalog.has(t as EventType)) unknown.push(t);
  }
  return {
    catalogCount: catalog.size,
    observedCount: observed.length,
    unknown,
    unknownCount: unknown.length,
  };
}

/* -------------------------------------------------------------------------- */
/*  CLI Mode (optional quick summary)                                         */
/*  Usage: bun -e "import { cliSummary } from './lib/events/catalog'; cliSummary()" */
/* -------------------------------------------------------------------------- */

export function cliSummary() {
  const summary = {
    eventTypes: listEventTypes(),
    count: listEventTypes().length,
  };
  console.log(JSON.stringify(summary, null, 2));
}

if (process.argv.includes("--summary")) {
  cliSummary();
}

/* -------------------------------------------------------------------------- */
/*  Future Extensions                                                         */
/* -------------------------------------------------------------------------- *
 * - Versioned event schemas (introduce `v` segment or version field).
 * - Deprecation metadata & automated warning emission.
 * - OpenAPI / AsyncAPI generation from catalog.
 * - Runtime event stream replay validator for historical logs.
 * - Observability hook: wrap emit() to auto-validate + record metrics.
 */

export default EventCatalog;
