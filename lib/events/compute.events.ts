#!/usr/bin/env bun
// InternetFriends Compute Events System
// High-performance compute job management and resource optimization

import { z } from "zod";

// Compute Job Types
export const ComputeJobTypeSchema = z.enum([
  "build.compilation",
  "test.execution",
  "database.query",
  "api.request",
  "file.processing",
  "cache.warm",
  "analytics.compute",
]);

export type ComputeJobType = z.infer<typeof ComputeJobTypeSchema>;

// Resource Types
export const ResourceTypeSchema = z.enum([
  "cpu",
  "memory",
  "gpu",
  "storage",
  "network",
  "database_connections",
  "api_tokens",
  "cache_memory",
]);

export type ResourceType = z.infer<typeof ResourceTypeSchema>;

// Job Priority Levels
export const JobPrioritySchema = z.enum([
  "background",
  "normal",
  "high",
  "critical",
  "real_time",
]);

export type JobPriority = z.infer<typeof JobPrioritySchema>;

// Job Status
export const JobStatusSchema = z.enum([
  "pending",
  "queued",
  "running",
  "completed",
  "failed",
  "cancelled",
  "timeout",
]);

export type JobStatus = z.infer<typeof JobStatusSchema>;

// Compute Job Schema
export const ComputeJobSchema = z.object({
  id: z.string().uuid(),
  type: ComputeJobTypeSchema,
  priority: JobPrioritySchema.default("normal"),
  status: JobStatusSchema.default("pending"),
  payload: z.record(z.string(), z.any()).optional(),
  metadata: z.record(z.string(), z.string()).optional(),
  retries: z.number().default(3),
  timeout: z.number().default(30000), // 30 seconds
  createdAt: z.date(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  correlationId: z.string().optional(),
});

export type ComputeJob = z.infer<typeof ComputeJobSchema>;

// Resource Usage Schema
export const ResourceUsageSchema = z.object({
  type: ResourceTypeSchema,
  used: z.number(),
  available: z.number(),
  limit: z.number(),
  percentage: z.number(),
});

export type ResourceUsage = z.infer<typeof ResourceUsageSchema>;

// Job Result Schema
export const JobResultSchema = z.object({
  jobId: z.string(),
  success: z.boolean(),
  result: z.any().optional(),
  error: z.string().optional(),
  processingTime: z.number(),
  resourceUsage: z.record(z.string(), z.number()).optional(),
  timestamp: z.date(),
});

export type JobResult = z.infer<typeof JobResultSchema>;

// Compute Configuration Schema
export const ComputeConfigSchema = z.object({
  maxConcurrentJobs: z.number().default(10),
  resourceLimits: z.record(z.string(), z.number()).default({
    cpu_cores: 4,
    memory_mb: 8192,
    gpu_units: 1,
    storage_gb: 100,
    network_mbps: 1000,
    database_connections: 50,
    api_tokens: 1000,
    cache_memory_mb: 2048,
  }),
  priorityWeights: z.record(z.string(), z.number()).default({
    background: 1,
    normal: 2,
    high: 4,
    critical: 8,
    real_time: 16,
  }),
  enableAutoScaling: z.boolean().default(true),
  metricsRetentionMs: z.number().default(3600000), // 1 hour
});

export type ComputeConfig = z.infer<typeof ComputeConfigSchema>;

// Job Queue with Priority Management
class ComputeJobQueue {
  private jobs: ComputeJob[] = [];
  private runningJobs = new Set<string>();
  private maxConcurrent: number;

  constructor(maxConcurrent = 10) {
    this.maxConcurrent = maxConcurrent;
  }

  enqueue(job: ComputeJob): void {
    // Insert based on priority
    const index = this.findInsertIndex(job);
    this.jobs.splice(index, 0, job);
  }

  dequeue(): ComputeJob | null {
    if (this.runningJobs.size >= this.maxConcurrent) {
      return null;
    }

    const job = this.jobs.shift();
    if (job) {
      this.runningJobs.add(job.id);
      job.status = "running";
      job.startedAt = new Date();
    }
    return job || null;
  }

  complete(jobId: string): void {
    this.runningJobs.delete(jobId);
  }

  size(): number {
    return this.jobs.length;
  }

  getRunningCount(): number {
    return this.runningJobs.size;
  }

  private findInsertIndex(job: ComputeJob): number {
    const priorities = {
      real_time: 0,
      critical: 1,
      high: 2,
      normal: 3,
      background: 4,
    };
    const jobPriorityValue = priorities[job.priority];

    for (let i = 0; i < this.jobs.length; i++) {
      const queuePriorityValue = priorities[this.jobs[i].priority];
      if (jobPriorityValue < queuePriorityValue) {
        return i;
      }
    }
    return this.jobs.length;
  }
}

// Resource Monitor
class ResourceMonitor {
  private resources: Map<ResourceType, ResourceUsage> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;

  start(): void {
    this.updateInterval = setInterval(() => {
      this.updateResourceUsage();
    }, 1000); // Update every second
  }

  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private updateResourceUsage(): void {
    // Simulate resource usage monitoring
    // In a real implementation, this would query actual system resources
    const resourceTypes: ResourceType[] = [
      "cpu",
      "memory",
      "gpu",
      "storage",
      "network",
      "database_connections",
      "api_tokens",
      "cache_memory",
    ];

    resourceTypes.forEach((type) => {
      const limit = this.getResourceLimit(type);
      const used = Math.random() * limit * 0.8; // Simulate 0-80% usage
      const available = limit - used;
      const percentage = (used / limit) * 100;

      this.resources.set(type, {
        type,
        used,
        available,
        limit,
        percentage,
      });
    });
  }

  private getResourceLimit(type: ResourceType): number {
    const limits: Record<ResourceType, number> = {
      cpu: 4,
      memory: 8192,
      gpu: 1,
      storage: 102400,
      network: 1000,
      database_connections: 50,
      api_tokens: 1000,
      cache_memory: 2048,
    };
    return limits[type] || 100;
  }

  getResourceUsage(type: ResourceType): ResourceUsage | null {
    return this.resources.get(type) || null;
  }

  getAllResourceUsage(): ResourceUsage[] {
    return Array.from(this.resources.values());
  }

  isResourceAvailable(type: ResourceType, required: number): boolean {
    const usage = this.resources.get(type);
    return usage ? usage.available >= required : false;
  }
}

// Compute Manager
export class ComputeManager {
  private jobQueue = new ComputeJobQueue();
  private resourceMonitor = new ResourceMonitor();
  private config: ComputeConfig;
  private isRunning = false;
  private processInterval: NodeJS.Timeout | null = null;
  private jobHandlers = new Map<
    ComputeJobType,
    (job: ComputeJob) => Promise<any>
  >();

  constructor(config: Partial<ComputeConfig> = {}) {
    this.config = ComputeConfigSchema.parse(config);
  }

  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.resourceMonitor.start();

    // Process jobs continuously
    this.processInterval = setInterval(() => {
      this.processJobs();
    }, 100); // Process every 100ms
  }

  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.resourceMonitor.stop();

    if (this.processInterval) {
      clearInterval(this.processInterval);
      this.processInterval = null;
    }
  }

  registerJobHandler(
    jobType: ComputeJobType,
    handler: (job: ComputeJob) => Promise<any>,
  ): void {
    this.jobHandlers.set(jobType, handler);
  }

  async submitJob(
    payload: unknown,
    jobType: ComputeJobType,
    options: Partial<ComputeJob> = {},
  ): Promise<string> {
    const job: ComputeJob = {
      id: crypto.randomUUID(),
      type: jobType,
      priority: options.priority || "normal",
      status: "pending",
      payload:
        typeof payload === "object" && payload !== null
          ? (payload as Record<string, any>)
          : { data: payload },
      metadata: options.metadata,
      retries: options.retries || 3,
      timeout: options.timeout || 30000,
      createdAt: new Date(),
      userId: options.userId,
      sessionId: options.sessionId,
      correlationId: options.correlationId,
    };

    this.jobQueue.enqueue(job);
    return job.id;
  }

  private async processJobs(): Promise<void> {
    if (!this.isRunning) return;

    const job = this.jobQueue.dequeue();
    if (!job) return;

    const handler = this.jobHandlers.get(job.type);
    if (!handler) {
      console.warn(`No handler registered for job type: ${job.type}`);
      this.jobQueue.complete(job.id);
      return;
    }

    try {
      const result = await Promise.race([
        handler(job),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Job timeout")), job.timeout),
        ),
      ]);

      job.status = "completed";
      job.completedAt = new Date();
      this.jobQueue.complete(job.id);

      // Emit job completed event
      if (
        typeof globalThis !== "undefined" &&
        (globalThis as any).eventSystem
      ) {
        (globalThis as any).eventSystem.emit("compute.job_completed", {
          jobId: job.id,
          result,
          processingTime:
            job.completedAt.getTime() -
            (job.startedAt?.getTime() || job.createdAt.getTime()),
        });
      }
    } catch (error) {
      job.status = "failed";
      job.completedAt = new Date();
      this.jobQueue.complete(job.id);

      // Emit job failed event
      if (
        typeof globalThis !== "undefined" &&
        (globalThis as any).eventSystem
      ) {
        (globalThis as any).eventSystem.emit("compute.job_failed", {
          jobId: job.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  getQueueStats(): {
    pending: number;
    running: number;
    maxConcurrent: number;
  } {
    return {
      pending: this.jobQueue.size(),
      running: this.jobQueue.getRunningCount(),
      maxConcurrent: this.config.maxConcurrentJobs,
    };
  }

  getResourceUsage(): ResourceUsage[] {
    return this.resourceMonitor.getAllResourceUsage();
  }

  async healthCheck(): Promise<boolean> {
    try {
      const stats = this.getQueueStats();
      const resourceUsage = this.getResourceUsage();

      // Check if system is healthy
      const isHealthy =
        this.isRunning &&
        stats.pending < 1000 && // Queue not overloaded
        resourceUsage.every((r) => r.percentage < 95); // Resources not maxed out

      return isHealthy;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const computeManager = new ComputeManager();

// Convenience functions for common operations
export const ComputeOperations = {
  async runTests(
    testSuite: string,
    options?: Record<string, any>,
  ): Promise<string> {
    return computeManager.submitJob(
      { testSuite, ...options },
      "test.execution",
    );
  },

  async runBuild(buildConfig: Record<string, any>): Promise<string> {
    return computeManager.submitJob(buildConfig, "build.compilation");
  },

  async processFile(filePath: string, operation: string): Promise<string> {
    return computeManager.submitJob({ filePath, operation }, "file.processing");
  },

  async runQuery(query: string, params?: Record<string, any>): Promise<string> {
    return computeManager.submitJob({ query, params }, "database.query");
  },

  async warmCache(cacheKey: string, data?: any): Promise<string> {
    return computeManager.submitJob({ cacheKey, data }, "cache.warm");
  },
};

// Initialize compute system when module loads
if (typeof window === "undefined") {
  // Server-side initialization
  computeManager.start();

  // Graceful shutdown
  process.on("SIGINT", () => computeManager.stop());
  process.on("SIGTERM", () => computeManager.stop());
}

// Export for testing and debugging
export { computeManager as debugComputeManager };
