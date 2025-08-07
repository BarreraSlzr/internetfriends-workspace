import { z } from "zod";

export const ConsoleLogEntrySchema = z.object({
  time: z.string(), // e.g., '12:34:01'
  type: z.enum(['log', 'info', 'debug', 'warn', 'error']),
  msg: z.string(),
});

export const ConsoleLogExportSchema = z.object({
  exportedAt: z.string(), // ISO timestamp
  dashboardVersion: z.string(),
  logs: z.array(ConsoleLogEntrySchema),
});

// Example usage in a pipe or backend endpoint:
// import { ConsoleLogExportSchema } from "@/schemas/console-log.schema";
// const result = ConsoleLogExportSchema.safeParse(payload);
// if (!result.success) { /* handle validation error */ } 