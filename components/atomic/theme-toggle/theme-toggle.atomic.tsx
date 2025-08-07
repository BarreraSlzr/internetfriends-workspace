"use client";

import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useIsHydrated } from "@/hooks/use-hydration-safe";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "button" | "dropdown" | "minimal";
  showLabels?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className,
  size = "md",
  variant = "button",
  showLabels = false,
}) => {
  const { theme, setTheme, toggleTheme } = useTheme();
  const isHydrated = useIsHydrated();

  const getIconSize = () => {
    switch (size) {
      case "sm":
        return "w-4 h-4";
      case "md":
        return "w-5 h-5";
      case "lg":
        return "w-6 h-6";
      default:
        return "w-5 h-5";
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case "sm":
        return "p-1.5";
      case "md":
        return "p-2";
      case "lg":
        return "p-3";
      default:
        return "p-2";
    }
  };

  const getCurrentIcon = () => {
    const iconSize = getIconSize();
    switch (theme.mode) {
      case "light":
        return <Sun className={cn(iconSize, "text-yellow-500")} />;
      case "dark":
        return <Moon className={cn(iconSize, "text-blue-400")} />;
      case "system":
        return <Monitor className={cn(iconSize, "text-gray-500")} />;
      default:
        return <Monitor className={cn(iconSize, "text-gray-500")} />;
    }
  };

  const getLabel = () => {
    switch (theme.mode) {
      case "light":
        return "Light mode";
      case "dark":
        return "Dark mode";
      case "system":
        return "System";
      default:
        return "Theme";
    }
  };

  // Consistent placeholder for SSR and pre-hydration
  if (!isHydrated) {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center rounded-md transition-colors",
          "bg-gray-100 dark:bg-gray-800",
          getButtonSize(),
          className,
        )}
        aria-label="Theme toggle loading"
      >
        <Monitor className={cn(getIconSize(), "text-gray-400")} />
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          "inline-flex items-center justify-center rounded-md transition-colors",
          "hover:bg-gray-100 dark:hover:bg-gray-800",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          "dark:focus:ring-offset-gray-900",
          getButtonSize(),
          className,
        )}
        aria-label={`Switch to ${theme.colorScheme === "light" ? "dark" : "light"} mode`}
        title={`Current: ${getLabel()}. Click to toggle.`}
      >
        {getCurrentIcon()}
      </button>
    );
  }

  if (variant === "dropdown") {
    return (
      <div className={cn("relative inline-block text-left", className)}>
        <button
          onClick={toggleTheme}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-md transition-colors",
            "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600",
            "hover:bg-gray-50 dark:hover:bg-gray-700",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            "dark:focus:ring-offset-gray-900",
            getButtonSize(),
            showLabels ? "px-3" : "",
          )}
          aria-label={getLabel()}
          title={getLabel()}
        >
          {getCurrentIcon()}
          {showLabels && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {getLabel()}
            </span>
          )}
        </button>
      </div>
    );
  }

  // Default button variant
  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md transition-all duration-200",
        "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600",
        "hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105",
        "active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        "dark:focus:ring-offset-gray-900",
        "shadow-sm hover:shadow-md",
        getButtonSize(),
        showLabels ? "px-3" : "",
        className,
      )}
      aria-label={`Switch to ${theme.colorScheme === "light" ? "dark" : "light"} mode`}
      title={`Current: ${getLabel()}. Click to toggle.`}
    >
      {getCurrentIcon()}
      {showLabels && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {getLabel()}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
