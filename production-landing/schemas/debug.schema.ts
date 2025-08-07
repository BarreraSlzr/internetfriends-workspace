// BOM: schemas/debug.schema.ts
/**
 * Debug V2 Zod Schemas
 * @module schemas/debug.schema
 * 
 * Zod validation schemas for the v2 debug system:
 * - Context validation schemas
 * - Configuration validation schemas
 * - Result validation schemas
 * - Schema registry validation
 */
import { z } from 'zod';
import type {
  DebugV2ContextType,
  DebugV2Status,
  DebugV2Format,
  DebugV2Theme,
  DebugV2Operation,
  DebugV2Context,
  DebugV2Options,
  DebugV2Result,
  DebugV2Schema,
  DebugV2SchemaRegistry,
  DebugV2OperationConfig
} from '../types/debug/debug.type';

// ============================================================================
// CORE TYPE SCHEMAS
// ============================================================================

/**
 * Debug context type schema
 */
export const DebugV2ContextTypeSchema = z.enum([
  'progress', 'error', 'warning', 'success', 'summary', 'step', 'iteration',
  'xyz', 'style', 'context', 'footprint', 'canonical', 'replication', 'validation',
  'sla', 'form', 'console', 'audit', 'performance', 'security'
]);

/**
 * Debug status schema
 */
export const DebugV2StatusSchema = z.enum([
  'success', 'failed', 'pending', 'retry', 'warning', 'info'
]);

/**
 * Debug format schema
 */
export const DebugV2FormatSchema = z.enum([
  'cli', 'md', 'mdx', 'react', 'json', 'form', 'xyz', 'yaml', 'html'
]);

/**
 * Debug theme schema
 */
export const DebugV2ThemeSchema = z.enum([
  'default', 'minimal', 'rich', 'debug', 'production', 'development'
]);

/**
 * Debug operation schema
 */
export const DebugV2OperationSchema = z.enum([
  'sla', 'form', 'console', 'all', 'xyz', 'audit', 'performance'
]);

// ============================================================================
// CONTEXT SCHEMAS
// ============================================================================

/**
 * XYZ integration context schema
 */
export const DebugV2XYZContextSchema = z.object({
  operation: z.string().optional(),
  params: z.record(z.unknown()).optional(),
  result: z.unknown().optional(),
  footprint: z.string().optional(),
  module: z.string().optional(),
  function: z.string().optional(),
  line: z.number().optional()
});

/**
 * Style context schema
 */
export const DebugV2StyleContextSchema = z.object({
  format: DebugV2FormatSchema.optional(),
  theme: DebugV2ThemeSchema.optional(),
  colors: z.boolean().optional(),
  emojis: z.boolean().optional(),
  structured: z.boolean().optional(),
  compact: z.boolean().optional(),
  verbose: z.boolean().optional()
});

/**
 * Canonical context schema
 */
export const DebugV2CanonicalContextSchema = z.object({
  hash: z.string().optional(),
  content: z.string().optional(),
  structure: z.record(z.unknown()).optional(),
  dependencies: z.array(z.string()).optional(),
  validation: z.object({
    success: z.boolean(),
    errors: z.array(z.string()),
    warnings: z.array(z.string())
  }).optional()
});

/**
 * Performance context schema
 */
export const DebugV2PerformanceContextSchema = z.object({
  startTime: z.number(),
  endTime: z.number().optional(),
  duration: z.number().optional(),
  memoryUsage: z.object({
    heapUsed: z.number(),
    heapTotal: z.number(),
    external: z.number()
  }).optional(),
  cpuUsage: z.object({
    user: z.number(),
    system: z.number()
  }).optional(),
  metrics: z.record(z.number()).optional()
});

/**
 * Security context schema
 */
export const DebugV2SecurityContextSchema = z.object({
  level: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.enum(['authentication', 'authorization', 'data', 'network', 'system']),
  threat: z.string().optional(),
  mitigation: z.string().optional(),
  cve: z.string().optional(),
  severity: z.enum(['info', 'warning', 'error', 'critical'])
});

/**
 * Base debug context schema
 */
export const DebugV2BaseContextSchema = z.object({
  type: DebugV2ContextTypeSchema,
  message: z.string(),
  timestamp: z.string().datetime(),
  phase: z.string().optional(),
  step: z.string().optional(),
  file: z.string().optional(),
  status: DebugV2StatusSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
  duration: z.number().optional(),
  retryCount: z.number().optional(),
  suggestions: z.array(z.string()).optional(),
  nextAction: z.string().optional()
});

/**
 * Complete debug context schema
 */
export const DebugV2ContextSchema = DebugV2BaseContextSchema.extend({
  xyzContext: DebugV2XYZContextSchema.optional(),
  style: DebugV2StyleContextSchema.optional(),
  canonical: DebugV2CanonicalContextSchema.optional(),
  performance: DebugV2PerformanceContextSchema.optional(),
  security: DebugV2SecurityContextSchema.optional()
});

// ============================================================================
// CONFIGURATION SCHEMAS
// ============================================================================

/**
 * Debug options schema
 */
export const DebugV2OptionsSchema = z.object({
  format: DebugV2FormatSchema,
  verbose: z.boolean().optional(),
  streamLimit: z.number().positive().optional(),
  includeFrontmatter: z.boolean().optional(),
  snapshotMode: z.boolean().optional(),
  multipartForm: z.boolean().optional(),
  
  // XYZ Integration
  xyzIntegration: z.boolean().optional(),
  xyzParams: z.record(z.unknown()).optional(),
  
  // Style Options
  style: DebugV2StyleContextSchema.optional(),
  
  // Performance Options
  enablePerformance: z.boolean().optional(),
  enableMemoryTracking: z.boolean().optional(),
  
  // Security Options
  enableSecurityAudit: z.boolean().optional(),
  securityLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  
  // Output Options
  outputPath: z.string().optional(),
  outputFormat: DebugV2FormatSchema.optional(),
  includeMetadata: z.boolean().optional(),
  includeStackTraces: z.boolean().optional()
});

/**
 * Debug operation configuration schema
 */
export const DebugV2OperationConfigSchema = z.object({
  operation: DebugV2OperationSchema,
  format: DebugV2FormatSchema.optional(),
  showCriticalOnly: z.boolean().optional(),
  includeOutputs: z.boolean().optional(),
  assert: z.boolean().optional(),
  validate: z.boolean().optional(),
  timeout: z.number().positive().optional(),
  retries: z.number().nonnegative().optional()
});

// ============================================================================
// RESULT SCHEMAS
// ============================================================================

/**
 * Debug validation result schema
 */
export const DebugV2ValidationResultSchema = z.object({
  success: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  assertions: z.array(z.object({
    name: z.string(),
    passed: z.boolean(),
    message: z.string().optional()
  }))
});

/**
 * Debug result schema
 */
export const DebugV2ResultSchema = z.object({
  output: z.string(),
  format: DebugV2FormatSchema,
  frontmatter: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
  suggestions: z.array(z.string()).optional(),
  nextAction: z.string().optional(),
  
  // XYZ Integration
  xyzResult: z.unknown().optional(),
  xyzFootprint: z.string().optional(),
  
  // Performance
  performance: DebugV2PerformanceContextSchema.optional(),
  
  // Security
  security: DebugV2SecurityContextSchema.optional(),
  
  // Validation
  validation: DebugV2ValidationResultSchema.optional()
});

/**
 * Debug orchestrator state schema
 */
export const DebugV2OrchestratorStateSchema = z.object({
  label: z.string(),
  version: z.string(),
  contexts: z.array(DebugV2ContextSchema),
  options: DebugV2OptionsSchema,
  streamBuffer: z.array(z.string()),
  processingTime: z.number(),
  success: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  timestamp: z.string().datetime()
});

// ============================================================================
// SCHEMA REGISTRY SCHEMAS
// ============================================================================

/**
 * Debug schema validation rule schema
 */
export const DebugV2SchemaValidationRuleSchema = z.object({
  field: z.string(),
  rule: z.string(),
  message: z.string()
});

/**
 * Debug schema example schema
 */
export const DebugV2SchemaExampleSchema = z.object({
  name: z.string(),
  context: DebugV2ContextSchema
});

/**
 * Debug schema definition schema
 */
export const DebugV2SchemaDefinitionSchema = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string(),
  contextTypes: z.array(DebugV2ContextTypeSchema),
  requiredFields: z.array(z.string()),
  optionalFields: z.array(z.string()),
  validationRules: z.array(DebugV2SchemaValidationRuleSchema),
  examples: z.array(DebugV2SchemaExampleSchema)
});

/**
 * Debug schema registry schema
 */
export const DebugV2SchemaRegistrySchema = z.object({
  version: z.string(),
  timestamp: z.string().datetime(),
  schemas: z.record(DebugV2SchemaDefinitionSchema),
  defaultSchema: z.string(),
  validationEnabled: z.boolean()
});

// ============================================================================
// UTILITY SCHEMAS
// ============================================================================

/**
 * Debug context filter schema
 */
export const DebugV2ContextFilterSchema = z.function()
  .args(DebugV2ContextSchema)
  .returns(z.boolean());

/**
 * Debug context transformer schema
 */
export const DebugV2ContextTransformerSchema = z.function()
  .args(DebugV2ContextSchema)
  .returns(DebugV2ContextSchema);

/**
 * Debug output formatter schema
 */
export const DebugV2OutputFormatterSchema = z.function()
  .args(DebugV2ContextSchema, DebugV2OptionsSchema)
  .returns(z.string());

/**
 * Debug assertion schema
 */
export const DebugV2AssertionSchema = z.function()
  .args(DebugV2ContextSchema)
  .returns(z.boolean());

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate debug context
 */
export function validateDebugV2Context(context: unknown): DebugV2Context {
  return DebugV2ContextSchema.parse(context);
}

/**
 * Validate debug options
 */
export function validateDebugV2Options(options: unknown): DebugV2Options {
  return DebugV2OptionsSchema.parse(options);
}

/**
 * Validate debug result
 */
export function validateDebugV2Result(result: unknown): DebugV2Result {
  return DebugV2ResultSchema.parse(result);
}

/**
 * Validate debug schema registry
 */
export function validateDebugV2SchemaRegistry(registry: unknown): DebugV2SchemaRegistry {
  return DebugV2SchemaRegistrySchema.parse(registry);
}

/**
 * Validate debug operation config
 */
export function validateDebugV2OperationConfig(config: unknown): DebugV2OperationConfig {
  return DebugV2OperationConfigSchema.parse(config);
}

// ============================================================================
// SCHEMA EXPORTS
// ============================================================================

export {
  DebugV2ContextTypeSchema as ContextType,
  DebugV2StatusSchema as Status,
  DebugV2FormatSchema as Format,
  DebugV2ThemeSchema as Theme,
  DebugV2OperationSchema as Operation,
  DebugV2ContextSchema as Context,
  DebugV2OptionsSchema as Options,
  DebugV2ResultSchema as Result,
  DebugV2SchemaDefinitionSchema as Schema,
  DebugV2SchemaRegistrySchema as SchemaRegistry
}; 