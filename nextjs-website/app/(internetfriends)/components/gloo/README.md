# 🎭 Gloo System - Epic WebGL Backgrounds

Epic-aware WebGL background system for InternetFriends, featuring theme-reactive palettes, effect cycling, and seamless integration with the InternetFriends design system.

## ⚠️ IMPORTANT: Centralized Configuration (2024)

**The Gloo system has been consolidated for steadiest addressability:**

### Production Usage (Recommended)
```tsx
import { GlooClient } from '@/app/(internetfriends)/components/gloo-client';

// Single, centralized background component
export default function Layout({ children }) {
  return (
    <div>
      <GlooClient />
      {children}
    </div>
  );
}
```

### Centralized Defaults
All productive parameters are now centralized in `config/gloo.defaults.ts`:
- **Speed**: 0.4 (smooth, non-distracting)
- **Resolution**: 2.0 (1.0 for Safari)
- **Depth**: 4 (visual interest without complexity)
- **Seed**: 2.4 (aesthetically pleasing patterns)
- **DPR**: Auto-clamps to 1.0 on Safari for stability

### Debug Parameter Overrides
Use URL parameters to override defaults for testing:
- `?glooEffect=3` - Force specific effect index
- `?glooDpr=1` - Override device pixel ratio
- `?glooResolution=1.0` - Override resolution
- `?glooDebug=1` - Enable debug mode and overlays

### Deprecated Components
- ❌ `GlooBackgroundSimple` - Use `GlooClient` instead
- ❌ `GlooIntegrationSimple` - Use `GlooClient` instead  
- ❌ `GlooGlobalOrganism` - Use `GlooClient` for consistency

## 🚀 Legacy Quick Start (For Reference)

```tsx
import { GlooGlobal } from '@/components/gloo';

// Simple usage - automatically uses InternetFriends brand palette
export default function Layout({ children }) {
  return (
    <div>
      <GlooGlobal />
      {children}
    </div>
  );
}
```

## 🎨 Features

### 🎯 Epic-Driven Development
- **Epic Context Integration**: Track visual impact metrics per epic
- **Phase-Aware Rendering**: Different behaviors for development/review/complete phases
- **Git Timeline Visualization**: Each palette change contributes to epic story

### 🌈 Theme-Aware Palettes
- **Automatic Theme Detection**: Seamlessly adapts to light/dark mode
- **InternetFriends Brand Colors**: Built-in integration with `--if-primary` and core brand palette
- **Multiple Generation Strategies**: Brand-triad, seeded-random, soft-glass, and more
- **Deterministic Randomization**: Seeded RNG for consistent results across sessions

### ⚡ Performance Optimized
- **WebGL Core**: Efficient shader-based rendering with minimal CPU overhead
- **Smart Recompilation**: Only recompiles shaders when necessary
- **Reduced Motion Support**: Respects `prefers-reduced-motion` automatically
- **Memory Management**: Proper cleanup and disposal of WebGL resources

### 🎪 Effect System
- **11 Built-in Effects**: Default, spiral, wave, vortex, pulse, ripple, twist, oscillate, fractal, swirl, bounce
- **Auto Effect Cycling**: Configurable automatic effect transitions
- **Named Effect Selection**: Use effect names instead of indices for better maintainability

## 📁 System Architecture

```
gloo/
├── index.ts                    # Barrel exports & quick setup helpers
├── types.ts                    # Epic-aware type definitions
├── core.ts                     # Framework-agnostic WebGL hook
├── effects.ts                  # GLSL effect functions
├── palette.ts                  # Theme-aware palette generation
├── canvas.atomic.tsx           # Atomic canvas component
├── global.organism.tsx         # Global background organism
└── README.md                   # This documentation
```

### Component Hierarchy
- **Organism**: `GlooGlobalOrganism` - Full-page background with theme integration
- **Atomic**: `GlooCanvasAtomic` - Pure WebGL canvas component
- **Hook**: `useGlooWebGL` - Framework-agnostic WebGL logic

## 🎨 Palette Strategies

### `brand-triad` (Default)
Uses InternetFriends core colors in a harmonious triad:
- Primary: `#3b82f6` (--if-primary)
- Secondary: `#9333ea` (violet)
- Accent: `#ec4899` (pink)

### `seeded-random`
Deterministic random selection from core brand colors:
```tsx
<GlooGlobal 
  paletteStrategy="seeded-random" 
  seed={12345} // Same seed = same colors
/>
```

### `soft-glass`
Theme-adaptive glass morphism palette:
- Light mode: Soft blues with high luminance
- Dark mode: Brighter blues with contrast boost

### `primary-accent`
Derives palette from a single anchor color:
```tsx
<GlooGlobal 
  paletteStrategy="primary-accent"
  palette={["#3b82f6"]} // Anchor color
/>
```

## 🎯 Epic Integration

### Basic Epic Setup
```tsx
import { GlooGlobal, createEpicGlooConfig } from '@/components/gloo';

const epicConfig = createEpicGlooConfig('database-manager-v1', 'development');

<GlooGlobal {...epicConfig} />
```

### Advanced Epic Tracking
```tsx
<GlooGlobal
  epicContext={{
    epicName: 'ai-agent-integration',
    epicPhase: 'review',
    epicMetrics: {
      visualImpact: {
        paletteChanges: 5,
        effectCycles: 12
      }
    }
  }}
  onEffectChange={(index, name) => {
    console.log(`🎭 Epic effect changed: ${name}`);
  }}
/>
```

## 🔧 Configuration Examples

### Subtle Background
```tsx
import { GlooQuick } from '@/components/gloo';

<GlooGlobal {...GlooQuick.Subtle()} />
```

### High Performance
```tsx
<GlooGlobal
  resolution={1.0}        // Lower spatial frequency
  depth={3}               // Fewer iterations
  speed={0.3}             // Slower animation
  preserveDrawingBuffer={false}
/>
```

### Dynamic Cycling
```tsx
<GlooGlobal
  autoEffectCycle={true}
  effectCycleMs={10000}   // Change every 10 seconds
  autoRegeneratePalette={true}
  paletteRegenerateMs={30000} // New palette every 30 seconds
/>
```

### Theme-Specific Palettes
```tsx
<GlooGlobal
  paletteLight={['#3b82f6', '#60a5fa', '#93c5fd']}
  paletteDark={['#60a5fa', '#3b82f6', '#1d4ed8']}
  paletteStrategy="brand-triad"
/>
```

## 🛠️ Development & Debugging

### Debug Overlay (Development Mode)
```tsx
<GlooGlobal
  epicContext={{
    epicName: 'debug-session',
    epicPhase: 'development'
  }}
/>
```

Shows real-time debug info in development:
- Current effect name and index
- Palette strategy and theme mode
- Epic context and metrics
- Effect cycle count

### Bun Development Commands

```bash
# Test palette generation
bun -e "
import { generateGlooPalette } from './app/(internetfriends)/components/gloo/palette';
const palette = generateGlooPalette({ 
  mode: 'dark', 
  strategy: 'seeded-random', 
  seed: 42 
});
console.log('Generated palette:', palette);
"

# Preview effect list
bun -e "
import { effectFunctions } from './app/(internetfriends)/components/gloo/effects';
console.log('Available effects:', effectFunctions.length);
"
```

## 🎨 Customization

### Custom Palette Colors
```tsx
<GlooGlobal
  palette={[
    '#ff6b6b',  // Custom red
    '#4ecdc4',  // Custom teal  
    '#45b7d1'   // Custom blue
  ]}
/>
```

### Custom Effect Timing
```tsx
<GlooGlobal
  speed={0.8}           // Animation speed multiplier
  resolution={2.5}      // Spatial frequency (higher = more detail)
  depth={7}             // Iteration depth (higher = more complex)
  seed={3.14}           // Offset seed for variation
/>
```

### Reduced Motion Handling
```tsx
<GlooGlobal
  reducedMotion={true}  // Force respect reduced motion
  still={false}         // Allow first frame render
/>
```

## 🔍 Type Safety

All components are fully typed with TypeScript:

```tsx
import type { 
  GlooGlobalProps,
  GlooPaletteStrategy,
  GlooEffectName,
  EpicGlooContext 
} from '@/components/gloo';

const config: GlooGlobalProps = {
  paletteStrategy: 'brand-triad', // ✅ Type-safe
  effectName: 'spiral',           // ✅ Type-safe  
  // effectName: 'invalid',       // ❌ TypeScript error
};
```

## 🚀 Performance Guidelines

### Best Practices
- Use `resolution={1.0}` and `depth={3}` for mobile devices
- Set `preserveDrawingBuffer={false}` unless you need canvas screenshots
- Use `still={true}` for static backgrounds
- Consider `autoEffectCycle={false}` for better performance

### Memory Management
The system automatically handles WebGL resource cleanup:
- Shaders are properly disposed when components unmount
- Animation frames are cancelled on cleanup  
- Uniform location cache is cleared on recompilation

## 🎭 Epic Philosophy

> "Every gloo palette tells a story. Every effect cycle tells a chapter. Every epic tells the complete book of your project's visual journey."

The Gloo system embodies epic-driven development by:
- **Visual Continuity**: Consistent brand-aware palettes across epic phases
- **Measurable Impact**: Track visual engagement metrics per epic
- **Story Progression**: Each palette and effect change contributes to the epic narrative
- **Timeline Visualization**: Git graph reflects visual evolution alongside code changes

## 📊 Browser Support

- ✅ Chrome/Edge (WebGL 1.0)
- ✅ Firefox (WebGL 1.0) 
- ✅ Safari (WebGL 1.0)
- ⚠️ Mobile Safari (reduced features on older iOS)
- ❌ IE11 (no WebGL support)

## 🤝 Contributing

When contributing to the Gloo system:

1. **Epic Context**: Always consider which epic your changes belong to
2. **Brand Consistency**: New palette strategies should respect InternetFriends colors
3. **Performance**: Test on mobile devices and lower-end hardware
4. **Accessibility**: Respect `prefers-reduced-motion` and provide fallbacks
5. **Type Safety**: Maintain comprehensive TypeScript definitions

## 🔧 WebGL Troubleshooting

### Quick Debug Checklist

If you don't see the Gloo background:

1. **Check if canvas exists**:
   ```js
   document.querySelector('[data-testid="gloo-canvas"]') !== null
   ```

2. **Verify WebGL context**:
   ```js
   const canvas = document.querySelector('[data-testid="gloo-canvas"]');
   const gl = canvas?.getContext('webgl') || canvas?.getContext('experimental-webgl');
   console.log('WebGL available:', !!gl);
   ```

3. **Enable debug mode**:
   Add `?glooDebug=1` to your URL to see:
   - High-contrast debug palette (red/green/blue)
   - WebGL debug overlay with context info
   - Enhanced console logging

4. **Check z-index layering**:
   ```js
   const gloo = document.querySelector('[data-gloo-global]');
   console.log('Z-index:', getComputedStyle(gloo).zIndex);
   ```

### Common Issues & Solutions

#### Issue: Canvas appears but no animation
**Symptoms**: Static/frozen WebGL canvas
**Solutions**:
- Check `data-gloo-playing="true"` attribute
- Verify reduced motion isn't active: `window.matchMedia('(prefers-reduced-motion: reduce)').matches`
- Pass `reducedMotion={false}` to force animation

#### Issue: Canvas behind other content
**Symptoms**: Gloo renders but invisible due to layering
**Solutions**:
- Increase z-index: `<GlooGlobal zIndex={0} />`
- Check for solid body backgrounds in CSS that occlude the canvas
- Verify no parent elements have `overflow: hidden` clipping the fixed canvas

#### Issue: WebGL context creation fails
**Symptoms**: "WebGL context not available" error
**Solutions**:
- Try incognito/private browsing (extensions/policies may block WebGL)
- Check browser WebGL status: visit `chrome://gpu/` or `about:support`
- Ensure hardware acceleration is enabled

#### Issue: Shader compilation errors
**Symptoms**: Red WebGL error overlay
**Solutions**:
- Check browser console for detailed GLSL errors
- Verify effect index is within bounds (0-10)
- Try different effect: `<GlooGlobal effectName="default" />`

### Debug Utilities

The system includes built-in debugging tools:

```js
// Available in development console
window.GlooDebug = {
  checkWebGL: () => {
    const canvas = document.querySelector('[data-testid="gloo-canvas"]');
    if (!canvas) return console.log('No canvas found');
    
    const gl = canvas.getContext('webgl');
    console.log('WebGL Info:', {
      vendor: gl?.getParameter(gl.VENDOR),
      renderer: gl?.getParameter(gl.RENDERER),
      version: gl?.getParameter(gl.VERSION)
    });
  },
  
  captureFrame: () => {
    const canvas = document.querySelector('[data-testid="gloo-canvas"]');
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'gloo-frame.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  },
  
  forceHighContrast: () => {
    // Temporarily override with debug palette
    const url = new URL(location);
    url.searchParams.set('glooDebug', '1');
    location.href = url.toString();
  }
};
```

### Performance Optimization

If Gloo affects page performance:

```tsx
// Reduced performance settings
<GlooGlobal
  resolution={1.0}        // Lower detail
  depth={3}               // Fewer iterations
  speed={0.2}             // Slower animation
  autoEffectCycle={false} // Static effect
  preserveDrawingBuffer={false}
/>
```

### Epic Debug Mode

In development, epic context provides enhanced debugging:

```tsx
<GlooGlobal
  epicContext={{
    epicName: "debug-session",
    epicPhase: "development"
  }}
/>
```

Shows real-time overlay with:
- Current effect and palette info
- Animation status
- Z-index value
- Reduced motion detection

---

**🎭 Remember**: This is not just a background system—it's a visual storytelling canvas for your epic journey.