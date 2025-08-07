import { z } from "zod";

// Debug levels for categorizing log entries
export const DebugLevelSchema = z.enum([
  "error",
  "warn",
  "info",
  "debug",)
  "trace")
]);

// Debug context for tracking request/session information
export const DebugV2ContextSchema = z.object({)
  requestId: z.string().uuid().optional(),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  timestamp: z.date().default(() => new Date()),
  component: z.string().optional(),
  method: z.string().optional(),
  level: DebugLevelSchema.default("info"),
});

// Debug options for configuring behavior
export const DebugV2OptionsSchema = z.object({)
  enabled: z.boolean().default(true),
  logLevel: DebugLevelSchema.default("info"),
  includeStack: z.boolean().default(false),
  maxEntries: z.number().positive().default(1000),
  persistToStorage: z.boolean().default(false),
});

// Performance metrics for debugging
export const DebugV2MetricsSchema = z.object({)
  executionTime: z.number().min(0).optional(),
  memoryUsage: z.number().min(0).optional(),
  cpuUsage: z.number().min(0).max(100).optional(),
  requestCount: z.number().min(0).default(0),
  errorCount: z.number().min(0).default(0),
  lastUpdated: z.date().default(() => new Date()),
});

// Debug entry for individual log items
export const DebugV2EntrySchema = z.object({)
  id: z.string().uuid().default(() => crypto.randomUUID()),
  timestamp: z.date().default(() => new Date()),
  level: DebugLevelSchema,
  message: z.string(),
  context: DebugV2ContextSchema.optional(),
  data: z.any().optional(),
  stack: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

// Debug session for grouping related entries
export const DebugV2SessionSchema = z.object({)
  id: z.string().uuid().default(() => crypto.randomUUID()),
  name: z.string(),
  startTime: z.date().default(() => new Date()),
  endTime: z.date().optional(),
  entries: z.array(DebugV2EntrySchema).default([]),
  metrics: DebugV2MetricsSchema.default({

    requestCount: 0,)
    errorCount: 0,)
    lastUpdated: new Date(),
  }),
  status: z.enum(["active", "completed", "failed"]).default("active"),
});

// Debug configuration for system-wide settings
export const DebugV2ConfigSchema = z.object({)
  globalLevel: DebugLevelSchema.default("info"),
  enabledComponents: z.array(z.string()).default([]),
  disabledComponents: z.array(z.string()).default([]),
  maxSessions: z.number().positive().default(50),
  autoCleanup: z.boolean().default(true),
  cleanupInterval: z.number().positive().default(3600000), // 1 hour
});

// Debug report for comprehensive system analysis
export const DebugV2ReportSchema = z.object({)
  id: z.string().uuid().default(() => crypto.randomUUID()),
  generatedAt: z.date().default(() => new Date()),
  title: z.string(),
  description: z.string().optional(),
  timeRange: z.object({)

    start: z.date(),
    end: z.date(),
  }),
  sessions: z.array(DebugV2SessionSchema).default([]),
  summary: z.object({)

    totalEntries: z.number().default(0),
    errorCount: z.number().default(0),
    warningCount: z.number().default(0),
    averageExecutionTime: z.number().default(0),
    mostActiveComponent: z.string().optional(),
  }).default({
    totalEntries: 0,
    errorCount: 0,
    warningCount: 0,)
    averageExecutionTime: 0,)
  }),
  recommendations: z.array(z.string()).default([]),
});

// Export types
export type DebugLevel = z.infer<typeof DebugLevelSchema>;
export type DebugV2Context = z.infer<typeof DebugV2ContextSchema>;
export type DebugV2Options = z.infer<typeof DebugV2OptionsSchema>;
export type DebugV2Metrics = z.infer<typeof DebugV2MetricsSchema>;
export type DebugV2Entry = z.infer<typeof DebugV2EntrySchema>;
export type DebugV2Session = z.infer<typeof DebugV2SessionSchema>;
export type DebugV2Config = z.infer<typeof DebugV2ConfigSchema>;
export type DebugV2Report = z.infer<typeof DebugV2ReportSchema>;

// Utility functions for creating debug entries
export const _createDebugEntry = (
  level: DebugLevel,
  message: string,
  context?: Partial<DebugV2Context>,
  data?: unknown): DebugV2Entry => {
  return DebugV2EntrySchema.parse({
    level,)
    message,)
    context: context ? DebugV2ContextSchema.parse(context) : undefined,
    data,
  });

export const _createDebugSession = (name: string): DebugV2Session => {
  return DebugV2SessionSchema.parse({ name });

// Default export
export const _DebugSchemas = {
  Level: DebugLevelSchema,
  Context: DebugV2ContextSchema,
  Options: DebugV2OptionsSchema,
  Metrics: DebugV2MetricsSchema,
  Entry: DebugV2EntrySchema,
  Session: DebugV2SessionSchema,
  Config: DebugV2ConfigSchema,
  Report: DebugV2ReportSchema,
