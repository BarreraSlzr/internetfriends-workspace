// InternetFriends Compute Engine & AI Models

import { z } from "zod";

// AI Model Configuration Schema
export const AIModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: z.enum(["openai", "anthropic", "google", "cerebras", "local"]),
  modelId: z.string(),
  
  // Capabilities
  maxTokens: z.number().positive(),
  inputCost: z.number().min(0), // per 1K tokens
  outputCost: z.number().min(0), // per 1K tokens
  
  // Features
  supports: z.object({
    chat: z.boolean().default(true),
    completion: z.boolean().default(true),
    codeGeneration: z.boolean().default(false),
    imageGeneration: z.boolean().default(false),
    functionCalling: z.boolean().default(false),
    streaming: z.boolean().default(true),
  }),
  
  // Performance metrics
  averageLatency: z.number().positive().optional(), // ms
  tokensPerSecond: z.number().positive().optional(),
  
  // Availability
  isActive: z.boolean().default(true),
  region: z.array(z.string()).default(["global"]),
});

export type AIModel = z.infer<typeof AIModelSchema>;

// Cerebras Integration (from workspace setup)
export const CerebrasModelSchema = AIModelSchema.extend({
  provider: z.literal("cerebras"),
  apiKey: z.string().optional(),
  apiUrl: z.string().url().default("https://api.cerebras.ai/v1"),
  
  // Cerebras-specific features
  tokensPerSecond: z.number().default(2000), // Ultra-fast inference
  supports: z.object({
    chat: z.literal(true),
    completion: z.literal(true),
    codeGeneration: z.literal(true),
    imageGeneration: z.literal(false),
    functionCalling: z.literal(true),
    streaming: z.literal(true),
  }),
});

// Compute Task Schema
export const ComputeTaskSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  
  // Task definition
  type: z.enum([
    "code_generation",
    "code_review", 
    "refactoring",
    "testing",
    "documentation",
    "analysis",
    "debugging",
    "optimization",
  ]),
  
  input: z.object({
    content: z.string(),
    language: z.string().optional(),
    context: z.record(z.unknown()).optional(),
    instructions: z.string().optional(),
  }),
  
  // Execution config
  modelId: z.string(),
  maxTokens: z.number().positive().default(4000),
  temperature: z.number().min(0).max(2).default(0.7),
  
  // State
  status: z.enum(["pending", "running", "completed", "failed", "cancelled"]),
  
  // Results
  output: z.object({
    content: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
    usage: z.object({
      inputTokens: z.number().optional(),
      outputTokens: z.number().optional(),
      totalTokens: z.number().optional(),
      cost: z.number().optional(),
    }).optional(),
  }).optional(),
  
  // Timing
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  executionTimeMs: z.number().optional(),
  
  // Error handling
  error: z.object({
    message: z.string(),
    code: z.string().optional(),
    retryable: z.boolean().default(false),
  }).optional(),
  
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ComputeTask = z.infer<typeof ComputeTaskSchema>;

// Compute Engine Configuration
export const ComputeEngineSchema = z.object({
  id: z.string(),
  name: z.string(),
  
  // Resource limits
  maxConcurrentTasks: z.number().positive().default(5),
  maxQueueSize: z.number().positive().default(100),
  timeoutMs: z.number().positive().default(30000),
  
  // Model routing
  defaultModel: z.string(),
  modelRouting: z.record(z.string()).optional(), // task type -> model id
  
  // Cost management
  budgetLimits: z.object({
    daily: z.number().min(0).optional(),
    monthly: z.number().min(0).optional(),
    perTask: z.number().min(0).optional(),
  }).optional(),
  
  // Monitoring
  metrics: z.object({
    tasksCompleted: z.number().default(0),
    totalCost: z.number().default(0),
    averageLatency: z.number().default(0),
    errorRate: z.number().min(0).max(1).default(0),
  }).default({}),
  
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ComputeEngine = z.infer<typeof ComputeEngineSchema>;

// Pre-configured AI Models for InternetFriends
export const InternetFriendsModels: Record<string, AIModel> = {
  "cerebras-qwen-coder": {
    id: "cerebras-qwen-coder",
    name: "Qwen 3 Coder 32B (Cerebras)",
    provider: "cerebras",
    modelId: "qwen-3-coder-32b-instruct",
    maxTokens: 131000,
    inputCost: 0.0,  // Update with actual pricing
    outputCost: 0.0,
    supports: {
      chat: true,
      completion: true,
      codeGeneration: true,
      imageGeneration: false,
      functionCalling: true,
      streaming: true,
    },
    tokensPerSecond: 2000,
    isActive: true,
    region: ["global"],
  },
  
  "gpt-4-turbo": {
    id: "gpt-4-turbo", 
    name: "GPT-4 Turbo",
    provider: "openai",
    modelId: "gpt-4-turbo-preview",
    maxTokens: 128000,
    inputCost: 0.01,
    outputCost: 0.03,
    supports: {
      chat: true,
      completion: true,
      codeGeneration: true,
      imageGeneration: false,
      functionCalling: true,
      streaming: true,
    },
    isActive: true,
    region: ["global"],
  },
} as const;
