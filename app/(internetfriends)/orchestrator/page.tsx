"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Database,
  Server,
  Code,
  GitBranch,
  Users,
  Globe,
} from "lucide-react";
import { RealTimeMonitor } from "./components/real-time-monitor";

interface ProjectMetrics {
  totalComponents: number;
  totalPages: number;
  buildTime: string;
  lastCommit: string;
  testCoverage: number;
  eslintScore: number;
  performanceScore: number;
}

interface SystemHealth {
  overall: "healthy" | "warning" | "critical";
  services: {
    database: "online" | "offline" | "degraded";
    server: "running" | "stopped" | "restarting";
    build: "success" | "failed" | "building";
    deployment: "deployed" | "pending" | "failed";
  };
}

export default function OrchestratorPage() {
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [projectMetrics, setProjectMetrics] = useState<ProjectMetrics>({
    totalComponents: 45,
    totalPages: 12,
    buildTime: "2.3s",
    lastCommit: "2 minutes ago",
    testCoverage: 0,
    eslintScore: 92,
    performanceScore: 87,
  });

  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    overall: "healthy",
    services: {
      database: "online",
      server: "running",
      build: "success",
      deployment: "deployed",
    },
  });

  const [activeTab, setActiveTab] = useState<
    "overview" | "monitoring" | "logs" | "settings"
  >("overview");

  // Fetch project metrics
  const fetchProjectMetrics = async () => {
    try {
      const response = await fetch("/api/system/status");
      if (response.ok) {
        const data = await response.json();
        setProjectMetrics({
          totalComponents: data.project?.components || 45,
          totalPages: data.project?.pages || 12,
          buildTime: data.project?.lastBuildTime || "2.3s",
          lastCommit: "2 minutes ago", // Would come from git API
          testCoverage: data.project?.testCoverage || 0,
          eslintScore: Math.max(0, 100 - (data.project?.eslintIssues || 0)),
          performanceScore: 87,
        });

        setSystemHealth({
          overall:
            data.application?.server === "running" &&
            data.application?.database === "connected"
              ? "healthy"
              : "warning",
          services: {
            database:
              data.application?.database === "connected" ? "online" : "offline",
            server:
              data.application?.server === "running" ? "running" : "stopped",
            build: data.application?.buildStatus || "success",
            deployment: "deployed",
          },
        });
      }
    } catch (error) {
      console.error("Failed to fetch project metrics: ", error);
    }
  };

  useEffect(() => {
    fetchProjectMetrics();
    const interval = setInterval(fetchProjectMetrics, 5000);
    return () => clearInterval(interval);
  }, []);  

  const getHealthColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "online":
      case "running":
      case "success":
      case "deployed":
        return "text-green-400";
      case "warning":
      case "degraded":
      case "building":
      case "pending":
        return "text-yellow-400";
      case "critical":
      case "offline":
      case "stopped":
      case "failed":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case "online":
      case "running":
      case "success":
      case "deployed":
        return "🟢";
      case "degraded":
      case "building":
      case "pending":
        return "🟡";
      case "offline":
      case "stopped":
      case "failed":
        return "🔴";
      default:
        return "⚪";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-8 h-8 text-blue-500" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Project Orchestrator
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Real-time project monitoring & control
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${systemHealth.overall === "healthy" ? "bg-green-400" : systemHealth.overall === "warning" ? "bg-yellow-400" : "bg-red-400"}`}
                />
                <span
                  className={`text-sm font-medium ${getHealthColor(systemHealth.overall)}`}
                >
                  {systemHealth.overall.toUpperCase()}
                </span>
              </div>

              <button
                onClick={() => setIsMonitoring(!isMonitoring)}
                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${isMonitoring ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {isMonitoring ? (
                  <>
                    <Pause className="w-4 h-4 mr-1" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-1" />
                    Resume
                  </>
                )}
              </button>

              <button
                onClick={fetchProjectMetrics}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: "overview", label: "Overview", icon: Activity },
              { id: "monitoring", label: "Real-time Monitoring", icon: Server },
              { id: "logs", label: "Logs & Analytics", icon: Code },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* System Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: "Database",
                  status: systemHealth.services.database,
                  icon: Database,
                  description: "PostgreSQL connection",
                },
                {
                  title: "Server",
                  status: systemHealth.services.server,
                  icon: Server,
                  description: "Next.js development server",
                },
                {
                  title: "Build",
                  status: systemHealth.services.build,
                  icon: Code,
                  description: "Last build status",
                },
                {
                  title: "Deployment",
                  status: systemHealth.services.deployment,
                  icon: Globe,
                  description: "Production deployment",
                },
              ].map((service) => (
                <div
                  key={service.title}
                  className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg"
                >
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <service.icon className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                            {service.title}
                          </dt>
                          <dd className="flex items-center">
                            <div
                              className={`text-lg font-medium ${getHealthColor(service.status)}`}
                            >
                              {getHealthIcon(service.status)}{" "}
                              {service.status.toUpperCase()}
                            </div>
                          </dd>
                          <dd className="text-sm text-gray-500 dark:text-gray-400">
                            {service.description}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Project Metrics */}
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                  Project Metrics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Components",
                      value: projectMetrics.totalComponents,
                      icon: "🧩",
                    },
                    {
                      label: "Pages",
                      value: projectMetrics.totalPages,
                      icon: "📄",
                    },
                    {
                      label: "Build Time",
                      value: projectMetrics.buildTime,
                      icon: "⚡",
                    },
                    {
                      label: "ESLint Score",
                      value: `${projectMetrics.eslintScore}%`,
                      icon: "✅",
                    },
                  ].map((metric) => (
                    <div key={metric.label} className="text-center">
                      <div className="text-2xl mb-1">{metric.icon}</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {metric.value}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {metric.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Run Build",
                      action: "build",
                      icon: Code,
                      color: "blue",
                    },
                    {
                      label: "Run Tests",
                      action: "test",
                      icon: GitBranch,
                      color: "green",
                    },
                    {
                      label: "Check Health",
                      action: "health",
                      icon: Activity,
                      color: "purple",
                    },
                    {
                      label: "View Logs",
                      action: "logs",
                      icon: Server,
                      color: "gray",
                    },
                  ].map((action) => (
                    <button
                      key={action.action}
                      className={`flex flex-col items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${action.color}-500`}
                    >
                      <action.icon className="w-6 h-6 text-gray-400 mb-2" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "monitoring" && (
          <div className="space-y-6">
            <RealTimeMonitor className="w-full" />
          </div>
        )}

        {activeTab === "logs" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                  System Logs & Analytics
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Advanced logging and analytics features coming soon...
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                  Orchestrator Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900 dark:text-white">
                        Auto-refresh interval
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        How often to update system metrics
                      </p>
                    </div>
                    <select className="mt-1 block w-32 pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white">
                      <option>1 second</option>
                      <option>3 seconds</option>
                      <option>5 seconds</option>
                      <option>10 seconds</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900 dark:text-white">
                        Enable notifications
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Get notified when system status changes
                      </p>
                    </div>
                    <button
                      type="button"
                      className="bg-gray-200 dark:bg-gray-600 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      role="switch" aria-checked={false}
                    >
                      <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
