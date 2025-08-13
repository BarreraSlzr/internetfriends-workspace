"use client";

/**
 * Theme Demo Page
 *
 * Restored from legacy .bak and upgraded to:
 *  - Use the new HeaderOrganism (glass variant)
 *  - Provide accessible skip-to-main
 *  - Showcase dynamic accent + dark/light mode interactions
 *
 * Epic: glass-refinement-v1
 * Future Enhancements:
 *  - Add live contrast checker
 *  - Persist user-chosen accent in settings API
 *  - Expose token diffs (before/after accent mutation)
 */

import React from "react";
import type { Metadata } from "next";
import { HeaderOrganism } from "@/components/organisms/header/header.organism";
import { ThemeLayoutExample } from "../../theme/components/theme-layout-example";
import { GlassRefinedAtomic } from "@/components/atomic/glass-refined";
import { ButtonAtomic } from "@/components/atomic/button";

export const metadata: Metadata = {
  title: "Theme Demo | InternetFriends",
  description:
    "Interactive demonstration of the InternetFriends dynamic accent theming system",
};

export default function ThemeDemoPage() {
  return (
    <main id="main-content" className="flex flex-col min-h-screen">
      <HeaderOrganism
        variant="glass"
        size="md"
        navigation={{
          items: [],
        }}
        themeToggle={{
          show: true,
          showLabels: false,
        }}
        languageSelector={{
          show: false,
        }}
        skipToMain
      />

      <ThemeLayoutExample
        enableDemo={true}
        debugMode={process.env.NODE_ENV === "development"}
      >
        <section className="bg-surface-elevated rounded-lg p-8 border border-border-subtle mt-6">
          <h2 className="text-3xl font-bold text-primary mb-4">
            🚀 Welcome to the InternetFriends Theme System
          </h2>

            {/* Narrative */}
          <div className="prose prose-sm md:prose-base max-w-none">
            <p className="text-secondary leading-relaxed mb-6">
              This page demonstrates the dynamic accent engine. The interface
              adapts to your selected accent while maintaining accessibility and
              design harmony. Accent mutation updates semantic tokens (surface,
              primary, border) without breaking contrast budgets.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 not-prose">
            <GlassRefinedAtomic
              variant="card"
              strength={0.42}
              noise={false}
              className="p-6 rounded-lg flex flex-col gap-3"
            >
              <h3 className="text-xl font-semibold text-theme-accent-900 dark:text-theme-accent-100">
                🎨 How It Works
              </h3>
              <ul className="space-y-1 text-theme-accent-800 dark:text-theme-accent-200 text-sm">
                <li>• HSL-based accent scale generation</li>
                <li>• Runtime CSS custom property updates</li>
                <li>• WCAG contrast guarding</li>
                <li>• Light/Dark adaptive semantic mapping</li>
                <li>• Accent cycling via header logo interaction</li>
              </ul>
            </GlassRefinedAtomic>

            <GlassRefinedAtomic
              variant="card"
              strength={0.32}
              noise={false}
              className="p-6 rounded-lg flex flex-col gap-3"
            >
              <h3 className="text-xl font-semibold text-theme-accent-800 dark:text-theme-accent-100">
                ⚡ Key Features
              </h3>
              <ul className="space-y-1 text-theme-accent-700 dark:text-theme-accent-200 text-sm">
                <li>• 8 curated base accent presets</li>
                <li>• Hex → HSL normalization</li>
                <li>• Semantic token layering</li>
                <li>• Hydration-safe initialization</li>
                <li>• Extensible hook-based API</li>
              </ul>
            </GlassRefinedAtomic>
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-6 not-prose">
            <GlassRefinedAtomic
              variant="card"
              strength={0.28}
              className="p-6 flex flex-col gap-4"
            >
              <h3 className="text-lg font-semibold text-primary">
                💡 Try It Out
              </h3>
              <p className="text-sm text-secondary leading-relaxed">
                Click the InternetFriends logo above to cycle accent colors or
                use available theme toggles. Switch between light and dark modes
                to see semantic adaptation. Each accent mutation recalculates a
                scale with balanced saturation & contrast.
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Logo Click = Accent Cycle",
                  "Shift+Click = Reverse Cycle",
                  "Moon/Sun = Dark Mode",
                  "Esc = Close Menus",
                ].map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-theme-accent-100 text-theme-accent-800 dark:bg-theme-accent-800 dark:text-theme-accent-100"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </GlassRefinedAtomic>

            <GlassRefinedAtomic
              variant="card"
              strength={0.24}
              className="p-6 flex flex-col gap-4"
            >
              <h3 className="text-lg font-semibold text-primary">
                🧪 Implementation Example
              </h3>
              <pre className="bg-surface rounded-md p-4 text-xs overflow-x-auto border border-border-subtle">
                <code>
                  {`import { ThemeProvider } from '@/theme/theme-provider';

export function RootLayout({ children }) {
  return (
    <ThemeProvider
      enableAccentCycling
      enableDarkMode
      logoSelector='[data-logo]'
    >
      {children}
    </ThemeProvider>
  );
}`}
                </code>
              </pre>
              <div className="flex gap-2">
                <ButtonAtomic
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent("if:theme-demo:export-request"),
                    );
                  }}
                >
                  Export Tokens
                </ButtonAtomic>
                <ButtonAtomic
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                >
                  Back to Top
                </ButtonAtomic>
              </div>
            </GlassRefinedAtomic>
          </div>

          <div className="mt-10">
            <GlassRefinedAtomic
              variant="card"
              strength={0.18}
              className="p-6 flex flex-col gap-4"
            >
              <h3 className="text-sm font-semibold uppercase tracking-wide opacity-70">
                Semantic Class Migration
              </h3>
              <pre className="bg-surface p-4 rounded-md text-xs overflow-x-auto border border-border-subtle">
                <code>
                  {`/* Before (static brand coupling) */
bg-brand-blue-500
text-brand-blue-900
border-brand-blue-300

/* After (dynamic accent aware) */
bg-theme-accent-500
text-theme-accent-900
border-theme-accent-300

/* Semantic (preferred abstraction) */
bg-surface
text-primary
border-border-subtle`}
                </code>
              </pre>
              <p className="text-xs text-secondary leading-relaxed">
                The semantic tier isolates intent (surface / primary / subtle)
                from raw chroma values, enabling accent & mode re-theming
                without rewriting component markup.
              </p>
            </GlassRefinedAtomic>
          </div>
        </section>
      </ThemeLayoutExample>
    </main>
  );
}
