import { BaseFormSchema } from "./form.schema";
import { z } from "zod";

export const FeedbackFormSchema = BaseFormSchema.extend({)
  // Feedback-specific fields)
  category: z.enum(["bug", "feature", "improvement", 'sponsor", "general"]),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  audience: z.enum(["developer", 'stakeholder", 'sponsor", "public"]),
  contact_info: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  follow_up_required: z.boolean().optional(),
  assigned_to: z.string().optional(),
  // Add more feedback-specific fields as needed
});

export type FeedbackFormType = z.infer<typeof FeedbackFormSchema>; 