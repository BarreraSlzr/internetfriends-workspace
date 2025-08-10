import { NextRequest, NextResponse } from "next/server";
import { eventSystem, APIEvents } from "../../../lib/events/event.system";

// Type definitions for health check response
type HealthResponse = {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: Record<
    string,
    {
      status: "pass" | "fail" | "warn";
      message: string;
      duration?: number;
      data?: Record<string, any>;
    }
  >;
  metrics: {
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      usage: number;
      loadAverage: number[];
    };
    eventSystem: {
      status: boolean;
      totalEvents: number;
      queueSize: number;
      activeHandlers: number;
    };
  };
  requestId: string;
};

// System start time for uptime calculation
const startTime = Date.now();

// Helper function to get memory usage
function getMemoryUsage() {
  if (typeof process !== "undefined" && process.memoryUsage) {
    const usage = process.memoryUsage();
    const totalMemory = usage.heapTotal + usage.external;
    const usedMemory = usage.heapUsed;

    return {
      used: usedMemory,
      total: totalMemory,
      percentage: (usedMemory / totalMemory) * 100,
    };
  }

  return {
    used: 0,
    total: 0,
    percentage: 0,
  };
}

// Helper function to get CPU usage (simplified)
async function getCpuUsage(): Promise<{
  usage: number;
  loadAverage: number[];
}> {
  if (typeof process !== "undefined" && process.cpuUsage) {
    const usage = process.cpuUsage();
    const total = usage.user + usage.system;

    try {
      const os = await import("os");
      return {
        usage: total / 1000000, // Convert to milliseconds
        loadAverage:
          typeof os.loadavg === "function" ? os.loadavg() : [0, 0, 0],
      };
    } catch {
      return {
        usage: total / 1000000,
        loadAverage: [0, 0, 0],
      };
    }
  }

  return {
    usage: 0,
    loadAverage: [0, 0, 0],
  };
}

// Individual health checks
async function checkDatabase(): Promise<{
  status: "pass" | "fail" | "warn";
  message: string;
  duration: number;
}> {
  const startTime = Date.now();

  try {
    // Simulate database check - replace with actual database ping
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 100));

    const duration = Date.now() - startTime;
    return {
      status: "pass",
      message: "Database connection successful",
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      status: "fail",
      message: `Database connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      duration,
    };
  }
}

async function checkEventSystem(): Promise<{
  status: "pass" | "fail" | "warn";
  message: string;
  data: unknown;
}> {
  try {
    const isHealthy = await eventSystem.healthCheck();
    const stats = eventSystem.getStats();

    if (!isHealthy) {
      return {
        status: "fail",
        message: "Event system is unhealthy",
        data: stats,
      };
    }

    if (stats.queueSize > 1000) {
      return {
        status: "warn",
        message: "Event system queue is getting large",
        data: stats,
      };
    }

    return {
      status: "pass",
      message: "Event system is healthy",
      data: stats,
    };
  } catch (error) {
    return {
      status: "fail",
      message: `Event system check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      data: {},
    };
  }
}

async function checkExternalServices(): Promise<{
  status: "pass" | "fail" | "warn";
  message: string;
  duration: number;
}> {
  const startTime = Date.now();

  try {
    // Simulate external service check
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 200));

    const duration = Date.now() - startTime;

    // Simulate occasional service degradation
    if (Math.random() < 0.1) {
      return {
        status: "warn",
        message: "External services responding slowly",
        duration,
      };
    }

    return {
      status: "pass",
      message: "All external services are responding",
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      status: "fail",
      message: `External services check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      duration,
    };
  }
}

async function checkFileSystem(): Promise<{
  status: "pass" | "fail" | "warn";
  message: string;
}> {
  try {
    // Simulate filesystem check - in production, you might check disk space, write permissions, etc.
    const canWrite = true; // Replace with actual filesystem check

    if (!canWrite) {
      return {
        status: "fail",
        message: "Filesystem is not writable",
      };
    }

    return {
      status: "pass",
      message: "Filesystem is accessible and writable",
    };
  } catch (error) {
    return {
      status: "fail",
      message: `Filesystem check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

// Main health check handler
export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    // Emit API request start event
    APIEvents.requestStart("GET", "/api/health", requestId);

    // Run all health checks in parallel
    const [
      databaseCheck,
      eventSystemCheck,
      externalServicesCheck,
      fileSystemCheck,
    ] = await Promise.allSettled([
      checkDatabase(),
      checkEventSystem(),
      checkExternalServices(),
      checkFileSystem(),
    ]);

    // Process check results
    const checks: Record<string, any> = {
      database:
        databaseCheck.status === "fulfilled"
          ? databaseCheck.value
          : {
              status: "fail",
              message: "Health check failed to run",
              duration: 0,
            },
      eventSystem:
        eventSystemCheck.status === "fulfilled"
          ? eventSystemCheck.value
          : {
              status: "fail",
              message: "Health check failed to run",
              data: {},
            },
      _externalServices:
        externalServicesCheck.status === "fulfilled"
          ? externalServicesCheck.value
          : {
              status: "fail",
              message: "Health check failed to run",
              duration: 0,
            },
      _fileSystem:
        fileSystemCheck.status === "fulfilled"
          ? fileSystemCheck.value
          : {
              status: "fail",
              message: "Health check failed to run",
            },
    };

    // Determine overall system status
    const hasFailures = Object.values(checks).some(
      (check) => check.status === "fail",
    );
    const hasWarnings = Object.values(checks).some(
      (check) => check.status === "warn",
    );

    let overallStatus: "healthy" | "degraded" | "unhealthy";
    if (hasFailures) {
      overallStatus = "unhealthy";
    } else if (hasWarnings) {
      overallStatus = "degraded";
    } else {
      overallStatus = "healthy";
    }

    // Get system metrics
    const memory = getMemoryUsage();
    const cpu = await getCpuUsage();
    const eventStats = eventSystem.getStats();

    // Build response
    const response: HealthResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - startTime,
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      checks,
      metrics: {
        memory,
        cpu,
        eventSystem: {
          status: eventStats.uptime > 0,
          totalEvents: eventStats.totalEvents,
          queueSize: eventStats.queueSize,
          activeHandlers: eventStats.activeHandlers,
        },
      },
      requestId,
    };

    // Determine HTTP status code
    const httpStatus =
      overallStatus === "healthy"
        ? 200
        : overallStatus === "degraded"
          ? 200
          : 503;

    // Emit API request complete event
    const responseTime = Date.now() - startTime;
    APIEvents.requestComplete(
      "GET",
      "/api/health",
      httpStatus,
      responseTime,
      requestId,
    );

    return NextResponse.json(response, {
      status: httpStatus,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "X-Request-ID": requestId,
        "X-Response-Time": `${responseTime}ms`,
      },
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    // Emit API error event
    APIEvents.requestError("GET", "/api/health", errorMessage, 500, requestId);

    const errorResponse = {
      status: "unhealthy" as const,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - startTime,
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      error: errorMessage,
      requestId,
    };

    return NextResponse.json(errorResponse, {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "X-Request-ID": requestId,
        "X-Response-Time": `${responseTime}ms`,
      },
    });
  }
}

// OPTIONS handler for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

// Schema removed to comply with Next.js API route requirements
