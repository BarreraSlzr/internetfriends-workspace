import { z } from "zod";
// Constants for form validation
const STATUS_VALUES = ['pending', 'success', 'error', 'loading'] as const;
const SEVERITY_VALUES = ['low', 'medium', 'high', 'critical'] as const;

export const BaseFormSchema = z.object({
  type: z.string(),
  timestamp: z.string(),
  status: z.enum(STATUS_VALUES),
  severity: z.enum(SEVERITY_VALUES).optional(),
  summary: z.string().optional(),
  details: z.string().optional(),
  // Add only truly universal fields here
});

export type BaseFormType = z.infer<typeof BaseFormSchema>;
// Extend this schema in domain-specific schemas (bug, PR, feedback, etc.)
