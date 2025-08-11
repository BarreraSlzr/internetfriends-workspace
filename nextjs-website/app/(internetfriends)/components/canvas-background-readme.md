# Canvas Background System

A stable, performant canvas-based background system that replaces the complex WebGL Gloo implementation with a simpler 2D canvas approach. This system maintains the same visual appeal and InternetFriends brand colors while providing better cross-browser compatibility and stability.

## Overview

The Canvas Background System provides:

- ✅ **Stable rendering** - No WebGL dependencies or Safari issues
- 🎨 **InternetFriends brand colors** - Same productive palette from the original
- 🎲 **Random effect selection** - Once-on-mount randomization for stable behavior
- 🔧 **Debug capabilities** - URL parameters for development and testing
- ⚡ **Performance monitoring** - FPS tracking and optimization
- 📱 **Responsive design** - Automatic canvas sizing with high-DPI support

## Usage

### Basic Implementation

```tsx
import { CanvasBackgroundClient } from "@/app/(internetfriends)/components/canvas-background-client";

// Basic usage
<CanvasBackgroundClient />

// With reduced motion support
<CanvasBackgroundClient disabled={reducedMotion} />

// With custom positioning
<CanvasBackgroundClient zIndex={-10} />

// With epic context tracking
<CanvasBackgroundClient 
  epicContext={{
    epicName: "canvas-migration-v1",
    epicPhase: "development"
  }}
/>
```

### Integration

The system is automatically integrated via `app/client-layout.tsx`:

```tsx
import { CanvasBackgroundClient } from "@/app/(internetfriends)/components/canvas-background-client";

export function ClientLayout() {
  return (
    <>
      <CanvasBackgroundClient />
      <ClientRUMWrapper />
    </>
  );
}
```

## Brand Colors

The system uses the same productive InternetFriends palette:

### Light Mode
- `#ebe75c` - InternetFriends yellow (235, 231, 92)
- `#df4843` - InternetFriends red (223, 72, 67)  
- `#eb40f0` - InternetFriends purple (235, 64, 240)

### Dark Mode
- `#ffeb70` - Brighter yellow for dark mode (255, 235, 112)
- `#ff5c57` - Brighter red for dark mode (255, 92, 87)
- `#ff54ff` - Brighter purple for dark mode (255, 84, 255)

## Canvas Effects

Four built-in effects provide visual variety:

1. **flowing_gradient** - Smooth radial gradient animations
2. **wave_pattern** - Flowing wave transformations
3. **particle_field** - Animated particle systems
4. **geometric_flow** - Grid-based geometric patterns

Effects are randomly selected on mount for stable, consistent behavior throughout the session.

## Debug Features

### URL Parameters

Control the canvas background behavior via URL parameters:

```bash
# Force specific effect (0-3)
?canvasEffect=1

# Show debug information
?canvasDebug=1

# Display FPS counter
?canvasFps=1

# Custom colors (comma-separated hex)
?canvasColors=#ff0000,#00ff00,#0000ff

# Animation speed multiplier (0.1-5.0)
?canvasSpeed=2.0

# Combined example
?canvasEffect=2&canvasDebug=1&canvasFps=1&canvasSpeed=0.5
```

### Development Tools

```bash
# Test canvas imports
bun -e "import('./app/(internetfriends)/components/canvas-background-client.tsx').then(m => console.log('Canvas ready:', Object.keys(m)))"

# Test debug overrides
bun -e "
const { getCanvasDebugOverrides } = require('./app/(internetfriends)/components/canvas-background-utils.ts');
console.log('Debug config:', getCanvasDebugOverrides());
"

# Monitor canvas effects
console.log('Available effects:', [
  'flowing_gradient',
  'wave_pattern', 
  'particle_field',
  'geometric_flow'
]);
```

## Performance

### Optimization Features

- **High-DPI support** - Automatic device pixel ratio handling
- **FPS monitoring** - Built-in performance tracking
- **Reduced motion** - Respects user accessibility preferences
- **Efficient rendering** - Optimized 2D canvas operations
- **Memory management** - Proper cleanup and resource handling

### Performance Monitoring

```tsx
import { CanvasPerformanceMonitor } from "./canvas-background-utils";

const monitor = new CanvasPerformanceMonitor();

// In animation loop
const fps = monitor.updateFPS();
console.log('Current FPS:', monitor.getFPS());
```

## Migration from WebGL Gloo

### What Changed

- ❌ **Removed:** Complex WebGL shaders and WebGL context management
- ❌ **Removed:** Safari-specific DPR clamping and precision issues  
- ❌ **Removed:** WebGL capability detection and fallbacks
- ✅ **Added:** Simple 2D canvas rendering
- ✅ **Added:** Universal browser compatibility
- ✅ **Added:** Improved debugging tools

### Benefits

1. **Stability** - No WebGL context loss or Safari issues
2. **Compatibility** - Works on all devices with canvas support
3. **Simplicity** - Easier to debug and maintain
4. **Performance** - Lower GPU requirements
5. **Reliability** - Consistent rendering across browsers

### Same Features Maintained

- ✅ InternetFriends brand colors
- ✅ Once-on-mount effect randomization
- ✅ Reduced motion support
- ✅ Epic context integration
- ✅ Debug URL parameters
- ✅ Development logging

## Configuration

### Default Settings

```ts
export const CANVAS_DEFAULTS = {
  speed: 1.0,
  opacity: 1.0,
  quality: "high",
  reducedMotionOpacity: 0.5,
} as const;
```

### Color Utilities

```ts
import { canvasColorUtils } from "./canvas-background-utils";

// Convert hex to rgba
const rgba = canvasColorUtils.hexToRgba("#ebe75c", 0.5);
// Result: "rgba(235, 231, 92, 0.5)"

// Add alpha to hex
const withAlpha = canvasColorUtils.hexWithAlpha("#ebe75c", "80");
// Result: "#ebe75c80"

// Create gradient stops
const stops = canvasColorUtils.createGradientStops(
  ["#ebe75c", "#df4843", "#eb40f0"], 
  [1, 0.5, 0.2]
);
```

## Testing

### Playwright Tests

Update selectors to target the new canvas system:

```ts
// Old WebGL selector
await page.waitForSelector('[data-testid="gloo-canvas"]');

// New canvas selector  
await page.waitForSelector('[data-testid="canvas-background"]');
```

### Debug Testing

```bash
# Test specific effect
npm run dev -- --experimental-https
# Navigate to: https://localhost:3000?canvasEffect=1&canvasDebug=1

# Performance testing
https://localhost:3000?canvasFps=1&canvasSpeed=2.0

# Color testing
https://localhost:3000?canvasColors=#ff0000,#00ff00,#0000ff&canvasDebug=1
```

## Troubleshooting

### Common Issues

**Canvas not appearing:**
- Check browser console for errors
- Verify `CanvasBackgroundClient` is imported in `client-layout.tsx`
- Ensure canvas 2D context is supported

**Performance issues:**
- Add `?canvasFps=1` to monitor frame rate
- Reduce `canvasSpeed` parameter
- Check for other expensive operations running

**Wrong colors:**
- Verify theme detection with `?canvasDebug=1`
- Check that brand colors match expected palette
- Ensure no CSS filters are interfering

### Debug Commands

```bash
# Check canvas support
bun -e "console.log('Canvas 2D supported:', !!(document.createElement('canvas').getContext('2d')))"

# Verify imports
bun -e "import('./app/(internetfriends)/components/canvas-background-client.tsx').catch(e => console.error('Import failed:', e))"

# Test color conversion
bun -e "
const { canvasColorUtils } = require('./app/(internetfriends)/components/canvas-background-utils.ts');
console.log('Yellow RGBA:', canvasColorUtils.hexToRgba('#ebe75c', 0.5));
"
```

## Epic Integration

The canvas background supports epic tracking for development workflows:

```tsx
<CanvasBackgroundClient 
  epicContext={{
    epicName: "canvas-migration-v1",
    epicPhase: "development" // "development" | "review" | "complete"
  }}
/>
```

Epic information appears in debug displays and development logs for tracking feature progress and performance metrics.

---

## Summary

The Canvas Background System provides a stable, maintainable replacement for the WebGL Gloo implementation while preserving all the visual appeal and brand consistency that makes InternetFriends backgrounds distinctive. The system is production-ready and includes comprehensive debugging tools for ongoing development and optimization.