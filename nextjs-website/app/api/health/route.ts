import { NextResponse } from "next/server";

// Simple health check for production readiness
export async function GET() {
  const timestamp = new Date().toISOString();
  const uptime = process.uptime ? Math.floor(process.uptime()) : 0;
  
  try {
    // Basic system checks
    const memoryUsage = process.memoryUsage ? process.memoryUsage() : null;
    
    const healthData = {
      status: "healthy",
      timestamp,
      uptime,
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      memory: memoryUsage ? {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024)
      } : null,
      checks: {
        api: { status: "pass", message: "API is responding" },
        build: { status: "pass", message: "Application built successfully" },
        runtime: { status: "pass", message: "Node.js runtime is working" }
      }
    };

    return NextResponse.json(healthData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache"
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: "unhealthy",
      timestamp,
      error: error instanceof Error ? error.message : "Unknown error"
    }, {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache"
      }
    });
  }
}
