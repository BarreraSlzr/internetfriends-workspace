#!/usr/bin/env bun
// InternetFriends Event-Driven System
// Implements high-performance event system for compute optimization and streamlined operations

import { z } from "zod";

// Event System Types & Schemas
export const EventTypeSchema = z.enum([
  // System events
  "system.startup",
  "system.shutdown",
  "system.error",
  "system.health_check",

  // User events
  "user.login",
  "user.logout",
  "user.action",
  "user.preference_change",

  // Compute events
  "compute.job_started",
  "compute.job_completed",
  "compute.job_failed",
  "compute.job_queued",
  "compute.job_submitted",
  "compute.job_cancelled",
  "compute.resource_allocated",
  "compute.resource_released",
  "compute.resource_high_usage",
  "compute.system_started",
  "compute.system_stopped",
  "compute.system_overload",

  // UI/UX events
  "ui.page_load",
  "ui.component_render",
  "ui.interaction",
  "ui.theme_change",

  // API events
  "api.request_start",
  "api.request_complete",
  "api.request_error",
  "api.rate_limit",

  // Database events
  "db.connection_open",
  "db.connection_close",
  "db.query_start",
  "db.query_complete",
  "db.query_error",

  // Development events
  "dev.hot_reload",
  "dev.build_start",
  "dev.build_complete",
  "dev.test_run",
]);

export type EventType = z.infer<typeof EventTypeSchema>;

// Event Priority Levels
export const EventPrioritySchema = z.enum([
  "low",
  "normal",
  "high",
  "critical",
]);
export type _EventPriority = z.infer<typeof EventPrioritySchema>;

// Base Event Schema
export const BaseEventSchema = z.object({
  id: z.string().uuid(),
  type: EventTypeSchema,
  priority: EventPrioritySchema.default("normal"),
  timestamp: z.date(),
  source: z.string(),
  data: z.record(z.string(), z.any()).optional(),
  metadata: z.record(z.string(), z.string()).optional(),
  correlationId: z.string().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
});

export type BaseEvent = z.infer<typeof BaseEventSchema>;

// Event Handler Schema
export const EventHandlerSchema = z.object({
  id: z.string(),
  eventType: EventTypeSchema,
  priority: EventPrioritySchema.default("normal"),
  handler: z.any(),
  enabled: z.boolean().default(true),
  retries: z.number().default(3),
  timeout: z.number().default(5000),
  filter: z.any().optional(),
});

export type EventHandler = z.infer<typeof EventHandlerSchema>;

// Event Processing Result
export const EventResultSchema = z.object({
  eventId: z.string(),
  handlerId: z.string(),
  success: z.boolean(),
  processingTime: z.number(),
  error: z.string().optional(),
  result: z.any().optional(),
  timestamp: z.date(),
});

export type EventResult = z.infer<typeof EventResultSchema>;

// Event System Statistics
export interface EventSystemStats {
  totalEvents: number;
  eventsPerSecond: number;
  averageProcessingTime: number;
  successRate: number;
  errorRate: number;
  queueSize: number;
  activeHandlers: number;
  uptime: number;
}

// Event Queue Implementation
class EventQueue {
  private queue: BaseEvent[] = [];
  private processing = false;

  enqueue(event: BaseEvent): void {
    // Insert based on priority
    const index = this.findInsertIndex(event);
    this.queue.splice(index, 0, event);
  }

  dequeue(): BaseEvent | undefined {
    return this.queue.shift();
  }

  size(): number {
    return this.queue.length;
  }

  clear(): void {
    this.queue = [];
  }

  private findInsertIndex(event: BaseEvent): number {
    const priorities = { critical: 0, high: 1, normal: 2, low: 3 };
    const eventPriorityValue = priorities[event.priority];

    for (let i = 0; i < this.queue.length; i++) {
      const queuePriorityValue = priorities[this.queue[i].priority];
      if (eventPriorityValue < queuePriorityValue) {
        return i;
      }
    }
    return this.queue.length;
  }
}

// Main Event System Class
export class InternetFriendsEventSystem {
  private handlers = new Map<string, EventHandler[]>();
  private globalHandlers: EventHandler[] = [];
  private eventQueue = new EventQueue();
  private stats: EventSystemStats;
  private isRunning = false;
  private processInterval: NodeJS.Timeout | null = null;
  private startTime = Date.now();

  constructor() {
    this.stats = {
      totalEvents: 0,
      eventsPerSecond: 0,
      averageProcessingTime: 0,
      successRate: 0,
      errorRate: 0,
      queueSize: 0,
      activeHandlers: 0,
      uptime: 0,
    };
  }

  // Start the event system
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.startTime = Date.now();

    // Process events continuously
    this.processInterval = setInterval(() => {
      this.processEvents();
      this.updateStats();
    }, 10); // 10ms interval for high-performance processing

    this.emit("system.startup", {
      timestamp: new Date(),
      handlers: this.getTotalHandlerCount(),
    });
  }

  // Stop the event system
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;

    if (this.processInterval) {
      clearInterval(this.processInterval);
      this.processInterval = null;
    }

    this.emit("system.shutdown", {
      uptime: Date.now() - this.startTime,
      totalEvents: this.stats.totalEvents,
    });
  }

  // Register event handler
  on(
    eventType: EventType,
    handler: Function,
    options: Partial<EventHandler> = {},
  ): string {
    const eventHandler: EventHandler = {
      id: options.id || crypto.randomUUID(),
      eventType,
      priority: options.priority || "normal",
      handler,
      enabled: options.enabled ?? true,
      retries: options.retries || 3,
      timeout: options.timeout || 5000,
      filter: options.filter,
    };

    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }

    this.handlers.get(eventType)!.push(eventHandler);
    return eventHandler.id;
  }

  // Register global handler (receives all events)
  onAll(handler: Function, options: Partial<EventHandler> = {}): string {
    const eventHandler: EventHandler = {
      id: options.id || crypto.randomUUID(),
      eventType: "system.startup", // Placeholder, not used for global handlers
      priority: options.priority || "normal",
      handler,
      enabled: options.enabled ?? true,
      retries: options.retries || 3,
      timeout: options.timeout || 5000,
      filter: options.filter,
    };

    this.globalHandlers.push(eventHandler);
    return eventHandler.id;
  }

  // Remove event handler
  off(handlerId: string): boolean {
    // Check specific event handlers
    for (const [eventType, handlers] of this.handlers.entries()) {
      const index = handlers.findIndex((h) => h.id === handlerId);
      if (index !== -1) {
        handlers.splice(index, 1);
        if (handlers.length === 0) {
          this.handlers.delete(eventType);
        }
        return true;
      }
    }

    // Check global handlers
    const globalIndex = this.globalHandlers.findIndex(
      (h) => h.id === handlerId,
    );
    if (globalIndex !== -1) {
      this.globalHandlers.splice(globalIndex, 1);
      return true;
    }

    return false;
  }

  // Emit event
  emit(
    type: EventType,
    data?: unknown,
    options: Partial<BaseEvent> = {},
  ): string {
    const event: BaseEvent = {
      id: crypto.randomUUID(),
      type,
      priority: options.priority || "normal",
      timestamp: new Date(),
      source: options.source || "system",
      data,
      metadata: options.metadata,
      correlationId: options.correlationId,
      userId: options.userId,
      sessionId: options.sessionId,
    };

    this.eventQueue.enqueue(event);
    return event.id;
  }

  // Process events from queue
  private async processEvents(): Promise<void> {
    if (!this.isRunning) return;

    const batchSize = 50; // Process up to 50 events per batch
    const processed: Promise<EventResult[]>[] = [];

    for (let i = 0; i < batchSize; i++) {
      const event = this.eventQueue.dequeue();
      if (!event) break;

      processed.push(this.processEvent(event));
    }

    if (processed.length > 0) {
      await Promise.allSettled(processed);
    }
  }

  // Process single event
  private async processEvent(event: BaseEvent): Promise<EventResult[]> {
    const results: EventResult[] = [];


    // Get handlers for this event type
    const eventHandlers = this.handlers.get(event.type) || [];
    const allHandlers = [...eventHandlers, ...this.globalHandlers];

    // Filter enabled handlers
    const activeHandlers = allHandlers.filter(
      (h) => h.enabled && (!h.filter || h.filter(event)),
    );

    // Execute handlers
    for (const handler of activeHandlers) {
      const result = await this.executeHandler(event, handler);
      results.push(result);
    }

    this.stats.totalEvents++;
    return results;
  }

  // Execute individual handler with retry logic
  private async executeHandler(
    event: BaseEvent,
    handler: EventHandler,
  ): Promise<EventResult> {
    const startTime = Date.now();

    for (let attempt = 1; attempt <= handler.retries; attempt++) {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Handler timeout")),
            handler.timeout,
          ),
        );

        const handlerPromise = Promise.resolve(handler.handler(event));
        const result = await Promise.race([handlerPromise, timeoutPromise]);

        return {
          eventId: event.id,
          handlerId: handler.id,
          success: true,
          processingTime: Date.now() - startTime,
          result,
          timestamp: new Date(),
        };
      } catch (error) {
        if (attempt === handler.retries) {
          return {
            eventId: event.id,
            handlerId: handler.id,
            success: false,
            processingTime: Date.now() - startTime,
            error: error instanceof Error ? error._message : String(error),
            timestamp: new Date(),
          };
        }

        // Exponential backoff for retries
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 100),
        );
      }
    }

    throw new Error("Should not reach here");
  }

  // Update system statistics
  private updateStats(): void {
    const now = Date.now();
    const uptime = now - this.startTime;

    this.stats = {
      ...this.stats,
      eventsPerSecond: this.stats.totalEvents / (uptime / 1000),
      queueSize: this.eventQueue.size(),
      activeHandlers: this.getTotalHandlerCount(),
      uptime: uptime,
    };
  }

  // Get system statistics
  getStats(): EventSystemStats {
    return { ...this.stats };
  }

  // Get total handler count
  private getTotalHandlerCount(): number {
    let count = this.globalHandlers.length;
    for (const handlers of this.handlers.values()) {
      count += handlers.length;
    }
    return count;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const __testEventId = this.emit("system.health_check", {
        timestamp: Date.now(),
      });

      // Wait a bit for processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      return this.isRunning && this.eventQueue.size() < 1000; // Healthy if queue isn't overloaded
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const eventSystem = new InternetFriendsEventSystem();

// Convenience functions
export const emit = (
  type: EventType,
  data?: unknown,
  options?: Partial<BaseEvent>,
) => eventSystem.emit(type, data, options);

export const on = (
  eventType: EventType,
  handler: Function,
  options?: Partial<EventHandler>,
) => eventSystem.on(eventType, handler, options);

export const off = (handlerId: string) => eventSystem.off(handlerId);

// Specialized event emitters for common use cases
export const __ComputeEvents = {
  _jobStarted: (jobId: string, data?: unknown) =>
    emit("compute.job_started", { jobId, ...data }, { correlationId: jobId }),

  _jobCompleted: (jobId: string, result?: unknown, processingTime?: number) =>
    emit(
      "compute.job_completed",
      { jobId, result, processingTime },
      { correlationId: jobId },
    ),

  _jobFailed: (jobId: string, error: string, data?: unknown) =>
    emit(
      "compute.job_failed",
      { jobId, error, ...data },
      { correlationId: jobId, priority: "high" },
    ),

  _resourceAllocated: (resourceId: string, type: string, amount: number) =>
    emit("compute.resource_allocated", { resourceId, type, amount }),

  _resourceReleased: (resourceId: string, type: string, amount: number) =>
    emit("compute.resource_released", { resourceId, type, amount }),
};

export const __UIEvents = {
  _pageLoad: (page: string, loadTime: number, userId?: string) =>
    emit("ui.page_load", { page, loadTime }, { userId }),

  _componentRender: (component: string, renderTime: number, props?: unknown) =>
    emit("ui.component_render", { component, renderTime, props }),

  interaction: (
    type: string,
    target: string,
    userId?: string,
    sessionId?: string,
  ) => emit("ui.interaction", { type, target }, { userId, sessionId }),

  _themeChange: (from: string, to: string, userId?: string) =>
    emit("ui.theme_change", { from, to }, { userId }),
};

export const _APIEvents = {
  _requestStart: (method: string, url: string, requestId: string) =>
    emit(
      "api.request_start",
      { method, url, requestId },
      { correlationId: requestId },
    ),

  _requestComplete: (
    method: string,
    url: string,
    status: number,
    responseTime: number,
    requestId: string,
  ) =>
    emit(
      "api.request_complete",
      { method, url, status, responseTime },
      { correlationId: requestId },
    ),

  _requestError: (
    method: string,
    url: string,
    error: string,
    status: number,
    requestId: string,
  ) =>
    emit(
      "api.request_error",
      { method, url, error, status },
      { correlationId: requestId, priority: "high" },
    ),

  _rateLimit: (
    ip: string,
    endpoint: string,
    limit: number,
    remaining: number,
  ) =>
    emit(
      "api.rate_limit",
      { ip, endpoint, limit, remaining },
      { priority: "high" },
    ),
};

// Initialize event system when module loads
if (typeof window === "undefined") {
  // Server-side initialization
  eventSystem.start();

  // Graceful shutdown
  process.on("SIGINT", () => eventSystem.stop());
  process.on("SIGTERM", () => eventSystem.stop());
}

// Export for debugging and testing
export { eventSystem as debugEventSystem };
