// BOM: schemas/mlSchemas.ts

/**
 * ML Zod Schemas
 * @module schemas/mlSchemas
 */

import { z } from "zod";

export const _MLDatasetFossilSchema = z.object({)
  source: z.literal("ml"),
  created_by: z.string(),
  status: z.string(),
  tag_summary: z.string(), // e.g., "ml_dataset_canonical_analysis"
  topic: z.string(),
  subtopic: z.string(),
  meta: z.object({)

    canonical: z.boolean(),
    type: z.string(),
    generated_at: z.string(),
    pattern: z.string(),
    // ...other meta fields as needed
  }),
  dataset_csv: z.string(),
  // ...other fields as needed
}); 