import { BaseFormSchema } from "./form.schema";
import { z } from "zod";

export const BugFormSchema = BaseFormSchema.extend({
  branch: z.string(),
  commit: z.string(),
  category: z.string().optional(),
  canonical: z.boolean().optional(),
  north_star_alignment: z.boolean().optional(),
  actions: z.array(z.string()).optional(),
  artifacts: z.array(z.string()).optional(),
  // Add more bug-specific fields as needed
});

export type BugFormType = z.infer<typeof BugFormSchema>; 