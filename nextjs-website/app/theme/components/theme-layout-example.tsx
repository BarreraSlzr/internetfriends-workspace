
"use client";

/* InternetFriends Theme Layout Example */
/* Shows how to integrate the accent theming system into a Next.js layout */

import React from "react";
import { ThemeProvider } from "../theme-provider";
import AccentDemo from "./accent-demo";

// =================================================================
// THEME LAYOUT EXAMPLE
// =================================================================

interface ThemeLayoutExampleProps {
  children?: React.ReactNode;
  enableDemo?: boolean;
  debugMode?: boolean;
}

export function ThemeLayoutExample({
  children,
  enableDemo = true,
  debugMode = false,
}: ThemeLayoutExampleProps) {
  return (
    <ThemeProvider
      enableAccentCycling={true}
      enableDarkMode={true}
      logoSelector="[data-logo], .logo, [href='/']"
      debugMode={debugMode}
      onThemeInitialized={(metrics) => {
        console.log("🎨 Theme initialized with metrics:", metrics);
      }}
      onAccentChange={(preset, metrics) => {
        console.log("🎨 Accent changed to:", preset.name, metrics);
      }}
      onThemeError={(error) => {
        console.error("🎨 Theme error:", error);
      }}
    >
      <div className="min-h-screen bg-surface text-primary transition-colors duration-300">
        {/* Example Header with Logo */}
        <header className="sticky top-0 z-50 bg-surface-elevated/80 backdrop-blur-sm border-b border-border-subtle">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo with Accent Cycling */}
              <div
                data-logo
                className="flex items-center gap-2 cursor-pointer group"
                title="Click to change accent color"
              >
                <div className="w-8 h-8 bg-theme-accent-500 rounded-lg flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform">
                  IF
                </div>
                <span className="text-xl font-bold text-primary">
                  InternetFriends
                </span>
                <span className="text-sm text-secondary hidden sm:inline">
                  Theme Demo
                </span>
              </div>

              {/* Theme Controls */}
              <div className="flex items-center gap-4">
                <ThemeControls />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {enableDemo && (
            <div className="mb-12">
              <AccentDemo />
            </div>
          )}

          {children && <div className="space-y-8">{children}</div>}

          {/* Example Content Sections */}
          <ExampleContentSections />
        </main>

        {/* Example Footer */}
        <footer className="bg-surface-elevated border-t border-border-subtle mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-secondary">
              <p>🎨 InternetFriends Accent Theming System</p>
              <p className="text-sm mt-2">
                Built with dynamic CSS custom properties and HSL color
                generation
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}

// =================================================================
// THEME CONTROLS COMPONENT
// =================================================================

function ThemeControls() {
  return (
    <div className="flex items-center gap-2">
      {/* Dark Mode Toggle */}
      <DarkModeToggle />

      {/* Accent Quick Selector */}
      <AccentQuickSelector />
    </div>
  );
}

function DarkModeToggle() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    const savedTheme = localStorage.getItem("if-theme-mode");
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    setIsDarkMode(savedTheme ? savedTheme === "dark" : systemPrefersDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("if-theme-mode", newMode ? "dark" : "light");

    if (newMode) {
      document.documentElement.setAttribute("data-theme", "dark");
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-md bg-surface-elevated hover:bg-theme-accent-100 transition-colors"
      title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? "☀️" : "🌙"}
    </button>
  );
}

function AccentQuickSelector() {
  const quickAccents = ["#3b82f6", "#6366f1", "#8b5cf6", "#ec4899"];

  return (
    <div className="flex gap-1">
      {quickAccents.map((color, index) => (
        <button
          key={color}
          onClick={() => {
            // This would trigger accent change - simplified for example
            console.log("Quick accent change to:", color);
          }}
          className="w-6 h-6 rounded-full border-2 border-border-subtle hover:border-theme-accent-500 transition-colors"
          style={{ backgroundColor: color }}
          title={`Quick accent ${index + 1}`}
        />
      ))}
    </div>
  );
}

// =================================================================
// EXAMPLE CONTENT SECTIONS
// =================================================================

function ExampleContentSections() {
  return (
    <div className="space-y-12">
      {/* Cards Section */}
      <section>
        <h2 className="text-2xl font-bold text-primary mb-6">
          Themed Component Examples
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Primary Card */}
          <div className="bg-gradient-card-primary p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-theme-accent-900 mb-2">
              Primary Card
            </h3>
            <p className="text-theme-accent-700 mb-4">
              This card uses the primary accent gradient background.
            </p>
            <button className="bg-theme-accent-600 hover:bg-theme-accent-700 text-white px-4 py-2 rounded-md transition-colors">
              Call to Action
            </button>
          </div>

          {/* Subtle Card */}
          <div className="bg-theme-accent-50 border border-theme-accent-200 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-theme-accent-800 mb-2">
              Subtle Card
            </h3>
            <p className="text-theme-accent-600 mb-4">
              This card uses subtle accent colors for a gentle effect.
            </p>
            <button className="border-2 border-theme-accent-500 text-theme-accent-600 hover:bg-theme-accent-100 px-4 py-2 rounded-md transition-colors">
              Learn More
            </button>
          </div>

          {/* Glass Card */}
          <div className="glass-accent p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-primary mb-2">
              Glass Card
            </h3>
            <p className="text-secondary mb-4">
              This card demonstrates the glass morphism effect with accent
              integration.
            </p>
            <button className="bg-surface hover:bg-theme-accent-100 border border-border-accent-medium px-4 py-2 rounded-md transition-colors">
              Glass Action
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Elements */}
      <section>
        <h2 className="text-2xl font-bold text-primary mb-6">
          Interactive Elements
        </h2>

        <div className="space-y-6">
          {/* Form Elements */}
          <div className="bg-surface-elevated p-6 rounded-lg border border-border-subtle">
            <h3 className="text-lg font-semibold text-primary mb-4">
              Form Elements
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-theme-accent-500 focus:border-theme-accent-500"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Category
                </label>
                <select className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-theme-accent-500 focus:border-theme-accent-500">
                  <option>Design</option>
                  <option>Development</option>
                  <option>Marketing</option>
                </select>
              </div>
            </div>
          </div>

          {/* Progress and Status */}
          <div className="bg-surface-elevated p-6 rounded-lg border border-border-subtle">
            <h3 className="text-lg font-semibold text-primary mb-4">
              Progress & Status
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-secondary mb-1">
                  <span>Theme System Loading</span>
                  <span>85%</span>
                </div>
                <div className="w-full bg-surface rounded-full h-2">
                  <div
                    className="bg-theme-accent-500 h-2 rounded-full"
                    style={{ width: "85%" }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-secondary">
                    Accent System: Active
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-theme-accent-500 rounded-full"></div>
                  <span className="text-sm text-secondary">Theme: Dynamic</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ThemeLayoutExample;
