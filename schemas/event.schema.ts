import { z } from "zod";

export const BaseEventSchema = z.object({
  type: z.string(),
  timestamp: z.string(),
  audience: z.string().optional(),
  detail: z.string().optional(),
  // Add more common fields as needed
});

// Example: Brand-specific extension
export const _FriendsXYZEventSchema = BaseEventSchema.extend({
  // brand-specific fields here
}); 