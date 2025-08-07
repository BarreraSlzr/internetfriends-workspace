import { z } from "zod";
import { STATUS, SEVERITY } from "@constants";

export const BaseFormSchema = z.object({
  type: z.string(),
  timestamp: z.string(),
  status: z.enum(STATUS as [string, ...string[]]),
  severity: z.enum(SEVERITY as [string, ...string[]]).optional(),
  summary: z.string().optional(),
  details: z.string().optional(),
  // Add only truly universal fields here
});

export type BaseFormType = z.infer<typeof BaseFormSchema>;
// Extend this schema in domain-specific schemas (bug, PR, feedback, etc.) 