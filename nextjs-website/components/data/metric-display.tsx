
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/hooks/use-theme";

export interface MetricDisplayProps {
  value: string | number;
  label: string;
  unit?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  accent?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  flash?: boolean;
  flashTrigger?: string | number | boolean; // dependency that triggers flash animation
  className?: string;
  style?: React.CSSProperties;
}

/**
 * MetricDisplay - Teenage Engineering inspired data visualization
 *
 * Features:
 * - Monospace/accent font rendering for technical precision
 * - Optional flash animation on value changes
 * - Trend indicators with directional arrows
 * - Adaptive accent colors via CSS variables
 * - Multiple size variants for different contexts
 * - Hardware-inspired aesthetic with subtle glow effects
 */
export function MetricDisplay({
  value,
  label,
  unit,
  trend,
  trendValue,
  accent = false,
  size = "md",
  flash = false,
  flashTrigger,
  className = "",
  style,
}: MetricDisplayProps) {
  const { theme } = useTheme();
  const isDark = theme.colorScheme === "dark";
  const [isFlashing, setIsFlashing] = useState(false);

  // Trigger flash animation when flashTrigger changes
  useEffect(() => {
    if (flash && flashTrigger !== undefined) {
      setIsFlashing(true);
      const timeout = setTimeout(() => setIsFlashing(false), 400);
      return () => clearTimeout(timeout);
    }
  }, [flash, flashTrigger]);

  const sizeConfig = {
    sm: {
      valueSize: "1.5rem",
      labelSize: "0.75rem",
      unitSize: "0.875rem",
      trendSize: "0.75rem",
      padding: "0.75rem",
      gap: "0.25rem",
    },
    md: {
      valueSize: "2rem",
      labelSize: "0.875rem",
      unitSize: "1rem",
      trendSize: "0.875rem",
      padding: "1rem",
      gap: "0.375rem",
    },
    lg: {
      valueSize: "2.5rem",
      labelSize: "1rem",
      unitSize: "1.125rem",
      trendSize: "1rem",
      padding: "1.25rem",
      gap: "0.5rem",
    },
    xl: {
      valueSize: "3rem",
      labelSize: "1.125rem",
      unitSize: "1.25rem",
      trendSize: "1.125rem",
      padding: "1.5rem",
      gap: "0.625rem",
    },
  };

  const config = sizeConfig[size];

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return "↗";
      case "down":
        return "↘";
      case "neutral":
        return "→";
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "#10b981"; // success green
      case "down":
        return "#ef4444"; // error red
      case "neutral":
        return "var(--color-text-secondary)";
      default:
        return "var(--color-text-secondary)";
    }
  };

  const containerStyles: React.CSSProperties = {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: config.padding,
    gap: config.gap,
    background: isDark
      ? "var(--if-surface-neutral)"
      : "var(--if-surface-neutral-alt)",
    border: `1px solid var(--if-hairline)`,
    borderRadius: "var(--radius-md)",
    backdropFilter: "blur(8px)",
    transition: "all 0.2s ease",
    ...style,
  };

  const valueStyles: React.CSSProperties = {
    fontFamily: accent ? "var(--font-accent)" : "var(--font-mono)",
    fontSize: config.valueSize,
    fontWeight: accent ? 700 : 600,
    letterSpacing: accent ? "0.05em" : "0.02em",
    color: accent ? "var(--if-accent-primary)" : "var(--color-text-primary)",
    lineHeight: 1,
    textAlign: "center",
  };

  const labelStyles: React.CSSProperties = {
    fontFamily: "var(--font-interface)",
    fontSize: config.labelSize,
    fontWeight: 500,
    color: "var(--color-text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    textAlign: "center",
  };

  const unitStyles: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: config.unitSize,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
    marginLeft: "0.25em",
  };

  const trendStyles: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    fontSize: config.trendSize,
    fontWeight: 600,
    color: getTrendColor(),
  };

  return (
    <motion.div
      className={`metric-display ${className}`}
      style={containerStyles}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      data-metric-size={size}
      data-metric-accent={accent}
      data-metric-trend={trend}
    >
      {/* Flash overlay */}
      <AnimatePresence>
        {isFlashing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={{
              position: "absolute",
              inset: 0,
              background: "var(--if-accent-primary)",
              borderRadius: "var(--radius-md)",
              pointerEvents: "none",
              mixBlendMode: isDark ? "screen" : "multiply",
            }}
          />
        )}
      </AnimatePresence>

      {/* Main value */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "center",
        }}
      >
        <motion.span
          style={valueStyles}
          key={value} // Re-animate when value changes
          initial={flash ? { scale: 0.95 } : undefined}
          animate={flash ? { scale: 1 } : undefined}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {value}
        </motion.span>
        {unit && <span style={unitStyles}>{unit}</span>}
      </div>

      {/* Label */}
      <span style={labelStyles}>{label}</span>

      {/* Trend indicator */}
      {trend && (
        <div style={trendStyles}>
          <span>{getTrendIcon()}</span>
          {trendValue && <span>{trendValue}</span>}
        </div>
      )}

      {/* Subtle glow effect for accent variants in dark mode */}
      {accent && isDark && (
        <div
          style={{
            position: "absolute",
            inset: "-2px",
            background: "var(--if-accent-primary)",
            borderRadius: "var(--radius-md)",
            opacity: 0.1,
            filter: "blur(4px)",
            pointerEvents: "none",
            zIndex: -1,
          }}
        />
      )}
    </motion.div>
  );
}

// Convenience variants for common use cases
export const KPIMetric = (
  props: Omit<MetricDisplayProps, "size" | "accent">,
) => <MetricDisplay size="lg" accent {...props} />;

export const DashboardMetric = (props: Omit<MetricDisplayProps, "size">) => (
  <MetricDisplay size="md" {...props} />
);

export const CompactMetric = (props: Omit<MetricDisplayProps, "size">) => (
  <MetricDisplay size="sm" {...props} />
);

// Example usage component for testing
export const MetricShowcase = () => {
  const [counter, setCounter] = useState(1247);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((prev) => prev + Math.floor(Math.random() * 10) - 5);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        padding: "2rem",
      }}
    >
      <KPIMetric
        value={counter.toLocaleString()}
        label="Active Users"
        trend="up"
        trendValue="+12.5%"
        flash
        flashTrigger={counter}
      />
      <DashboardMetric
        value="99.9"
        unit="%"
        label="Uptime"
        trend="up"
        trendValue="+0.1%"
      />
      <CompactMetric
        value="42ms"
        label="Response Time"
        trend="down"
        trendValue="-5ms"
        accent
      />
      <DashboardMetric
        value="2.1"
        unit="GB"
        label="Memory Usage"
        trend="neutral"
        trendValue="stable"
      />
    </div>
  );
};
