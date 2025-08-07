#!/usr/bin/env bun
// InternetFriends Integration Demonstration Script
// Showcases the power of curl testing + event-driven compute system

import { z } from "zod";
import { CurlTestRunner, InternetFriendsTestSuites } from "../tests/curl/curl.test.runner";
import {
  ComputeEventManager,
  ComputeOperations,
  computeManager
} from "../lib/events/compute.events";
import {
  eventSystem,
  emit,
  on,
  off,
  EventType,
  UIEvents,
  APIEvents,
  ComputeEvents
} from "../lib/events/event.system";

// Demo Configuration
const DEMO_CONFIG = {
  baseUrl: process.env.DEMO_BASE_URL || "http://localhost:3000",
  verbose: true,
  duration: 30000, // 30 seconds demo
  phases: ["setup", "curl_testing", "event_processing", "compute_jobs", "integration", "teardown"],
};

// Demo Statistics Collector
class DemoStatsCollector {
  private stats = {
    httpRequests: 0,
    eventsEmitted: 0,
    computeJobs: 0,
    totalDuration: 0,
    successfulOperations: 0,
    errors: 0,
  };

  increment(metric: keyof typeof this.stats, value: number = 1) {
    this.stats[metric] += value;
  }

  getStats() {
    return { ...this.stats };
  }

  generateReport(): string {
    const { httpRequests, eventsEmitted, computeJobs, totalDuration, successfulOperations, errors } = this.stats;
    const successRate = ((successfulOperations / (successfulOperations + errors)) * 100).toFixed(2);

    return `
# InternetFriends Integration Demo Report

## Summary
- **Duration:** ${(totalDuration / 1000).toFixed(2)}s
- **HTTP Requests:** ${httpRequests}
- **Events Emitted:** ${eventsEmitted}
- **Compute Jobs:** ${computeJobs}
- **Success Rate:** ${successRate}%
- **Operations:** ${successfulOperations} successful, ${errors} errors

## Performance Metrics
- **Requests per second:** ${(httpRequests / (totalDuration / 1000)).toFixed(2)}
- **Events per second:** ${(eventsEmitted / (totalDuration / 1000)).toFixed(2)}
- **Jobs per second:** ${(computeJobs / (totalDuration / 1000)).toFixed(2)}

## Integration Health: ${successRate > 90 ? '🟢 Excellent' : successRate > 70 ? '🟡 Good' : '🔴 Needs Attention'}
`;
  }
}

// Event Monitor for Demo
class DemoEventMonitor {
  private eventLog: Array<{ type: EventType; timestamp: number; data: any }> = [];
  private handlerIds: string[] = [];

  start() {
    console.log("📡 Starting event monitoring...");

    // Monitor all events
    const globalHandlerId = eventSystem.onAll((event: any) => {
      this.eventLog.push({
        type: event.type,
        timestamp: Date.now(),
        data: event.data,
      });
    });

    this.handlerIds.push(globalHandlerId);

    // Monitor specific compute events
    const computeHandlerId = eventSystem.on("compute.job_completed", (event) => {
      console.log(`  ✅ Job ${event.data.jobId} completed in ${event.data.processingTime}ms`);
    });

    this.handlerIds.push(computeHandlerId);

    // Monitor API events
    const apiHandlerId = eventSystem.on("api.request_complete", (event) => {
      console.log(`  🌐 ${event.data.method} ${event.data.url} → ${event.data.status} (${event.data.responseTime}ms)`);
    });

    this.handlerIds.push(apiHandlerId);
  }

  stop() {
    this.handlerIds.forEach(id => eventSystem.off(id));
    this.handlerIds = [];
    console.log("📡 Event monitoring stopped");
  }

  getEventCount(): number {
    return this.eventLog.length;
  }

  getRecentEvents(count: number = 10): Array<{ type: EventType; timestamp: number; data: any }> {
    return this.eventLog.slice(-count);
  }
}

// Main Demo Class
class InternetFriendsIntegrationDemo {
  private curlRunner: CurlTestRunner;
  private statsCollector: DemoStatsCollector;
  private eventMonitor: DemoEventMonitor;
  private startTime: number = 0;

  constructor() {
    this.curlRunner = new CurlTestRunner(DEMO_CONFIG.baseUrl, DEMO_CONFIG.verbose);
    this.statsCollector = new DemoStatsCollector();
    this.eventMonitor = new DemoEventMonitor();
  }

  async runDemo(): Promise<void> {
    this.startTime = Date.now();

    console.log("🚀 InternetFriends Integration Demo Starting...");
    console.log("=" .repeat(60));

    try {
      for (const phase of DEMO_CONFIG.phases) {
        await this.runPhase(phase);
        await this.sleep(1000); // Pause between phases
      }
    } catch (error) {
      console.error("❌ Demo failed:", error);
      this.statsCollector.increment("errors");
    } finally {
      await this.generateFinalReport();
    }
  }

  private async runPhase(phase: string): Promise<void> {
    console.log(`\n🔄 Phase: ${phase.toUpperCase()}`);
    console.log("-" .repeat(40));

    switch (phase) {
      case "setup":
        await this.setupPhase();
        break;
      case "curl_testing":
        await this.curlTestingPhase();
        break;
      case "event_processing":
        await this.eventProcessingPhase();
        break;
      case "compute_jobs":
        await this.computeJobsPhase();
        break;
      case "integration":
        await this.integrationPhase();
        break;
      case "teardown":
        await this.teardownPhase();
        break;
    }
  }

  private async setupPhase(): Promise<void> {
    console.log("🛠️  Setting up systems...");

    // Start event system
    eventSystem.start();
    console.log("  ✅ Event system started");

    // Start compute manager
    computeManager.start();
    console.log("  ✅ Compute manager started");

    // Start event monitoring
    this.eventMonitor.start();
    console.log("  ✅ Event monitoring active");

    // Register demo job handlers
    computeManager.registerJobHandler("demo.http_test", async (job) => {
      await this.sleep(Math.random() * 500 + 100); // 100-600ms processing time
      return {
        url: job.payload.url,
        result: "processed",
        timestamp: Date.now(),
      };
    });

    computeManager.registerJobHandler("demo.data_processing", async (job) => {
      const items = job.payload.items || 100;
      await this.sleep(items * 2); // 2ms per item
      return {
        itemsProcessed: items,
        processingRate: items / 0.002, // items per second
      };
    });

    console.log("  ✅ Demo job handlers registered");
    this.statsCollector.increment("successfulOperations");
  }

  private async curlTestingPhase(): Promise<void> {
    console.log("🌐 Running curl-based HTTP tests...");

    try {
      // Run health check tests
      const healthResults = await this.curlRunner.runTests(InternetFriendsTestSuites.healthCheck);

      for (const result of healthResults) {
        if (result.success) {
          this.statsCollector.increment("successfulOperations");

          // Emit API events based on curl results
          APIEvents.requestComplete(
            "GET",
            result.curlCommand.split('"').slice(-1)[0] || "/",
            result.status || 200,
            result.responseTime,
            crypto.randomUUID()
          );
        } else {
          this.statsCollector.increment("errors");
        }
        this.statsCollector.increment("httpRequests");
      }

      console.log(`  ✅ Completed ${healthResults.length} HTTP tests`);
      console.log(`  📊 Success rate: ${healthResults.filter(r => r.success).length}/${healthResults.length}`);

    } catch (error) {
      console.log("  ❌ Curl testing failed:", error);
      this.statsCollector.increment("errors");
    }
  }

  private async eventProcessingPhase(): Promise<void> {
    console.log("⚡ Testing event system performance...");

    const eventCount = 50;
    const startEvents = this.eventMonitor.getEventCount();

    // Emit various events rapidly
    for (let i = 0; i < eventCount; i++) {
      if (i % 10 === 0) {
        UIEvents.interaction("click", `button-${i}`, `user-${i}`, `session-${i}`);
      } else if (i % 7 === 0) {
        ComputeEvents.jobStarted(`job-${i}`, { type: "test" });
        await this.sleep(10);
        ComputeEvents.jobCompleted(`job-${i}`, { result: "success" }, Math.random() * 100);
      } else {
        emit("system.health_check", { iteration: i });
      }

      this.statsCollector.increment("eventsEmitted");
    }

    // Wait for event processing
    await this.sleep(500);

    const endEvents = this.eventMonitor.getEventCount();
    const processedEvents = endEvents - startEvents;

    console.log(`  ✅ Emitted ${eventCount} events`);
    console.log(`  📊 Processed ${processedEvents} total events`);
    console.log(`  ⚡ Event processing ratio: ${(processedEvents / eventCount).toFixed(2)}x`);

    this.statsCollector.increment("successfulOperations");
  }

  private async computeJobsPhase(): Promise<void> {
    console.log("🧠 Testing compute job management...");

    const jobPromises: Promise<string>[] = [];

    // Submit HTTP test jobs
    for (let i = 0; i < 5; i++) {
      const jobPromise = computeManager.submitJob("demo.http_test", {
        url: `http://localhost:3000/test-${i}`,
        method: "GET",
      }, {
        priority: i % 2 === 0 ? "high" : "normal",
        correlationId: `http-test-${i}`,
      });

      jobPromises.push(jobPromise);
      this.statsCollector.increment("computeJobs");
    }

    // Submit data processing jobs
    for (let i = 0; i < 3; i++) {
      const jobPromise = computeManager.submitJob("demo.data_processing", {
        items: (i + 1) * 50,
        operation: "transform",
      }, {
        priority: "normal",
        correlationId: `data-proc-${i}`,
      });

      jobPromises.push(jobPromise);
      this.statsCollector.increment("computeJobs");
    }

    // Wait for all jobs to be submitted
    const jobIds = await Promise.all(jobPromises);
    console.log(`  ✅ Submitted ${jobIds.length} compute jobs`);

    // Wait for job processing
    await this.sleep(2000);

    // Check compute system status
    const status = computeManager.getStatus();
    console.log(`  📊 Queue: ${status.queueSize}, Running: ${status.runningJobs}`);
    console.log(`  📈 Total jobs processed: ${status.metrics.completedJobs}`);

    this.statsCollector.increment("successfulOperations");
  }

  private async integrationPhase(): Promise<void> {
    console.log("🔗 Testing full system integration...");

    // Simulate user workflow: HTTP request → Event → Compute → Response
    const workflowId = crypto.randomUUID();

    try {
      // 1. User interaction event
      UIEvents.interaction("page-load", "dashboard", "demo-user", workflowId);

      // 2. HTTP request via curl
      const httpResult = await this.curlRunner.runTest({
        name: "Integration Test Request",
        url: "/",
        method: "GET",
        expectedStatus: 200,
      });

      if (httpResult.success) {
        // 3. API event based on HTTP result
        APIEvents.requestComplete("GET", "/", httpResult.status!, httpResult.responseTime, workflowId);

        // 4. Trigger compute job based on request
        const computeJobId = await computeManager.submitJob("demo.data_processing", {
          userId: "demo-user",
          requestId: workflowId,
          items: 200,
        }, {
          priority: "high",
          correlationId: workflowId,
        });

        // 5. Wait for compute completion
        await this.sleep(500);

        // 6. UI update event
        UIEvents.componentRender("dashboard", Date.now() - this.startTime);

        console.log(`  ✅ Completed integration workflow: ${workflowId}`);
        console.log(`  🔗 HTTP (${httpResult.responseTime}ms) → Compute (${computeJobId.slice(0, 8)}...)`);

        this.statsCollector.increment("httpRequests");
        this.statsCollector.increment("computeJobs");
        this.statsCollector.increment("eventsEmitted", 4);
        this.statsCollector.increment("successfulOperations");
      } else {
        throw new Error(`HTTP request failed: ${httpResult.error}`);
      }

    } catch (error) {
      console.log(`  ❌ Integration workflow failed:`, error);
      this.statsCollector.increment("errors");
    }
  }

  private async teardownPhase(): Promise<void> {
    console.log("🧹 Cleaning up systems...");

    // Stop monitoring
    this.eventMonitor.stop();
    console.log("  ✅ Event monitoring stopped");

    // Stop compute manager
    computeManager.stop();
    console.log("  ✅ Compute manager stopped");

    // Stop event system
    eventSystem.stop();
    console.log("  ✅ Event system stopped");

    this.statsCollector.increment("successfulOperations");
  }

  private async generateFinalReport(): Promise<void> {
    const totalDuration = Date.now() - this.startTime;
    this.statsCollector.increment("totalDuration", totalDuration);

    console.log("\n" + "=" .repeat(60));
    console.log("📊 FINAL DEMO REPORT");
    console.log("=" .repeat(60));

    const report = this.statsCollector.generateReport();
    console.log(report);

    // Save report to file
    const reportPath = `./tests/integration/reports/demo-report-${Date.now()}.md`;
    await Bun.write(reportPath, report);
    console.log(`📄 Report saved to: ${reportPath}`);

    // Show recent events
    const recentEvents = this.eventMonitor.getRecentEvents(5);
    if (recentEvents.length > 0) {
      console.log("\n🔍 Recent Events:");
      recentEvents.forEach(event => {
        const timeAgo = Date.now() - event.timestamp;
        console.log(`  • ${event.type} (${timeAgo}ms ago)`);
      });
    }

    console.log("\n✨ Demo completed successfully!");
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Enhanced CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    verbose: args.includes("--verbose") || args.includes("-v"),
    quick: args.includes("--quick") || args.includes("-q"),
    baseUrl: args.find(arg => arg.startsWith("--url="))?.split("=")[1] || DEMO_CONFIG.baseUrl,
  };

  if (options.verbose) {
    console.log("🔧 Demo Configuration:");
    console.log(`  Base URL: ${options.baseUrl}`);
    console.log(`  Verbose: ${options.verbose}`);
    console.log(`  Quick mode: ${options.quick}`);
    console.log("");
  }

  // Adjust demo duration for quick mode
  if (options.quick) {
    DEMO_CONFIG.duration = 10000; // 10 seconds
    DEMO_CONFIG.phases = ["setup", "curl_testing", "event_processing", "teardown"];
  }

  // Update base URL if provided
  if (options.baseUrl !== DEMO_CONFIG.baseUrl) {
    DEMO_CONFIG.baseUrl = options.baseUrl;
  }

  const demo = new InternetFriendsIntegrationDemo();
  await demo.runDemo();
}

// Run demo if called directly
if (import.meta.main) {
  console.log("🎭 InternetFriends Integration Demo");
  console.log("Showcasing curl testing + event-driven compute system");
  console.log("");

  // Check if server is accessible
  try {
    const testResponse = await fetch(DEMO_CONFIG.baseUrl);
    if (!testResponse.ok) {
      throw new Error(`Server responded with ${testResponse.status}`);
    }
    console.log(`✅ Server accessible at ${DEMO_CONFIG.baseUrl}`);
  } catch (error) {
    console.log(`⚠️  Warning: Server may not be running at ${DEMO_CONFIG.baseUrl}`);
    console.log("   Start server with: bun run dev");
    console.log("   Demo will continue but HTTP tests may fail\n");
  }

  await main();
}

export { InternetFriendsIntegrationDemo, DemoStatsCollector, DemoEventMonitor };
