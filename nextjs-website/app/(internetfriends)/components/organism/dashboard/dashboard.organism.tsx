"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UIEvents } from "../../../../../lib/events/event.system";
import {
  generateStamp,
  getTimestamp,
  getIsoTimestamp,
} from "@/lib/utils/timestamp";
import styles from "./dashboard.styles.module.scss";

// Define types inline to avoid module resolution issues
type DashboardTab =
  | "overview"
  | "analytics"
  | "projects"
  | "performance"
  | "settings";

type MetricTrend = "up" | "down" | "stable";
type ActivitySeverity = "info" | "success" | "warning" | "error";

interface DashboardProps {
  userId?: string;
  sessionId?: string;
  initialTab?: DashboardTab;
  showMetrics?: boolean;
  showActivity?: boolean;
  className?: string;
  disabled?: boolean;
  "data-testid"?: string;
  [key: string]: unknown;
}

interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  change?: string;
  trend?: MetricTrend;
  icon?: string;
  color?: string;
}

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  timestamp: string; // Changed from Date to string for ISO format
  severity: ActivitySeverity;
  icon?: string;
}

export const DashboardOrganism: React.FC<DashboardProps> = React.memo(
  ({
    userId,
    sessionId,
    initialTab = "overview",
    showMetrics = true,
    showActivity = true,
    className,
    disabled = false,
    "data-testid": testId = "dashboard-organism",
    ...props
  }) => {
    const stamp = useMemo(() => generateStamp(), []);
    const currentTime = new Date().toISOString();

    // State Management
    const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);
    const [metrics, setMetrics] = useState<MetricCard[]>([]);
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<string>(currentTime);

    // Tab Configuration
    const tabs: { id: DashboardTab; label: string; icon: string }[] = [
      { id: "overview", label: "Overview", icon: "📊" },
      { id: "analytics", label: "Analytics", icon: "📈" },
      { id: "projects", label: "Projects", icon: "🚀" },
      { id: "performance", label: "Performance", icon: "⚡" },
      { id: "settings", label: "Settings", icon: "⚙️" },
    ];

    // Mock Data Generation (In real app, this would come from API)
    const generateMockMetrics = (): MetricCard[] => [
      {
        id: "1",
        title: "Total Users",
        value: "2,543",
        change: "+12.5%",
        trend: "up",
        icon: "👥",
        color: "var(--if-primary)",
      },
      {
        id: "2",
        title: "Active Sessions",
        value: "189",
        change: "+5.2%",
        trend: "up",
        icon: "🔥",
        color: "#10b981",
      },
      {
        id: "3",
        title: "Response Time",
        value: "245ms",
        change: "-8.1%",
        trend: "down",
        icon: "⚡",
        color: "#f59e0b",
      },
      {
        id: "4",
        title: "Error Rate",
        value: "0.02%",
        change: "-0.05%",
        trend: "down",
        icon: "🛡️",
        color: "#ef4444",
      },
    ];

    const generateMockActivities = (): ActivityItem[] => [
      {
        id: "1",
        type: "user_login",
        message: "New user registration from San Francisco",
        timestamp: new Date(getTimestamp() - 300000).toISOString(), // 5 min ago
        severity: "info",
        icon: "👋",
      },
      {
        id: "2",
        type: "system_alert",
        message: "API response time exceeded threshold",
        timestamp: new Date(getTimestamp() - 600000).toISOString(), // 10 min ago
        severity: "warning",
        icon: "⚠️",
      },
      {
        id: "3",
        type: "deployment",
        message: "Successfully deployed v2.1.0 to production",
        timestamp: new Date(getTimestamp() - 900000).toISOString(), // 15 min ago
        severity: "success",
        icon: "🚀",
      },
      {
        id: "4",
        type: "compute_job",
        message: "Background data processing completed",
        timestamp: new Date(getTimestamp() - 1200000).toISOString(), // 20 min ago
        severity: "info",
        icon: "💾",
      },
    ];

    // Effects
    useEffect(() => {
      // Emit page load event
      UIEvents.pageLoad("dashboard", performance.now(), userId);

      // Initialize dashboard data
      const initDashboard = async () => {
        try {
          setIsLoading(true);

          // Simulate API calls
          await new Promise((resolve) => setTimeout(resolve, 1000));

          setMetrics(generateMockMetrics());
          setActivities(generateMockActivities());
          setError(null);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to load dashboard",
          );
        } finally {
          setIsLoading(false);
          setLastUpdate(new Date().toISOString());
        }
      };

      initDashboard();

      // Set up real-time updates
      const updateInterval = setInterval(() => {
        setMetrics(generateMockMetrics());
        setActivities(generateMockActivities());
        setLastUpdate(new Date().toISOString());
      }, 30000); // Update every 30 seconds

      return () => clearInterval(updateInterval);
    }, [userId]);

    // Event Handlers
    const handleTabChange = (tab: DashboardTab) => {
      setActiveTab(tab);
      UIEvents.interaction("tab_click", `dashboard_${tab}`, userId, sessionId);
    };

    const handleMetricClick = (metric: MetricCard) => {
      UIEvents.interaction("metric_click", metric.id, userId, sessionId);
      // In real app, this might open a detailed view
    };

    const handleRefresh = async () => {
      UIEvents.interaction("refresh_click", "dashboard", userId, sessionId);

      setIsLoading(true);
      try {
        // Simulate refresh
        await new Promise((resolve) => setTimeout(resolve, 500));
        setMetrics(generateMockMetrics());
        setActivities(generateMockActivities());
        setLastUpdate(new Date().toISOString());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Refresh failed");
      } finally {
        setIsLoading(false);
      }
    };

    // Computed Values
    const formattedLastUpdate = useMemo(() => {
      return new Date(lastUpdate).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    }, [lastUpdate]);

    // Animation Variants
    const containerVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.6,
          staggerChildren: 0.1,
        },
      },
    };

    const itemVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4 },
      },
    };

    // Render Methods
    const renderMetrics = () => (
      <motion.div
        className={styles.metricsGrid}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {metrics.map((metric) => (
          <motion.div
            key={metric.id}
            className={styles.metricCard}
            variants={itemVariants}
            onClick={() => handleMetricClick(metric)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={styles.metricIcon} style={{ color: metric.color }}>
              {metric.icon}
            </div>
            <div className={styles.metricContent}>
              <h3 className={styles.metricTitle}>{metric.title}</h3>
              <div className={styles.metricValue}>{metric.value}</div>
              <div
                className={`${styles.metricChange} ${styles[`change-${metric.trend}`]}`}
              >
                {metric.change}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    );

    const renderActivity = () => (
      <motion.div
        className={styles.activityFeed}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h3 className={styles.sectionTitle}>Recent Activity</h3>
        <div className={styles.activityList}>
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              className={`${styles.activityItem} ${styles[`severity-${activity.severity}`]}`}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
            >
              <div className={styles.activityIcon}>{activity.icon}</div>
              <div className={styles.activityContent}>
                <p className={styles.activityMessage}>{activity.message}</p>
                <time className={styles.activityTime}>
                  {new Date(activity.timestamp).toLocaleTimeString()}
                </time>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );

    const renderTabContent = () => {
      switch (activeTab) {
        case "overview":
          return (
            <div className={styles.overviewContent}>
              {showMetrics && renderMetrics()}
              {showActivity && renderActivity()}
            </div>
          );

        case "analytics":
          return (
            <div className={styles.analyticsContent}>
              <h3>Analytics Dashboard</h3>
              <p>Advanced analytics and insights coming soon...</p>
            </div>
          );

        case "projects":
          return (
            <div className={styles.projectsContent}>
              <h3>Project Management</h3>
              <p>Project overview and management tools...</p>
            </div>
          );

        case "performance":
          return (
            <div className={styles.performanceContent}>
              <h3>Performance Monitoring</h3>
              <p>Real-time performance metrics and optimization...</p>
            </div>
          );

        case "settings":
          return (
            <div className={styles.settingsContent}>
              <h3>Dashboard Settings</h3>
              <p>Customize your dashboard experience...</p>
            </div>
          );

        default:
          return null;
      }
    };

    if (error) {
      return (
        <div
          className={`${styles.dashboard} ${styles.error} ${className || ""}`}
        >
          <div className={styles.errorContent}>
            <h2>⚠️ Dashboard Error</h2>
            <p>{error}</p>
            <button onClick={handleRefresh} className={styles.retryButton}>
              Retry
            </button>
          </div>
        </div>
      );
    }

    return (
      <motion.div
        className={`${styles.dashboard} ${className || ""}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        {...props}
      >
        {/* Dashboard Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>InternetFriends Dashboard</h1>
            <div className={styles.headerActions}>
              <span className={styles.lastUpdate}>
                Last updated: {formattedLastUpdate}
              </span>
              <button
                onClick={handleRefresh}
                className={styles.refreshButton}
                disabled={isLoading}
              >
                {isLoading ? "⟳" : "↻"}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className={styles.navigation}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ""}`}
              data-active={activeTab === tab.id}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span className={styles.tabLabel}>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Main Content */}
        <main className={styles.content}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Loading Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              className={styles.loadingOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className={styles.loadingSpinner}>
                <div className={styles.spinner}></div>
                <span>Loading dashboard...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  },
);

export default DashboardOrganism;
