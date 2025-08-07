#!/usr/bin/env bun
// InternetFriends Performance Monitoring Script
// Comprehensive real-time performance monitoring with detailed analytics

import { performance, PerformanceObserver } from "perf_hooks";
import { createWriteStream } from "fs";
import { join } from "path";

interface PerformanceMetric {
  timestamp: number;
  type:
    | "navigation"
    | "resource"
    | "measure"
    | "paint"
    | "layout-shift"
    | "largest-contentful-paint";
  name: string;
  duration?: number;
  startTime?: number;
  size?: number;
  url?: string;
  value?: number;
  rating?: "good" | "needs-improvement" | "poor";
}

interface PerformanceReport {
  sessionId: string;
  startTime: number;
  duration: number;
  metrics: PerformanceMetric[];
  summary: {
    totalRequests: number;
    averageResponseTime: number;
    slowestRequest: PerformanceMetric | null;
    fastestRequest: PerformanceMetric | null;
    errorCount: number;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
  };
  recommendations: string[];
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private sessionId: string;
  private startTime: number;
  private logStream?: NodeJS.WritableStream;
  private verbose: boolean;
  private thresholds: {
    slowRequest: number;
    highMemoryUsage: number;
    highCpuUsage: number;
  };

  constructor(verbose: boolean = false) {
    this.sessionId = `perf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.startTime = Date.now();
    this.verbose = verbose;
    this.thresholds = {
      slowRequest: 1000, // 1 second
      highMemoryUsage: 100 * 1024 * 1024, // 100MB
      highCpuUsage: 80, // 80% CPU usage
    };

    this.initializeLogging();
    this.setupObservers();
    this.startMemoryMonitoring();
  }

  // Initialize logging
  private initializeLogging(): void {
    const logDir = "./logs";
    const logFile = join(logDir, `performance-${this.sessionId}.log`);

    try {
      this.logStream = createWriteStream(logFile, { flags: "a" });
      this.log("Performance monitoring started", "info");
    } catch (error) {
      console.warn("Could not initialize log file, logging to console only");
    }
  }

  // Setup performance observers
  private setupObservers(): void {
    // Resource timing observer
    const resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const resourceEntry = entry as PerformanceResourceTiming;
        this.recordMetric({
          timestamp: Date.now(),
          type: "resource",
          name: resourceEntry.name,
          duration: resourceEntry.duration,
          startTime: resourceEntry.startTime,
          size: resourceEntry.transferSize,
          url: resourceEntry.name,
        });
      });
    });

    // Measure observer
    const measureObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        this.recordMetric({
          timestamp: Date.now(),
          type: "measure",
          name: entry.name,
          duration: entry.duration,
          startTime: entry.startTime,
        });
      });
    });

    try {
      resourceObserver.observe({ entryTypes: ["resource"] });
      measureObserver.observe({ entryTypes: ["measure"] });

      // Record navigation timing manually since "navigation" entryType is not supported in Node.js
      this.recordNavigationTiming();
    } catch (error) {
      this.log(`Failed to setup performance observers: ${error}`, "error");
    }
  }

  // Record navigation timing manually
  private recordNavigationTiming(): void {
    try {
      // For Node.js environment, we'll record a synthetic navigation metric
      this.recordMetric({
        timestamp: Date.now(),
        type: "navigation",
        name: "page-load",
        duration: 0,
        startTime: Date.now(),
      });
    } catch (error) {
      this.log(`Failed to record navigation timing: ${error}`, "error");
    }
  }

  // Start memory monitoring
  private startMemoryMonitoring(): void {
    setInterval(() => {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      // Log memory warnings
      if (memUsage.heapUsed > this.thresholds.highMemoryUsage) {
        this.log(
          `High memory usage detected: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
          "warning",
        );
      }

      // Record memory metrics
      this.recordMetric({
        timestamp: Date.now(),
        type: "measure",
        name: "memory-usage",
        value: memUsage.heapUsed,
      });

      this.recordMetric({
        timestamp: Date.now(),
        type: "measure",
        name: "cpu-usage",
        value: cpuUsage.user + cpuUsage.system,
      });
    }, 5000); // Every 5 seconds
  }

  // Record a performance metric
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    if (this.verbose) {
      this.log(
        `${metric.type}: ${metric.name} - ${metric.duration || metric.value}`,
        "metric",
      );
    }

    // Check for performance issues
    this.checkPerformanceThresholds(metric);
  }

  // Check performance thresholds and alert
  private checkPerformanceThresholds(metric: PerformanceMetric): void {
    if (metric.duration && metric.duration > this.thresholds.slowRequest) {
      this.log(
        `Slow request detected: ${metric.name} took ${metric.duration}ms`,
        "warning",
      );
    }

    // Rate performance
    if (metric.duration) {
      metric.rating = this.ratePerformance(metric.duration, metric.type);
    }
  }

  // Rate performance based on Web Vitals standards
  private ratePerformance(
    duration: number,
    type: string,
  ): "good" | "needs-improvement" | "poor" {
    const thresholds = {
      navigation: { good: 2500, poor: 4000 },
      resource: { good: 1000, poor: 2000 },
      measure: { good: 100, poor: 300 },
      paint: { good: 1800, poor: 3000 },
      "largest-contentful-paint": { good: 2500, poor: 4000 },
      "layout-shift": { good: 0.1, poor: 0.25 },
    };

    const threshold =
      thresholds[type as keyof typeof thresholds] || thresholds.measure;

    if (duration <= threshold.good) return "good";
    if (duration <= threshold.poor) return "needs-improvement";
    return "poor";
  }

  // Measure custom operation
  measureOperation<T>(name: string, operation: () => T): T {
    const startMark = `${name}-start`;
    const endMark = `${name}-end`;
    const measureName = `${name}-duration`;

    performance.mark(startMark);
    const result = operation();
    performance.mark(endMark);
    performance.measure(measureName, startMark, endMark);

    return result;
  }

  // Measure async operation
  async measureAsyncOperation<T>(
    name: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    const startMark = `${name}-start`;
    const endMark = `${name}-end`;
    const measureName = `${name}-duration`;

    performance.mark(startMark);
    try {
      const result = await operation();
      performance.mark(endMark);
      performance.measure(measureName, startMark, endMark);
      return result;
    } catch (error) {
      performance.mark(endMark);
      performance.measure(measureName, startMark, endMark);
      throw error;
    }
  }

  // Generate performance report
  generateReport(): PerformanceReport {
    const endTime = Date.now();
    const duration = endTime - this.startTime;

    // Calculate summary statistics
    const resourceMetrics = this.metrics.filter(
      (m) => m.type === "resource" && m.duration,
    );
    const totalRequests = resourceMetrics.length;
    const averageResponseTime =
      totalRequests > 0
        ? resourceMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) /
          totalRequests
        : 0;

    const slowestRequest = resourceMetrics.reduce(
      (slowest, current) => {
        if (!slowest || (current.duration || 0) > (slowest.duration || 0)) {
          return current;
        }
        return slowest;
      },
      null as PerformanceMetric | null,
    );

    const fastestRequest = resourceMetrics.reduce(
      (fastest, current) => {
        if (!fastest || (current.duration || 0) < (fastest.duration || 0)) {
          return current;
        }
        return fastest;
      },
      null as PerformanceMetric | null,
    );

    const errorCount = this.metrics.filter(
      (m) => m.name.includes("error") || m.rating === "poor",
    ).length;

    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    // Generate recommendations
    const recommendations = this.generateRecommendations();

    const report: PerformanceReport = {
      sessionId: this.sessionId,
      startTime: this.startTime,
      duration,
      metrics: this.metrics,
      summary: {
        totalRequests,
        averageResponseTime,
        slowestRequest,
        fastestRequest,
        errorCount,
        memoryUsage,
        cpuUsage,
      },
      recommendations,
    };

    return report;
  }

  // Generate performance recommendations
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const report = this.generateBasicStats();

    // Memory recommendations
    if (report.averageMemory > this.thresholds.highMemoryUsage) {
      recommendations.push(
        "Consider optimizing memory usage - average memory consumption is high",
      );
    }

    // Response time recommendations
    if (report.averageResponseTime > 1000) {
      recommendations.push(
        "Average response time is over 1 second - consider caching or optimization",
      );
    }

    // Error rate recommendations
    if (report.errorRate > 0.05) {
      // 5% error rate
      recommendations.push(
        "Error rate is above 5% - investigate and fix failing requests",
      );
    }

    // Slow requests recommendations
    const slowRequests = this.metrics.filter(
      (m) => m.duration && m.duration > 2000,
    ).length;
    if (slowRequests > 0) {
      recommendations.push(
        `${slowRequests} requests took over 2 seconds - optimize slow endpoints`,
      );
    }

    // Resource size recommendations
    const largeResources = this.metrics.filter(
      (m) => m.size && m.size > 1024 * 1024,
    ).length;
    if (largeResources > 0) {
      recommendations.push(
        `${largeResources} resources are over 1MB - consider compression or optimization`,
      );
    }

    return recommendations;
  }

  // Generate basic statistics
  private generateBasicStats() {
    const resourceMetrics = this.metrics.filter(
      (m) => m.type === "resource" && m.duration,
    );
    const memoryMetrics = this.metrics.filter((m) => m.name === "memory-usage");

    return {
      averageResponseTime:
        resourceMetrics.length > 0
          ? resourceMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) /
            resourceMetrics.length
          : 0,
      averageMemory:
        memoryMetrics.length > 0
          ? memoryMetrics.reduce((sum, m) => sum + (m.value || 0), 0) /
            memoryMetrics.length
          : 0,
      errorRate:
        this.metrics.filter((m) => m.rating === "poor").length /
        Math.max(this.metrics.length, 1),
    };
  }

  // Log message
  private log(
    message: string,
    level: "info" | "warning" | "error" | "metric" = "info",
  ): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (this.verbose || level === "error" || level === "warning") {
      const coloredMessage = this.colorizeLogLevel(logMessage, level);
      console.log(coloredMessage);
    }

    if (this.logStream) {
      this.logStream.write(logMessage + "\n");
    }
  }

  // Colorize log levels for console output
  private colorizeLogLevel(message: string, level: string): string {
    const colors = {
      info: "\x1b[36m", // Cyan
      warning: "\x1b[33m", // Yellow
      error: "\x1b[31m", // Red
      metric: "\x1b[32m", // Green
    };
    const reset = "\x1b[0m";
    const color = colors[level as keyof typeof colors] || colors.info;
    return `${color}${message}${reset}`;
  }

  // Print real-time dashboard
  printDashboard(): void {
    const report = this.generateReport();
    const stats = this.generateBasicStats();

    console.clear();
    console.log("🔍 InternetFriends Performance Monitor Dashboard");
    console.log("=".repeat(60));
    console.log("");

    // Session info
    console.log(`📊 Session: ${this.sessionId}`);
    console.log(`⏱️  Running for: ${Math.round(report.duration / 1000)}s`);
    console.log("");

    // Key metrics
    console.log("🚀 Key Metrics:");
    console.log(`   Requests: ${report.summary.totalRequests}`);
    console.log(
      `   Avg Response Time: ${Math.round(report.summary.averageResponseTime)}ms`,
    );
    console.log(`   Error Count: ${report.summary.errorCount}`);
    console.log(
      `   Memory Usage: ${Math.round(report.summary.memoryUsage.heapUsed / 1024 / 1024)}MB`,
    );
    console.log("");

    // Performance ratings
    const goodMetrics = this.metrics.filter((m) => m.rating === "good").length;
    const needsImprovementMetrics = this.metrics.filter(
      (m) => m.rating === "needs-improvement",
    ).length;
    const poorMetrics = this.metrics.filter((m) => m.rating === "poor").length;

    console.log("📈 Performance Ratings:");
    console.log(`   🟢 Good: ${goodMetrics}`);
    console.log(`   🟡 Needs Improvement: ${needsImprovementMetrics}`);
    console.log(`   🔴 Poor: ${poorMetrics}`);
    console.log("");

    // Recent metrics (last 5)
    const recentMetrics = this.metrics.slice(-5);
    if (recentMetrics.length > 0) {
      console.log("📝 Recent Activity:");
      recentMetrics.forEach((metric) => {
        const ratingIcon =
          metric.rating === "good"
            ? "🟢"
            : metric.rating === "needs-improvement"
              ? "🟡"
              : "🔴";
        const duration = metric.duration
          ? `${Math.round(metric.duration)}ms`
          : metric.value
            ? `${Math.round(metric.value)}`
            : "N/A";
        console.log(`   ${ratingIcon} ${metric.name}: ${duration}`);
      });
      console.log("");
    }

    // Recommendations
    if (report.recommendations.length > 0) {
      console.log("💡 Recommendations:");
      report.recommendations.slice(0, 3).forEach((rec) => {
        console.log(`   • ${rec}`);
      });
      console.log("");
    }

    console.log("Press Ctrl+C to stop monitoring and generate final report");
  }

  // Start real-time monitoring
  startRealtimeMonitoring(): void {
    this.log("Starting real-time performance monitoring...", "info");

    // Print dashboard every 5 seconds
    const dashboardInterval = setInterval(() => {
      if (this.verbose) {
        this.printDashboard();
      }
    }, 5000);

    // Print initial dashboard
    if (this.verbose) {
      setTimeout(() => this.printDashboard(), 1000);
    }

    // Handle graceful shutdown
    process.on("SIGINT", () => {
      clearInterval(dashboardInterval);
      this.stopMonitoring();
    });

    process.on("SIGTERM", () => {
      clearInterval(dashboardInterval);
      this.stopMonitoring();
    });
  }

  // Stop monitoring and generate final report
  stopMonitoring(): void {
    this.log("Stopping performance monitoring...", "info");

    const finalReport = this.generateReport();

    // Save report to file
    const reportFile = `./logs/performance-report-${this.sessionId}.json`;
    try {
      Bun.write(reportFile, JSON.stringify(finalReport, null, 2));
      this.log(`Performance report saved to: ${reportFile}`, "info");
    } catch (error) {
      this.log(`Failed to save report: ${error}`, "error");
    }

    // Print summary
    console.log("\n🏁 Performance Monitoring Summary");
    console.log("=".repeat(50));
    console.log(
      `Session Duration: ${Math.round(finalReport.duration / 1000)}s`,
    );
    console.log(`Total Metrics Collected: ${finalReport.metrics.length}`);
    console.log(
      `Average Response Time: ${Math.round(finalReport.summary.averageResponseTime)}ms`,
    );
    console.log(
      `Error Rate: ${((finalReport.summary.errorCount / Math.max(finalReport.metrics.length, 1)) * 100).toFixed(2)}%`,
    );
    console.log("");

    if (finalReport.recommendations.length > 0) {
      console.log("📋 Final Recommendations:");
      finalReport.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }

    // Close log stream
    if (this.logStream) {
      this.logStream.end();
    }

    process.exit(0);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes("--verbose") || args.includes("-v");
  const duration = parseInt(
    args.find((arg) => arg.startsWith("--duration="))?.split("=")[1] || "0",
  );
  const dashboard = args.includes("--dashboard") || args.includes("-d");

  console.log("🔍 InternetFriends Performance Monitor");
  console.log("=".repeat(50));
  console.log("");

  const monitor = new PerformanceMonitor(verbose || dashboard);

  // Start monitoring
  monitor.startRealtimeMonitoring();

  // Example measurements for demonstration
  if (args.includes("--demo")) {
    console.log("🎯 Running demo measurements...");

    // Simulate some operations
    setTimeout(() => {
      monitor.measureOperation("database-query", () => {
        // Simulate database query
        const start = Date.now();
        while (Date.now() - start < Math.random() * 100) {}
        return "query-result";
      });
    }, 2000);

    setTimeout(async () => {
      await monitor.measureAsyncOperation("api-call", async () => {
        // Simulate API call
        await new Promise((resolve) =>
          setTimeout(resolve, Math.random() * 500),
        );
        return "api-response";
      });
    }, 4000);

    setTimeout(() => {
      monitor.measureOperation("file-processing", () => {
        // Simulate file processing
        const start = Date.now();
        while (Date.now() - start < Math.random() * 200) {}
        return "processed";
      });
    }, 6000);
  }

  // Auto-stop after duration if specified
  if (duration > 0) {
    setTimeout(() => {
      monitor.stopMonitoring();
    }, duration * 1000);
  }
}

// Run if called directly
if (import.meta.main) {
  main().catch((error) => {
    console.error("❌ Performance monitor failed:", error);
    process.exit(1);
  });
}

export { PerformanceMonitor, type PerformanceMetric, type PerformanceReport };
