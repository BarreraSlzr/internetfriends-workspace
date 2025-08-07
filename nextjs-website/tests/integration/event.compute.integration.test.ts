#!/usr/bin/env bun
// InternetFriends Event-Driven Compute Integration Tests
// Advanced testing combining curl HTTP testing with event system and compute optimization

import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { z } from "zod";
import { CurlTestRunner, InternetFriendsTestSuites } from "../curl/curl.test.runner";
import {
  ComputeEventManager,
  ComputeOperations,
  computeManager
} from "../../lib/events/compute.events";
import {
  eventSystem,
  emit,
  on,
  EventType,
  UIEvents,
  APIEvents,
  ComputeEvents
} from "../../lib/events/event.system";

// Test Configuration
const TEST_CONFIG = {
  baseUrl: process.env.TEST_BASE_URL || "http://localhost:3000",
  timeout: 30000,
  retries: 3,
  verbose: process.env.TEST_VERBOSE === "true",
};

// Integration Test Suite Schema
const IntegrationTestSuiteSchema = z.object({
  name: z.string(),
  description: z.string(),
  setup: z.function().optional(),
  teardown: z.function().optional(),
  tests: z.array(z.object({
    name: z.string(),
    type: z.enum(["curl", "event", "compute", "hybrid"]),
    config: z.record(z.any()),
    expectations: z.array(z.object({
      type: z.enum(["response", "event", "performance", "resource"]),
      condition: z.function(),
      message: z.string(),
    })),
  })),
});

type IntegrationTestSuite = z.infer<typeof IntegrationTestSuiteSchema>;

// Test Results Collector
class TestResultsCollector {
  private results: Array<{
    suite: string;
    test: string;
    type: string;
    success: boolean;
    duration: number;
    error?: string;
    metrics?: Record<string, any>;
    timestamp: Date;
  }> = [];

  addResult(
    suite: string,
    test: string,
    type: string,
    success: boolean,
    duration: number,
    error?: string,
    metrics?: Record<string, any>
  ) {
    this.results.push({
      suite,
      test,
      type,
      success,
      duration,
      error,
      metrics,
      timestamp: new Date(),
    });
  }

  getResults() {
    return [...this.results];
  }

  getSummary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.success).length;
    const failed = total - passed;
    const avgDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / total;

    return {
      total,
      passed,
      failed,
      successRate: passed / total,
      averageDuration: avgDuration,
      byType: this.results.reduce((acc, r) => {
        acc[r.type] = (acc[r.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  generateReport(): string {
    const summary = this.getSummary();

    let report = "# InternetFriends Integration Test Report\n\n";
    report += `**Generated:** ${new Date().toISOString()}\n`;
    report += `**Total Tests:** ${summary.total}\n`;
    report += `**Passed:** ${summary.passed}\n`;
    report += `**Failed:** ${summary.failed}\n`;
    report += `**Success Rate:** ${(summary.successRate * 100).toFixed(2)}%\n`;
    report += `**Average Duration:** ${summary.averageDuration.toFixed(2)}ms\n\n`;

    report += "## Test Distribution by Type\n\n";
    for (const [type, count] of Object.entries(summary.byType)) {
      report += `- **${type}:** ${count} tests\n`;
    }

    if (summary.failed > 0) {
      report += "\n## Failed Tests\n\n";
      this.results
        .filter(r => !r.success)
        .forEach(result => {
          report += `### ❌ ${result.suite} > ${result.test}\n`;
          report += `- **Type:** ${result.type}\n`;
          report += `- **Duration:** ${result.duration}ms\n`;
          report += `- **Error:** ${result.error}\n`;
          if (result.metrics) {
            report += `- **Metrics:** ${JSON.stringify(result.metrics, null, 2)}\n`;
          }
          report += "\n";
        });
    }

    report += "\n## All Test Results\n\n";
    this.results.forEach(result => {
      const status = result.success ? "✅" : "❌";
      report += `${status} **${result.suite}** > ${result.test} (${result.duration}ms)\n`;
    });

    return report;
  }
}

// Event Tracker for Testing
class EventTracker {
  private events: Array<{
    type: EventType;
    data: any;
    timestamp: Date;
  }> = [];
  private handlerIds: string[] = [];

  startTracking(): void {
    // Track all events
    const handlerId = eventSystem.onAll((event: any) => {
      this.events.push({
        type: event.type,
        data: event.data,
        timestamp: new Date(),
      });
    });

    this.handlerIds.push(handlerId);
  }

  stopTracking(): void {
    this.handlerIds.forEach(id => eventSystem.off(id));
    this.handlerIds = [];
  }

  getEvents(): Array<{ type: EventType; data: any; timestamp: Date }> {
    return [...this.events];
  }

  getEventsByType(type: EventType): Array<{ type: EventType; data: any; timestamp: Date }> {
    return this.events.filter(e => e.type === type);
  }

  clearEvents(): void {
    this.events = [];
  }

  waitForEvent(type: EventType, timeout: number = 5000): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Timeout waiting for event: ${type}`));
      }, timeout);

      const handlerId = eventSystem.on(type, (event: any) => {
        clearTimeout(timeoutId);
        eventSystem.off(handlerId);
        resolve(event);
      });
    });
  }
}

// Performance Monitor for Tests
class PerformanceMonitor {
  private metrics: Record<string, number[]> = {};

  recordMetric(name: string, value: number): void {
    if (!this.metrics[name]) {
      this.metrics[name] = [];
    }
    this.metrics[name].push(value);
  }

  getMetric(name: string): { avg: number; min: number; max: number; count: number } | null {
    const values = this.metrics[name];
    if (!values || values.length === 0) return null;

    return {
      avg: values.reduce((sum, v) => sum + v, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    };
  }

  getAllMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {};

    for (const [name, values] of Object.entries(this.metrics)) {
      result[name] = {
        avg: values.reduce((sum, v) => sum + v, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length,
      };
    }

    return result;
  }

  reset(): void {
    this.metrics = {};
  }
}

// Test Infrastructure
let curlRunner: CurlTestRunner;
let resultsCollector: TestResultsCollector;
let eventTracker: EventTracker;
let performanceMonitor: PerformanceMonitor;

// Setup and teardown
beforeAll(async () => {
  console.log("🚀 Setting up InternetFriends Integration Tests...");

  curlRunner = new CurlTestRunner(TEST_CONFIG.baseUrl, TEST_CONFIG.verbose);
  resultsCollector = new TestResultsCollector();
  eventTracker = new EventTracker();
  performanceMonitor = new PerformanceMonitor();

  // Start event system and compute manager
  eventSystem.start();
  computeManager.start();

  // Start tracking events
  eventTracker.startTracking();

  console.log("✅ Test infrastructure ready");
});

afterAll(async () => {
  console.log("🧹 Cleaning up test environment...");

  eventTracker.stopTracking();
  computeManager.stop();
  eventSystem.stop();

  // Generate and save test report
  const report = resultsCollector.generateReport();
  const reportPath = `./tests/integration/reports/integration-test-report-${Date.now()}.md`;
  await Bun.write(reportPath, report);

  console.log(`📊 Integration test report saved to: ${reportPath}`);
  console.log("✅ Cleanup complete");
});

// Core Integration Tests
describe("InternetFriends Integration Tests", () => {

  describe("HTTP + Event System Integration", () => {
    test("API requests should trigger corresponding events", async () => {
      const startTime = Date.now();
      eventTracker.clearEvents();

      // Make HTTP request via curl
      const result = await curlRunner.runTest({
        name: "Homepage with Event Tracking",
        url: "/",
        method: "GET",
        expectedStatus: 200,
        bodyContains: ["InternetFriends"],
      });

      // Wait for events to be processed
      await new Promise(resolve => setTimeout(resolve, 500));

      const duration = Date.now() - startTime;
      const events = eventTracker.getEvents();

      expect(result.success).toBe(true);
      expect(events.length).toBeGreaterThan(0);

      resultsCollector.addResult(
        "HTTP + Events",
        "API requests trigger events",
        "hybrid",
        result.success && events.length > 0,
        duration,
        result.error,
        { eventsTriggered: events.length, responseTime: result.responseTime }
      );

      performanceMonitor.recordMetric("http_event_integration", duration);
    });

    test("Event-driven API rate limiting", async () => {
      const startTime = Date.now();

      // Emit rate limit events
      APIEvents.rateLimit("127.0.0.1", "/api/test", 100, 95);
      APIEvents.rateLimit("127.0.0.1", "/api/test", 100, 5);

      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 100));

      // Test API call after rate limit warning
      const result = await curlRunner.runTest({
        name: "Rate Limited Request",
        url: "/api/health",
        method: "GET",
        expectedStatus: 200,
      });

      const duration = Date.now() - startTime;
      const rateLimitEvents = eventTracker.getEventsByType("api.rate_limit");

      expect(rateLimitEvents.length).toBe(2);
      expect(result.success).toBe(true);

      resultsCollector.addResult(
        "HTTP + Events",
        "Event-driven rate limiting",
        "hybrid",
        rateLimitEvents.length === 2 && result.success,
        duration,
        result.error,
        { rateLimitEvents: rateLimitEvents.length }
      );
    });
  });

  describe("Compute System Integration", () => {
    test("Job submission and execution via HTTP triggers", async () => {
      const startTime = Date.now();

      // Register a test job handler
      computeManager.registerJobHandler("test.execution", async (job) => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate work
        return {
          testsRun: 10,
          passed: 8,
          failed: 2,
          processingTime: 100
        };
      });

      // Submit job through compute system
      const jobId = await ComputeOperations.runTests("unit-tests", {
        correlationId: "test-integration-001",
      });

      // Wait for job completion
      const jobCompletedEvent = await eventTracker.waitForEvent("compute.job_completed", 10000);

      const duration = Date.now() - startTime;
      const success = jobCompletedEvent && jobCompletedEvent.data.jobId === jobId;

      resultsCollector.addResult(
        "Compute System",
        "Job submission and execution",
        "compute",
        success,
        duration,
        success ? undefined : "Job did not complete successfully",
        { jobId, processingTime: jobCompletedEvent?.data?.processingTime }
      );

      performanceMonitor.recordMetric("compute_job_execution", duration);
    });

    test("Resource monitoring and allocation", async () => {
      const startTime = Date.now();

      // Get system status before job
      const statusBefore = computeManager.getStatus();

      // Submit resource-intensive job
      const jobId = await computeManager.submitJob("data.processing", {
        dataSize: "large",
        operation: "transform",
      }, {
        requiredResources: {
          cpu: 50,
          memory: 1024,
        },
        correlationId: "resource-test-001",
      });

      // Wait for resource allocation event
      const resourceEvent = await eventTracker.waitForEvent("compute.resource_allocated", 5000);

      // Get status after job submission
      const statusAfter = computeManager.getStatus();

      const duration = Date.now() - startTime;
      const success = resourceEvent &&
                     statusAfter.runningJobs > statusBefore.runningJobs &&
                     resourceEvent.data.jobId === jobId;

      resultsCollector.addResult(
        "Compute System",
        "Resource monitoring and allocation",
        "compute",
        success,
        duration,
        success ? undefined : "Resource allocation failed",
        {
          queueSizeBefore: statusBefore.queueSize,
          queueSizeAfter: statusAfter.queueSize,
          runningJobsBefore: statusBefore.runningJobs,
          runningJobsAfter: statusAfter.runningJobs,
        }
      );
    });

    test("High-priority job queue management", async () => {
      const startTime = Date.now();

      // Submit multiple jobs with different priorities
      const normalJob = await computeManager.submitJob("data.processing",
        { type: "normal" },
        { priority: "normal", correlationId: "normal-job" }
      );

      const highPriorityJob = await computeManager.submitJob("data.processing",
        { type: "high-priority" },
        { priority: "high", correlationId: "high-priority-job" }
      );

      const criticalJob = await computeManager.submitJob("data.processing",
        { type: "critical" },
        { priority: "critical", correlationId: "critical-job" }
      );

      // Wait for jobs to be queued
      await new Promise(resolve => setTimeout(resolve, 200));

      const queuedEvents = eventTracker.getEventsByType("compute.job_queued");
      const duration = Date.now() - startTime;

      // Check that we got 3 queued events
      const success = queuedEvents.length >= 3;

      resultsCollector.addResult(
        "Compute System",
        "Priority queue management",
        "compute",
        success,
        duration,
        success ? undefined : `Expected 3 queued events, got ${queuedEvents.length}`,
        {
          normalJob,
          highPriorityJob,
          criticalJob,
          queuedEvents: queuedEvents.length
        }
      );
    });
  });

  describe("End-to-End Workflow Integration", () => {
    test("Complete user workflow: HTTP -> Events -> Compute -> Response", async () => {
      const startTime = Date.now();

      // Simulate user login event
      UIEvents.interaction("login", "login-button", "test-user-123", "session-456");

      // Make HTTP request that should trigger compute job
      const httpResult = await curlRunner.runTest({
        name: "User Dashboard Request",
        url: "/api/user/dashboard",
        method: "GET",
        headers: {
          "Authorization": "Bearer test-token",
          "X-User-ID": "test-user-123",
        },
        expectedStatus: 200,
      });

      // Submit compute job as if triggered by the HTTP request
      const jobId = await ComputeOperations.processData(
        { userId: "test-user-123", action: "load-dashboard" },
        "user-analytics",
        {
          userId: "test-user-123",
          sessionId: "session-456",
          correlationId: "dashboard-load-001"
        }
      );

      // Wait for compute job completion
      const jobCompletedEvent = await eventTracker.waitForEvent("compute.job_completed", 8000);

      // Emit UI event for successful load
      UIEvents.pageLoad("/dashboard", Date.now() - startTime, "test-user-123");

      const duration = Date.now() - startTime;
      const interactionEvents = eventTracker.getEventsByType("ui.interaction");
      const pageLoadEvents = eventTracker.getEventsByType("ui.page_load");

      const success = httpResult.success &&
                     jobCompletedEvent &&
                     interactionEvents.length > 0 &&
                     pageLoadEvents.length > 0;

      resultsCollector.addResult(
        "End-to-End",
        "Complete user workflow",
        "hybrid",
        success,
        duration,
        success ? undefined : "Workflow did not complete successfully",
        {
          httpSuccess: httpResult.success,
          httpResponseTime: httpResult.responseTime,
          jobCompleted: !!jobCompletedEvent,
          interactionEvents: interactionEvents.length,
          pageLoadEvents: pageLoadEvents.length,
        }
      );

      performanceMonitor.recordMetric("e2e_workflow", duration);
    });

    test("Error handling and recovery across systems", async () => {
      const startTime = Date.now();

      // Simulate error conditions

      // 1. Submit a job that will fail
      const failingJobId = await computeManager.submitJob("test.execution",
        { shouldFail: true },
        { correlationId: "failing-job-test" }
      );

      // Register handler that fails
      computeManager.registerJobHandler("test.execution", async (job) => {
        if (job.payload?.shouldFail) {
          throw new Error("Simulated job failure");
        }
        return { success: true };
      });

      // 2. Make HTTP request that should return error
      const httpErrorResult = await curlRunner.runTest({
        name: "Error Endpoint",
        url: "/api/non-existent-endpoint",
        method: "GET",
        expectedStatus: 404,
      });

      // 3. Wait for error events
      const jobFailedEvent = await eventTracker.waitForEvent("compute.job_failed", 5000);

      const duration = Date.now() - startTime;
      const success = httpErrorResult.success &&
                     httpErrorResult.status === 404 &&
                     jobFailedEvent &&
                     jobFailedEvent.data.jobId === failingJobId;

      resultsCollector.addResult(
        "End-to-End",
        "Error handling and recovery",
        "hybrid",
        success,
        duration,
        success ? undefined : "Error handling test failed",
        {
          httpErrorHandled: httpErrorResult.success && httpErrorResult.status === 404,
          jobErrorHandled: !!jobFailedEvent,
        }
      );
    });
  });

  describe("Performance and Load Testing", () => {
    test("Concurrent HTTP requests with event processing", async () => {
      const startTime = Date.now();
      const concurrentRequests = 10;

      // Clear events for clean measurement
      eventTracker.clearEvents();

      // Execute multiple concurrent requests
      const requests = Array.from({ length: concurrentRequests }, (_, i) =>
        curlRunner.runTest({
          name: `Concurrent Request ${i + 1}`,
          url: "/",
          method: "GET",
          expectedStatus: 200,
        })
      );

      const results = await Promise.allSettled(requests);
      const successfulRequests = results.filter(r =>
        r.status === "fulfilled" && r.value.success
      ).length;

      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      const events = eventTracker.getEvents();
      const duration = Date.now() - startTime;

      const success = successfulRequests === concurrentRequests && events.length > 0;

      resultsCollector.addResult(
        "Performance",
        "Concurrent HTTP requests",
        "hybrid",
        success,
        duration,
        success ? undefined : `Only ${successfulRequests}/${concurrentRequests} requests succeeded`,
        {
          concurrentRequests,
          successfulRequests,
          eventsGenerated: events.length,
          avgResponseTime: results
            .filter(r => r.status === "fulfilled")
            .reduce((sum, r) => sum + (r.value as any).responseTime, 0) / successfulRequests,
        }
      );

      performanceMonitor.recordMetric("concurrent_requests", duration);
      performanceMonitor.recordMetric("requests_per_second", concurrentRequests / (duration / 1000));
    });

    test("Compute system throughput under load", async () => {
      const startTime = Date.now();
      const jobCount = 20;

      // Register fast job handler
      computeManager.registerJobHandler("data.processing", async (job) => {
        await new Promise(resolve => setTimeout(resolve, 50)); // 50ms work
        return { processed: job.payload?.items || 100 };
      });

      // Submit multiple jobs simultaneously
      const jobPromises = Array.from({ length: jobCount }, (_, i) =>
        computeManager.submitJob("data.processing",
          { items: 100 + i },
          { correlationId: `load-test-${i}` }
        )
      );

      const jobIds = await Promise.all(jobPromises);

      // Wait for all jobs to complete
      let completedJobs = 0;
      const completedJobIds: string[] = [];

      const completionHandler = eventSystem.on("compute.job_completed", (event) => {
        if (jobIds.includes(event.data.jobId)) {
          completedJobs++;
          completedJobIds.push(event.data.jobId);
        }
      });

      // Wait until all jobs are completed or timeout
      while (completedJobs < jobCount && Date.now() - startTime < 15000) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      eventSystem.off(completionHandler);

      const duration = Date.now() - startTime;
      const success = completedJobs === jobCount;
      const throughput = completedJobs / (duration / 1000); // jobs per second

      resultsCollector.addResult(
        "Performance",
        "Compute system throughput",
        "compute",
        success,
        duration,
        success ? undefined : `Only ${completedJobs}/${jobCount} jobs completed`,
        {
          jobCount,
          completedJobs,
          throughput,
          averageJobTime: duration / completedJobs,
        }
      );

      performanceMonitor.recordMetric("compute_throughput", throughput);
    });
  });
});

// Run tests and generate final report
if (import.meta.main) {
  console.log("🧪 Running InternetFriends Integration Tests...");

  // The tests will run automatically when this file is executed with bun test
  // Final reporting is handled in afterAll
}
