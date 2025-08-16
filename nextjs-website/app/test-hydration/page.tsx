"use client";

import { GlooGlobalOrganism } from "@/components/gloo/global.organism";
import { GlassCardAtomic } from "@/components/atomic/glass-card/glass-card.atomic";

export default function TestHydrationPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Gloo Canvas Background with Randomized Effects */}
      <div className="fixed inset-0 -z-10">
        <GlooGlobalOrganism
          speed={0.6}
          resolution={2.0}
          depth={6}
          seed={3.2}
          animate={true}
          paletteStrategy="brand-triad"
          effectName="spiral"
          className="w-full h-full"
          zIndex={1}
        />
      </div>

      {/* Content with enhanced glass effects over canvas */}
      <div className="relative z-10 min-h-screen p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold text-center mb-8">
            Hydration Test Page
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Test different variants */}
            <GlassCardAtomic variant="default" strength={0.3}>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Default Variant</h3>
                <p className="text-sm opacity-80">
                  Testing default glass effect with strength 0.3
                </p>
              </div>
            </GlassCardAtomic>

            <GlassCardAtomic variant="header" strength={0.5}>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Header Variant</h3>
                <p className="text-sm opacity-80">
                  Testing header glass effect with strength 0.5
                </p>
              </div>
            </GlassCardAtomic>

            <GlassCardAtomic variant="card" strength={0.35} noise={true}>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Card with Noise</h3>
                <p className="text-sm opacity-80">
                  Testing card variant with noise overlay
                </p>
              </div>
            </GlassCardAtomic>

            <GlassCardAtomic variant="modal" strength={0.65} hover={true}>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Modal with Hover</h3>
                <p className="text-sm opacity-80">
                  Testing modal variant with hover effects
                </p>
              </div>
            </GlassCardAtomic>

            <GlassCardAtomic variant="overlay" strength={0.55} size="lg">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Large Overlay</h3>
                <p className="text-sm opacity-80">
                  Testing overlay variant with large size
                </p>
              </div>
            </GlassCardAtomic>

            {/* Test with mode instead of strength */}
            <GlassCardAtomic mode="immersive" noise={true} hover={true}>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Immersive Mode</h3>
                <p className="text-sm opacity-80">
                  Testing mode-based configuration
                </p>
              </div>
            </GlassCardAtomic>
          </div>

          <div className="mt-12 text-center">
            <h2 className="text-xl font-semibold mb-4">Test Instructions</h2>
            <div className="text-sm space-y-2 max-w-2xl mx-auto">
              <GlassCardAtomic variant="card" strength={0.4} className="p-6">
                <div className="space-y-3">
                  <p className="font-medium">🔍 Hydration Testing:</p>
                  <p>
                    1. Open browser DevTools and check for hydration mismatch
                    errors
                  </p>
                  <p>
                    2. Toggle between light and dark mode to test theme
                    consistency
                  </p>
                  <p>3. Resize the window to test mobile responsiveness</p>
                  <p>
                    4. Check that glass effects render consistently on server
                    and client
                  </p>
                  <p>
                    5. Verify CSS custom properties are strings, not numbers
                  </p>

                  <p className="font-medium mt-4">
                    🎨 Canvas Background Testing:
                  </p>
                  <p>
                    6. Verify Gloo canvas renders smoothly without hydration
                    issues
                  </p>
                  <p>7. Check particle animations and mouse interactions</p>
                  <p>
                    8. Test canvas performance with glass effects layered on top
                  </p>
                  <p>
                    9. Verify randomized effects are consistent between renders
                  </p>
                  <p>
                    10. Check canvas responsiveness on different screen sizes
                  </p>
                </div>
              </GlassCardAtomic>
            </div>
          </div>

          {/* Additional Canvas Test Section */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <GlassCardAtomic
              variant="modal"
              strength={0.6}
              noise={true}
              className="p-8"
            >
              <h3 className="text-xl font-bold mb-4">
                Canvas + Glass Integration
              </h3>
              <p className="mb-4">
                This section tests the interaction between the randomized Gloo
                canvas background and the glass morphism effects. The glass
                should have proper backdrop-filter blur over the animated
                canvas.
              </p>
              <div className="space-y-2 text-sm opacity-80">
                <p>• Glass strength: 0.6 with noise overlay</p>
                <p>• Canvas: Immersive preset with particles</p>
                <p>• Background blur should be visible</p>
                <p>• No hydration mismatches should occur</p>
              </div>
            </GlassCardAtomic>

            <GlassCardAtomic
              variant="overlay"
              strength={0.5}
              hover={true}
              className="p-8"
            >
              <h3 className="text-xl font-bold mb-4">Performance Monitor</h3>
              <p className="mb-4">
                Hover over this card to test performance with both canvas
                animations and glass hover effects running simultaneously.
              </p>
              <div className="space-y-2 text-sm opacity-80">
                <p>• Hover effects enabled</p>
                <p>• Real-time canvas rendering</p>
                <p>• Multiple backdrop-filter layers</p>
                <p>• Should maintain 60fps performance</p>
              </div>
            </GlassCardAtomic>
          </div>
        </div>
      </div>
    </div>
  );
}
