import { generateStamp } from "@/lib/utils/timestamp";
// InternetFriends Accent Token Demo Component
// Demonstrates the accent token system integration with button components

import React from "react";
import { ButtonAtomic } from "../atomic/button/button.atomic";
import type { AccentToken } from "../../styles/tokens/accent.types";

const ACCENT_TOKENS: AccentToken[] = ["primary", "success", "warning", "danger", "info"];

export const AccentDemo: React.FC = () => {
  return (
    <div className="p-8 space-y-8 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎭 Accent Token System Demo
        </h1>
        <p className="text-gray-600 mb-8">
          InternetFriends design system with dynamic accent token integration
        </p>

        {/* Primary Buttons with Different Accents */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Primary Variant</h2>
          <div className="flex flex-wrap gap-4">
            {ACCENT_TOKENS.map((accent) => (
              <ButtonAtomic
                key={`primary-${accent}`}
                variant="primary"
                accent={accent}
                className="capitalize"
              >
                {accent} Button
              </ButtonAtomic>
            ))}
          </div>
        </section>

        {/* Outline Buttons with Different Accents */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Outline Variant</h2>
          <div className="flex flex-wrap gap-4">
            {ACCENT_TOKENS.map((accent) => (
              <ButtonAtomic
                key={`outline-${accent}`}
                variant="outline"
                accent={accent}
                className="capitalize"
              >
                {accent} Outline
              </ButtonAtomic>
            ))}
          </div>
        </section>

        {/* Different Sizes with Accent */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Size Variations (Success Accent)</h2>
          <div className="flex items-end gap-4">
            <ButtonAtomic variant="primary" accent="success" size="xs">
              Extra Small
            </ButtonAtomic>
            <ButtonAtomic variant="primary" accent="success" size="sm">
              Small
            </ButtonAtomic>
            <ButtonAtomic variant="primary" accent="success" size="md">
              Medium
            </ButtonAtomic>
            <ButtonAtomic variant="primary" accent="success" size="lg">
              Large
            </ButtonAtomic>
            <ButtonAtomic variant="primary" accent="success" size="xl">
              Extra Large
            </ButtonAtomic>
          </div>
        </section>

        {/* Interactive States */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Interactive States</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Normal</p>
              <ButtonAtomic variant="primary" accent="info">
                Click Me
              </ButtonAtomic>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Loading</p>
              <ButtonAtomic variant="primary" accent="info" loading>
                Loading...
              </ButtonAtomic>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Disabled</p>
              <ButtonAtomic variant="primary" accent="info" disabled>
                Disabled
              </ButtonAtomic>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Full Width</p>
              <ButtonAtomic variant="primary" accent="info" fullWidth>
                Full Width
              </ButtonAtomic>
            </div>
          </div>
        </section>

        {/* Real-world Use Cases */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Real-world Use Cases</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Form Actions */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-3">Form Actions</h3>
              <div className="flex gap-3">
                <ButtonAtomic variant="primary" accent="primary">
                  Save Changes
                </ButtonAtomic>
                <ButtonAtomic variant="outline" accent="danger">
                  Delete
                </ButtonAtomic>
                <ButtonAtomic variant="ghost">
                  Cancel
                </ButtonAtomic>
              </div>
            </div>

            {/* Notification Actions */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-3">Alert Actions</h3>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <ButtonAtomic variant="outline" accent="success" size="sm">
                    Approve
                  </ButtonAtomic>
                  <ButtonAtomic variant="outline" accent="danger" size="sm">
                    Reject
                  </ButtonAtomic>
                </div>
                <div className="flex gap-2">
                  <ButtonAtomic variant="outline" accent="warning" size="sm">
                    Review
                  </ButtonAtomic>
                  <ButtonAtomic variant="outline" accent="info" size="sm">
                    Learn More
                  </ButtonAtomic>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Design System Notes */}
        <section className="space-y-4 bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800">Design System Features</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• <strong>Accent Tokens:</strong> Dynamic theming with data-accent attributes</li>
            <li>• <strong>SCSS @use:</strong> Modern modular architecture eliminates deprecation warnings</li>
            <li>• <strong>Focus States:</strong> Dashed outlines inspired by Mermaid viewer pattern</li>
            <li>• <strong>Glass Morphism:</strong> Backdrop-filter support with browser fallbacks</li>
            <li>• <strong>TypeScript Integration:</strong> Full type safety for accent tokens</li>
            <li>• <strong>CSS Custom Properties:</strong> Runtime accent switching support</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default AccentDemo;
