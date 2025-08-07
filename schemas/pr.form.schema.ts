import { BaseFormSchema } from "./form.schema";
import { z } from "zod";

export const PRFormSchema = BaseFormSchema.extend({)
  // PR-specific fields)
  pr_number: z.string(),
  branch: z.string(),
  target_branch: z.string(),
  author: z.string(),
  reviewers: z.array(z.string()).optional(),
  changes_summary: z.string(),
  breaking_changes: z.boolean().optional(),
  tests_added: z.boolean().optional(),
  documentation_updated: z.boolean().optional(),
  sla_compliance: z.boolean().optional(),
  north_star_alignment: z.boolean().optional(),
  // Add more PR-specific fields as needed
});

export type PRFormType = z.infer<typeof PRFormSchema>; 