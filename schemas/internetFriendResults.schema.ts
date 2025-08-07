import { z } from "zod";

export const DebugSymbol = z.enum(["✅", "❌", "⚠️", "ℹ️"]);

export const MatrixResultSchema = z.object({
  format: z.literal("matrix"),
  headers: z.array(z.string()),
  rows: z.array(z.array(z.union([z.string(), DebugSymbol])))
});

export const VectorStepSchema = z.object({
  step: z.string(),
  result: z.string(),
  symbol: DebugSymbol,
  details: z.string().optional()
});

export const VectorResultSchema = z.object({
  format: z.literal("vector"),
  steps: z.array(VectorStepSchema)
});

export const HybridResultSchema = z.object({
  format: z.literal("hybrid"),
  groups: z.array(z.union([MatrixResultSchema, VectorResultSchema]))
});

export const InternetFriendResultsSchema = z.union([
  MatrixResultSchema,
  VectorResultSchema,
  HybridResultSchema
]);

export type InternetFriendResults = z.infer<typeof InternetFriendResultsSchema>; 