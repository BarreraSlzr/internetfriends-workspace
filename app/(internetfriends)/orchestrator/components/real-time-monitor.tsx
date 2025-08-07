"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Activity,
  Server,
  Database,
  Cpu,
  MemoryStick,
  Wifi,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SystemMetrics {
  cpu: number;
  memory: number;
  network: number;
  database: "connected" | "disconnected" | "error";
  server: "running" | "stopped" | "error";
  buildStatus: "success" | "building" | "failed";
  lastUpdate: string;
}

interface SystemStatusResponse {
  timestamp: string;
  system: {
    cpu: number;
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    uptime: number;
    platform: string;
    arch: string;
  };
  application: {
    server: "running" | "stopped" | "error";
    database: "connected" | "disconnected" | "error";
    buildStatus: "success" | "building" | "failed";
    port: number;
    environment: string;
  };
  project: {
    eslintIssues: number;
    typeScriptErrors: number;
    testCoverage: number;
    components: number;
    totalFiles: number;
    lastBuildTime?: string;
  };
  processes: Array<{
    name: string;
    status: "running" | "idle" | "stopped";
    uptime: string;
    pid?: number;
  }>;
  logs: Array<{
    timestamp: string;
    level: "info" | "warn" | "error" | "success";
    message: string;
    source: string;
  }>;
}

interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
  message: string;
  source: string;
}

interface RealTimeMonitorProps {
  className?: string;
}

export const RealTimeMonitor: React.FC<RealTimeMonitorProps> = ({
  className = "",
}) => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 45,
    memory: 62,
    network: 23,
    database: "connected",
    server: "running",
    buildStatus: "success",
    lastUpdate: new Date().toISOString(),
  });

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      timestamp: new Date().toISOString(),
      level: "success",
      message: "Orchestrator initialized successfully",
      source: "system",
    },
    {
      timestamp: new Date(Date.now() - 5000).toISOString(),
      level: "info",
      message: "Development server started on port 3001",
      source: "next",
    },
    {
      timestamp: new Date(Date.now() - 12000).toISOString(),
      level: "success",
      message: "Database connection established",
      source: "database",
    },
  ]);

  const [isConnected, setIsConnected] = useState(true);
  const [activeProcesses, setActiveProcesses] = useState([
    { name: "Next.js Dev Server", status: "running", uptime: "00:12:34" },
    { name: "Turbopack", status: "active", uptime: "00:12:34" },
    { name: "TypeScript Check", status: "idle", uptime: "00:12:34" },
  ]);

  const logsRef = useRef<HTMLDivElement>(null);

  // Fetch real system data from API
  const fetchSystemStatus = async () => {
    try {
      const response = await fetch("/api/system/status");
      if (response.ok) {
        const data: SystemStatusResponse = await response.json();

        // Update metrics from real data
        setMetrics((prev) => ({
          ...prev,
          cpu: data.system.cpu,
          memory: data.system.memory.percentage,
          network: Math.random() * 30, // Network still simulated
          database: data.application.database,
          server: data.application.server,
          buildStatus: data.application.buildStatus,
          lastUpdate: data.timestamp,
        }));

        // Update logs from real data
        setLogs(data.logs);

        // Update processes from real data
        setActiveProcesses(
          data.processes.map((p) => ({
            name: p.name,
            status: p.status,
            uptime: p.uptime,
          })),
        );

        setIsConnected(true);
      } else {
        console.warn("Failed to fetch system status");
        setIsConnected(false);
      }
    } catch (error) {
      console.error("Error fetching system status:", error);
      setIsConnected(false);
    }
  };

  // Real-time data fetching
  useEffect(() => {
    fetchSystemStatus(); // Initial fetch

    const interval = setInterval(fetchSystemStatus, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll logs to top when new entries arrive
  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = 0;
    }
  }, [logs]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
      case "running":
      case "success":
        return "text-green-400";
      case "building":
      case "active":
        return "text-blue-400";
      case "idle":
        return "text-gray-400";
      case "disconnected":
      case "stopped":
      case "failed":
      case "error":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
      case "running":
      case "success":
        return <CheckCircle className="w-4 h-4" />;
      case "building":
      case "active":
        return <Activity className="w-4 h-4 animate-pulse" />;
      case "disconnected":
      case "stopped":
      case "failed":
      case "error":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <div className="w-4 h-4" />;
    }
  };

  const getLogLevelColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "success":
        return "text-green-400";
      case "info":
        return "text-blue-400";
      case "warn":
        return "text-yellow-400";
      case "error":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getMetricColor = (
    value: number,
    thresholds = { warn: 70, critical: 90 },
  ) => {
    if (value >= thresholds.critical) return "text-red-400";
    if (value >= thresholds.warn) return "text-yellow-400";
    return "text-green-400";
  };

  return (
    <div
      className={cn(
        "bg-gray-900 border border-gray-700 rounded-lg p-4",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Activity
            className={`w-5 h-5 ${isConnected ? "text-green-400 animate-pulse" : "text-red-400"}`}
          />
          <h3 className="text-lg font-semibold text-white">
            Real-time Monitor
          </h3>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Wifi className="w-4 h-4" />
          <span>{isConnected ? "Connected" : "Disconnected"}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* System Metrics */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-300 flex items-center space-x-2">
            <Server className="w-4 h-4" />
            <span>System Metrics</span>
          </h4>

          {/* CPU */}
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300">CPU Usage</span>
              </div>
              <span
                className={`text-sm font-medium ${getMetricColor(metrics.cpu)}`}
              >
                {metrics.cpu.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${metrics.cpu}%` }}
              />
            </div>
          </div>

          {/* Memory */}
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <MemoryStick className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">Memory Usage</span>
              </div>
              <span
                className={`text-sm font-medium ${getMetricColor(metrics.memory)}`}
              >
                {metrics.memory.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${metrics.memory}%` }}
              />
            </div>
          </div>

          {/* Network */}
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Wifi className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-300">Network I/O</span>
              </div>
              <span
                className={`text-sm font-medium ${getMetricColor(metrics.network, { warn: 80, critical: 95 })}`}
              >
                {metrics.network.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${metrics.network}%` }}
              />
            </div>
          </div>

          {/* Service Status */}
          <div className="bg-gray-800 rounded-lg p-3">
            <h5 className="text-sm font-medium text-gray-300 mb-2">
              Service Status
            </h5>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(metrics.database)}
                  <span className="text-sm text-gray-300">Database</span>
                </div>
                <span
                  className={`text-sm font-medium ${getStatusColor(metrics.database)}`}
                >
                  {metrics.database}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(metrics.server)}
                  <span className="text-sm text-gray-300">Server</span>
                </div>
                <span
                  className={`text-sm font-medium ${getStatusColor(metrics.server)}`}
                >
                  {metrics.server}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(metrics.buildStatus)}
                  <span className="text-sm text-gray-300">Build</span>
                </div>
                <span
                  className={`text-sm font-medium ${getStatusColor(metrics.buildStatus)}`}
                >
                  {metrics.buildStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Logs & Processes */}
        <div className="space-y-4">
          {/* Active Processes */}
          <div className="bg-gray-800 rounded-lg p-3">
            <h5 className="text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Active Processes</span>
            </h5>
            <div className="space-y-2">
              {activeProcesses.map((process, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(process.status)}
                    <span className="text-sm text-gray-300">
                      {process.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-xs font-medium ${getStatusColor(process.status)}`}
                    >
                      {process.status}
                    </div>
                    <div className="text-xs text-gray-500">
                      {process.uptime}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Logs */}
          <div className="bg-gray-800 rounded-lg p-3 flex-1">
            <h5 className="text-sm font-medium text-gray-300 mb-2">
              Recent Logs
            </h5>
            <div
              ref={logsRef}
              className="space-y-1 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
            >
              {logs.map((log, index) => (
                <div key={`${log.timestamp}-${index}`} className="text-xs">
                  <div className="flex items-start space-x-2">
                    <span className="text-gray-500 font-mono">
                      {formatTime(log.timestamp)}
                    </span>
                    <span
                      className={`font-medium ${getLogLevelColor(log.level)}`}
                    >
                      [{log.level.toUpperCase()}]
                    </span>
                    <span className="text-gray-400">[{log.source}]</span>
                  </div>
                  <div className="text-gray-300 ml-16">{log.message}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-700 text-xs text-gray-500">
        Last updated: {formatTime(metrics.lastUpdate)} • Monitoring{" "}
        {activeProcesses.length} processes •{logs.length} log entries •
        {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
      </div>
    </div>
  );
};
