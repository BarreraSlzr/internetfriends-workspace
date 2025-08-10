import React from 'react';
import { Metadata } from 'next';
import { ThemeLayoutExample } from '../../theme/components/theme-layout-example';

export const metadata: Metadata = {
  title: 'Theme Demo | InternetFriends',
  description: 'Interactive demonstration of the InternetFriends dynamic accent theming system',
};

export default function ThemeDemoPage() {
  return (
    <ThemeLayoutExample
      enableDemo={true}
      debugMode={process.env.NODE_ENV === 'development'}
    >
      {/* Additional demo content can be added here */}
      <section className="bg-surface-elevated rounded-lg p-8 border border-border-subtle">
        <h2 className="text-3xl font-bold text-primary mb-4">
          🚀 Welcome to the InternetFriends Theme System
        </h2>

        <div className="prose prose-lg max-w-none">
          <p className="text-secondary leading-relaxed mb-6">
            This page demonstrates our dynamic accent theming system in action.
            The entire interface adapts to your selected accent color while
            maintaining perfect accessibility and visual harmony.
          </p>

          <div className="grid md:grid-cols-2 gap-6 not-prose">
            <div className="bg-theme-accent-50 p-6 rounded-lg border border-theme-accent-200">
              <h3 className="text-xl font-semibold text-theme-accent-900 mb-3">
                🎨 How It Works
              </h3>
              <ul className="space-y-2 text-theme-accent-700">
                <li>• HSL-based color generation for consistent scales</li>
                <li>• CSS custom properties for runtime theming</li>
                <li>• WCAG accessibility compliance built-in</li>
                <li>• Logo click interaction for accent cycling</li>
                <li>• Dark mode support with automatic adjustments</li>
              </ul>
            </div>

            <div className="bg-gradient-accent-soft p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-theme-accent-800 mb-3">
                ⚡ Key Features
              </h3>
              <ul className="space-y-2 text-theme-accent-700">
                <li>• 8 curated accent presets</li>
                <li>• Dynamic color scale generation</li>
                <li>• Semantic token abstraction</li>
                <li>• React hooks for theme integration</li>
                <li>• SSR-safe initialization</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              💡 Try It Out
            </h3>
            <p className="text-blue-800 mb-4">
              Click the InternetFriends logo above to cycle through different accent colors,
              or use the quick selector dots in the header. Toggle between light and dark modes
              to see how the system adapts.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Logo Click = Accent Cycle
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Moon/Sun = Dark Mode Toggle
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Shift + Click = Reverse Cycle
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-primary mb-6">
          Integration Examples
        </h2>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Code Example */}
          <div className="bg-surface-elevated rounded-lg p-6 border border-border-subtle">
            <h3 className="text-lg font-semibold text-primary mb-4">
              Implementation Example
            </h3>
            <pre className="bg-surface p-4 rounded-md text-sm overflow-x-auto">
              <code className="text-secondary">
{`import { ThemeProvider } from '@/theme/theme-provider';

export default function Layout({ children }) {
  return (
    <ThemeProvider
      enableAccentCycling={true}
      enableDarkMode={true}
      logoSelector="[data-logo]"
    >
      {children}
    </ThemeProvider>
  );
}`}
              </code>
            </pre>
          </div>

          {/* CSS Example */}
          <div className="bg-surface-elevated rounded-lg p-6 border border-border-subtle">
            <h3 className="text-lg font-semibold text-primary mb-4">
              Tailwind Classes
            </h3>
            <pre className="bg-surface p-4 rounded-md text-sm overflow-x-auto">
              <code className="text-secondary">
{`/* Before (static) */
bg-brand-blue-500
text-brand-blue-900
border-brand-blue-300

/* After (dynamic) */
bg-theme-accent-500
text-theme-accent-900
border-theme-accent-300

/* Semantic (recommended) */
bg-surface
text-primary
border-border-subtle`}
              </code>
            </pre>
          </div>
        </div>
      </section>
    </ThemeLayoutExample>
  );
}
