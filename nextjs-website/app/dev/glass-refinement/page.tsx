"use client";

import React, { useState } from "react";
import { GlassRefinedAtomic } from "@/components/atomic/glass-refined";
import { BgGooRefined } from "@/components/backgrounds-refined/bg-goo-refined";
import { ButtonAtomic } from "@/components/atomic/button";
import { useTheme } from "@/hooks/use-theme";

export default function GlassRefinementDemo() {
  const { isDark, toggleTheme } = useTheme();
  const [selectedMode, setSelectedMode] = useState<
    "ambient" | "focus" | "narrative" | "performance" | "immersive"
  >("ambient");
  const [glassStrength, setGlassStrength] = useState(0.45);
  const [showNoise, setShowNoise] = useState(false);
  const [showBackground, setShowBackground] = useState(true);

  const modes = [
    {
      key: "ambient",
      label: "Ambient",
      description: "Subtle, low-energy background",
    },
    { key: "focus", label: "Focus", description: "Enhanced attention-drawing" },
    {
      key: "narrative",
      label: "Narrative",
      description: "Story-driven scroll experience",
    },
    {
      key: "performance",
      label: "Performance",
      description: "Optimized for speed",
    },
    {
      key: "immersive",
      label: "Immersive",
      description: "High-impact marketing",
    },
  ] as const;

  return (
    <div className="relative min-h-screen overflow-auto">
      {/* Background system */}
      {showBackground && (
        <BgGooRefined
          mode={selectedMode}
          noise={showNoise}
          parallaxIntensity={0.35}
          respectReducedMotion={true}
        />
      )}

      {/* Demo content */}
      <div className="relative z-10 p-8 space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            Glass Refinement v1.0
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Epic: glass-refinement-v1 - Professionalized glass morphism system
            with strength-based coupling, orbital header motion, and mature
            color palette.
          </p>
        </div>

        {/* Controls */}
        <GlassRefinedAtomic
          variant="card"
          padding={true}
          hover={true}
          noise={showNoise}
          className="max-w-4xl mx-auto"
        >
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Demo Controls</h2>

            {/* Mode Selection */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Background Mode</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {modes.map((mode) => (
                  <ButtonAtomic
                    key={mode.key}
                    variant={selectedMode === mode.key ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setSelectedMode(mode.key)}
                    className="flex flex-col items-center p-4 h-auto"
                  >
                    <span className="font-medium">{mode.label}</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {mode.description}
                    </span>
                  </ButtonAtomic>
                ))}
              </div>
            </div>

            {/* Glass Strength */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium">
                Glass Strength: {glassStrength.toFixed(2)}
              </h3>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={glassStrength}
                onChange={(e) => setGlassStrength(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtle (0.1)</span>
                <span>Strong (0.8)</span>
              </div>
            </div>

            {/* Toggle Controls */}
            <div className="flex flex-wrap gap-4">
              <ButtonAtomic
                variant={showNoise ? "primary" : "outline"}
                onClick={() => setShowNoise(!showNoise)}
              >
                Noise Texture: {showNoise ? "ON" : "OFF"}
              </ButtonAtomic>

              <ButtonAtomic
                variant={showBackground ? "primary" : "outline"}
                onClick={() => setShowBackground(!showBackground)}
              >
                Background: {showBackground ? "ON" : "OFF"}
              </ButtonAtomic>

              <ButtonAtomic variant="outline" onClick={toggleTheme}>
                Theme: {isDark ? "Dark" : "Light"}
              </ButtonAtomic>
            </div>
          </div>
        </GlassRefinedAtomic>

        {/* Glass Variants Demo */}
        <div className="space-y-8">
          <h2 className="text-3xl font-semibold text-center">Glass Variants</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Default variant */}
            <GlassRefinedAtomic
              variant="default"
              strength={glassStrength}
              noise={showNoise}
              hover={true}
              className="p-6"
            >
              <h3 className="text-xl font-semibold mb-3">Default</h3>
              <p className="text-muted-foreground">
                Standard glass component with balanced opacity and blur. Perfect
                for general UI elements.
              </p>
              <div className="mt-4 text-sm text-muted-foreground">
                Strength: {glassStrength.toFixed(2)}
              </div>
            </GlassRefinedAtomic>

            {/* Header variant */}
            <GlassRefinedAtomic
              variant="header"
              noise={showNoise}
              hover={true}
              className="p-6"
            >
              <h3 className="text-xl font-semibold mb-3">Header</h3>
              <p className="text-muted-foreground">
                Optimized for navigation bars with subtle strength. Works with
                orbital motion system.
              </p>
              <div className="mt-4 text-sm text-muted-foreground">
                Fixed Strength: 0.50
              </div>
            </GlassRefinedAtomic>

            {/* Modal variant */}
            <GlassRefinedAtomic
              variant="modal"
              noise={showNoise}
              hover={true}
              className="p-6"
            >
              <h3 className="text-xl font-semibold mb-3">Modal</h3>
              <p className="text-muted-foreground">
                High-strength glass for overlays and modals. Maximum visual
                separation.
              </p>
              <div className="mt-4 text-sm text-muted-foreground">
                Fixed Strength: 0.65
              </div>
            </GlassRefinedAtomic>
          </div>
        </div>

        {/* Mode Comparison */}
        <div className="space-y-6">
          <h2 className="text-3xl font-semibold text-center">Mode System</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassRefinedAtomic
              mode="performance"
              noise={false}
              className="p-6"
            >
              <h3 className="text-xl font-semibold mb-3 text-green-600">
                Performance Mode
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Strength: 0.30 (minimal blur)</li>
                <li>• Parallax: 0.10 (reduced motion)</li>
                <li>• Saturation: 0.85 (muted colors)</li>
                <li>• Speed: 0.25 (slow animation)</li>
                <li>• Optimized for mobile/low-power devices</li>
              </ul>
            </GlassRefinedAtomic>

            <GlassRefinedAtomic mode="immersive" noise={true} className="p-6">
              <h3 className="text-xl font-semibold mb-3 text-purple-600">
                Immersive Mode
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Strength: 0.60 (strong blur)</li>
                <li>• Parallax: 0.45 (enhanced motion)</li>
                <li>• Saturation: 1.15 (vivid colors)</li>
                <li>• Speed: 0.60 (fast animation)</li>
                <li>• Perfect for marketing/hero sections</li>
              </ul>
            </GlassRefinedAtomic>
          </div>
        </div>

        {/* Color System Demo */}
        <div className="space-y-6">
          <h2 className="text-3xl font-semibold text-center">
            Mature Color System
          </h2>

          <GlassRefinedAtomic className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div
                  className="w-16 h-16 mx-auto mb-2 rounded-lg"
                  style={{ backgroundColor: "rgb(var(--if-neutral-200))" }}
                ></div>
                <div className="text-sm">Neutral 200</div>
              </div>
              <div className="text-center">
                <div
                  className="w-16 h-16 mx-auto mb-2 rounded-lg"
                  style={{ backgroundColor: "rgb(var(--if-accent-secondary))" }}
                ></div>
                <div className="text-sm">Secondary Accent</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-lg bg-if-primary"></div>
                <div className="text-sm">Primary Brand</div>
              </div>
              <div className="text-center">
                <div
                  className="w-16 h-16 mx-auto mb-2 rounded-lg"
                  style={{ backgroundColor: "rgb(var(--if-focus-ring))" }}
                ></div>
                <div className="text-sm">Focus Ring</div>
              </div>
            </div>
            <p className="text-center text-muted-foreground mt-4">
              Reduced saturation palette designed to avoid toy-like appearance
            </p>
          </GlassRefinedAtomic>
        </div>

        {/* Instructions */}
        <GlassRefinedAtomic className="p-6 text-center">
          <h2 className="text-2xl font-semibold mb-4">Test Instructions</h2>
          <div className="space-y-3 text-left max-w-2xl mx-auto">
            <p>
              📜 <strong>Scroll the page</strong> to test header orbital motion
              (if header is visible)
            </p>
            <p>
              🎨 <strong>Switch themes</strong> to see glass adaptation to
              light/dark modes
            </p>
            <p>
              🎯 <strong>Change modes</strong> to see background behavior
              differences
            </p>
            <p>
              ⚡ <strong>Adjust strength</strong> to see coupled opacity/blur
              changes
            </p>
            <p>
              🔇 <strong>Enable reduced motion</strong> in your OS to test
              accessibility compliance
            </p>
          </div>
        </GlassRefinedAtomic>

        {/* Spacer for scroll testing */}
        <div className="h-screen flex items-center justify-center">
          <GlassRefinedAtomic className="p-8 text-center">
            <h3 className="text-2xl font-semibold">Scroll Test Area</h3>
            <p className="text-muted-foreground mt-2">
              Keep scrolling to test header orbital motion and parallax effects
            </p>
          </GlassRefinedAtomic>
        </div>

        <div className="h-screen flex items-center justify-center">
          <GlassRefinedAtomic mode="focus" className="p-8 text-center">
            <h3 className="text-2xl font-semibold">End of Demo</h3>
            <p className="text-muted-foreground mt-2">
              Glass Refinement v1.0 - Epic Complete ✨
            </p>
          </GlassRefinedAtomic>
        </div>
      </div>
    </div>
  );
}
