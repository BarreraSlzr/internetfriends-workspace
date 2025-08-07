import { z } from "zod";

// Consider extracting these enums from YAML in the future for cross-source-of-truth
export const PlatformsEnum = z.enum(["Meta", "Gmail", "TikTok", "Hubspot", "web", "native", "api"]);
export const FunnelStatusEnum = z.enum(["pending", "active", "completed", "failed"]);

export const _FunnelsPlanSchema = z.object({
  meta: z.object({
    canonical: z.boolean(),
    type: z.literal("funnels_plan"),
    schema: z.string(),
    updated_at: z.string(), // Could use z.string().datetime() if strict
  }),
  funnels: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      platforms: z.array(PlatformsEnum),
      steps: z.array(
        z.object({
          order: z.number().int(),
          action: z.string(),
          details: z.record(z.string(), z.any()).optional(),
        })
      ),
      owner: z.string(),
      status: FunnelStatusEnum,
    })
  ),
});

export const _SLARulesSchema = z.object({
  meta: z.object({
    canonical: z.boolean(),
    type: z.literal("sla_rules"),
    schema: z.string(),
    updated_at: z.string(),
  }),
  rules: z.array(
    z.object({
      id: z.string(),
      description: z.string(),
      target: z.string(),
      condition: z.string(),
      action: z.string(),
      batch_plan: z.string(),
      enabled: z.boolean(),
    })
  ),
});

// Structured Commit Message Metadata Schema
export const _CommitMetadataSchema = z.object({
  automation_scope: z.string(),
  llm_insights: z.string(),
  roadmap_impact: z.enum(["low", "medium", "high"]),
  validation: z.string(),
  tests: z.string(),
  canonicalization: z.string(),
  tag_summary: z.string(), // e.g., "ml_dataset_canonical_analysis"
  dataset_insights: z.string(), // Optionally, further parse this if needed
});
