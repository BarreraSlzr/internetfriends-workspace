
"use client";

/* InternetFriends Accent Demo Component */
/* Visual showcase of the dynamic accent theming system */

import React, { useState } from "react";
import { useAccent, useDarkMode } from "../theme-provider";
import { getAccentPresets, jumpToAccent } from "../runtime/accent_cycle";

// =================================================================
// DEMO COMPONENT
// =================================================================

export function AccentDemo() {
  const { isInitialized, currentAccent, accentMetrics } = useAccent();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [showDetails, setShowDetails] = useState(false);

  const presets = getAccentPresets();

  if (!isInitialized) {
    return (
      <div className="p-6 rounded-lg bg-surface border border-strong">
        <div className="animate-pulse">
          <div className="h-4 bg-surface-elevated rounded w-48 mb-2"></div>
          <div className="h-3 bg-surface-elevated rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-primary">
          🎨 InternetFriends Accent System
        </h2>
        <p className="text-secondary">
          Click the logo or select an accent to see the magic ✨
        </p>
      </div>

      {/* Current Accent Info */}
      <div className="bg-gradient-card-primary p-6 rounded-lg text-center">
        <h3 className="text-xl font-semibold mb-2 text-theme-accent-900">
          Current: {currentAccent?.name || "Loading..."}
        </h3>
        <p className="text-theme-accent-700 mb-4">
          {currentAccent?.description || "Setting up your theme..."}
        </p>

        {accentMetrics && (
          <div className="inline-flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <div
                className="w-4 h-4 rounded-full border-2 border-theme-accent-700"
                style={{
                  backgroundColor: `hsl(${accentMetrics.baseHue}, ${accentMetrics.baseSaturation}%, ${accentMetrics.baseLightness}%)`,
                }}
              />
              <span className="text-theme-accent-800">
                HSL({accentMetrics.baseHue}, {accentMetrics.baseSaturation}%,{" "}
                {accentMetrics.baseLightness}%)
              </span>
            </div>
            <span className="text-theme-accent-600">
              • Accessibility: {accentMetrics.accessibility}
            </span>
          </div>
        )}
      </div>

      {/* Color Scale Preview */}
      <div className="space-y-3">
        <h4 className="font-semibold text-primary">Color Scale</h4>
        <div className="grid grid-cols-10 gap-1 h-16">
          {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((weight) => (
            <div
              key={weight}
              className={`rounded-sm flex items-end justify-center pb-1 bg-theme-accent-${weight}`}
              title={`theme-accent-${weight}`}
            >
              <span
                className={`text-xs font-mono ${
                  weight <= 300
                    ? "text-theme-accent-800"
                    : "text-theme-accent-50"
                }`}
              >
                {weight}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Component Examples */}
      <div className="space-y-4">
        <h4 className="font-semibold text-primary">Component Examples</h4>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Buttons */}
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-secondary">Buttons</h5>
            <div className="flex gap-2 flex-wrap">
              <button className="px-4 py-2 bg-theme-accent-500 hover:bg-theme-accent-600 text-theme-accent-contrast rounded-md transition-colors">
                Primary
              </button>
              <button className="px-4 py-2 border-2 border-theme-accent-500 text-theme-accent-600 hover:bg-theme-accent-50 rounded-md transition-colors">
                Outline
              </button>
              <button className="px-4 py-2 bg-theme-accent-100 text-theme-accent-700 hover:bg-theme-accent-200 rounded-md transition-colors">
                Subtle
              </button>
            </div>
          </div>

          {/* Cards */}
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-secondary">Cards</h5>
            <div className="space-y-2">
              <div className="p-3 bg-theme-accent-50 border border-theme-accent-200 rounded-md">
                <h6 className="font-medium text-theme-accent-800">
                  Subtle Card
                </h6>
                <p className="text-sm text-theme-accent-600">
                  Light accent background
                </p>
              </div>
              <div className="p-3 bg-gradient-accent-soft rounded-md">
                <h6 className="font-medium text-theme-accent-800">
                  Gradient Card
                </h6>
                <p className="text-sm text-theme-accent-700">
                  Dynamic gradient background
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accent Selector */}
      <div className="space-y-3">
        <h4 className="font-semibold text-primary">Quick Accent Selector</h4>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {presets.map((preset, index) => (
            <button
              key={preset.hex}
              onClick={() => jumpToAccent(index)}
              className={`group relative p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                currentAccent?.hex === preset.hex
                  ? "border-theme-accent-500 bg-theme-accent-50"
                  : "border-border-subtle hover:border-theme-accent-300"
              }`}
              title={`${preset.name} - ${preset.description}`}
            >
              <div
                className="w-full h-8 rounded-md"
                style={{ backgroundColor: preset.hex }}
              />
              <div className="mt-2 text-xs text-center">
                <div className="font-medium text-primary truncate">
                  {preset.name.split(" ")[0]}
                </div>
                <div className="text-secondary text-xs">{preset.category}</div>
              </div>
              {currentAccent?.hex === preset.hex && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-theme-accent-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
        <button
          onClick={toggleDarkMode}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-surface-elevated hover:bg-theme-accent-100 transition-colors"
        >
          {isDarkMode ? "☀️" : "🌙"}
          <span className="text-sm">
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </span>
        </button>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-surface-elevated hover:bg-theme-accent-100 transition-colors"
        >
          <span className="text-sm">
            {showDetails ? "Hide" : "Show"} Details
          </span>
          <span
            className={`transition-transform ${showDetails ? "rotate-180" : ""}`}
          >
            ▼
          </span>
        </button>
      </div>

      {/* Debug Details */}
      {showDetails && accentMetrics && (
        <div className="bg-surface-elevated p-4 rounded-lg border border-border-subtle">
          <h5 className="font-semibold text-primary mb-3">
            Theme System Details
          </h5>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-secondary">Base Hue:</span>
                <span className="font-mono">{accentMetrics.baseHue}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Saturation:</span>
                <span className="font-mono">
                  {accentMetrics.baseSaturation}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Lightness:</span>
                <span className="font-mono">
                  {accentMetrics.baseLightness}%
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-secondary">Contrast Ratio:</span>
                <span className="font-mono">
                  {accentMetrics.contrastRatio.toFixed(2)}:1
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">WCAG Level:</span>
                <span
                  className={`font-semibold ${
                    accentMetrics.accessibility === "AAA"
                      ? "text-green-600"
                      : accentMetrics.accessibility === "AA"
                        ? "text-blue-600"
                        : "text-red-600"
                  }`}
                >
                  {accentMetrics.accessibility}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Generation Time:</span>
                <span className="font-mono">
                  {Math.round(accentMetrics.generationTime)}ms
                </span>
              </div>
            </div>
          </div>

          {/* CSS Variables Preview */}
          <div className="mt-4 pt-4 border-t border-border-subtle">
            <h6 className="font-medium text-primary mb-2">
              Active CSS Variables
            </h6>
            <div className="bg-surface p-3 rounded text-xs font-mono overflow-x-auto">
              <div className="text-theme-accent-600">:root {`{`}</div>
              <div className="ml-4 space-y-1">
                <div>
                  --accent-500:{" "}
                  <span className="text-theme-accent-500">
                    hsl({accentMetrics.baseHue} {accentMetrics.baseSaturation}%{" "}
                    {accentMetrics.baseLightness}%)
                  </span>
                  ;
                </div>
                <div>
                  --color-primary:{" "}
                  <span className="text-theme-accent-500">
                    var(--accent-500)
                  </span>
                  ;
                </div>
                <div>
                  --border-focus-ring:{" "}
                  <span className="text-theme-accent-400">
                    var(--accent-400)
                  </span>
                  ;
                </div>
                <div className="text-secondary">… and 40+ more tokens</div>
              </div>
              <div className="text-theme-accent-600">{`}`}</div>
            </div>
          </div>
        </div>
      )}

      {/* Migration Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
        <h5 className="font-semibold text-blue-900 mb-2">🚀 Migration Guide</h5>
        <div className="space-y-2 text-blue-800">
          <div className="flex items-center gap-2">
            <code className="bg-red-100 text-red-800 px-2 py-0.5 rounded line-through">
              border-brand-blue-800
            </code>
            <span>→</span>
            <code className="bg-green-100 text-green-800 px-2 py-0.5 rounded">
              border-theme-accent-800
            </code>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-red-100 text-red-800 px-2 py-0.5 rounded line-through">
              bg-brand-blue-300
            </code>
            <span>→</span>
            <code className="bg-green-100 text-green-800 px-2 py-0.5 rounded">
              bg-theme-accent-300
            </code>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-red-100 text-red-800 px-2 py-0.5 rounded line-through">
              text-brand-blue-900
            </code>
            <span>→</span>
            <code className="bg-green-100 text-green-800 px-2 py-0.5 rounded">
              text-theme-accent-900
            </code>
          </div>
        </div>
        <p className="mt-3 text-blue-700">
          <strong>Pro tip:</strong> Use semantic tokens like{" "}
          <code className="bg-blue-100 px-1 rounded">text-primary</code> and{" "}
          <code className="bg-blue-100 px-1 rounded">bg-surface</code> for the
          most flexible theming experience!
        </p>
      </div>
    </div>
  );
}

export default AccentDemo;
