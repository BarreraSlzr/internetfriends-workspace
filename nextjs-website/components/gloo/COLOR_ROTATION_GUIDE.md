# 🎨 Gloo Color Rotation System

## Overview

The Gloo Color Rotation system adds time-based hue shifting to WebGL background effects, creating slowly evolving color palettes that cycle through the entire spectrum. This is **separate from effect speed** and creates mesmerizing, ever-changing backgrounds.

## How It Works

### 🔄 **HSL Color Rotation**
- Converts RGB colors to HSL (Hue, Saturation, Lightness)
- Rotates the **Hue** component over time (0° to 360°)
- Preserves **Saturation** and **Lightness** for consistent vibrancy
- Converts back to RGB for WebGL rendering

### ⏰ **Time-Based Rotation**
- **360° rotation in configurable duration** (default: 1 hour)
- Uses `Date.now()` for consistent timing across page reloads
- Synchronized across all components using the same preset

## Color Rotation vs Effect Speed

| Aspect | Effect Speed | Color Rotation |
|--------|--------------|----------------|
| **Purpose** | Controls movement/animation speed | Controls color evolution speed |
| **Range** | 0.1-0.5 (movement personality) | 1-120 minutes (hue cycle time) |
| **Visual Impact** | Calm ↔ Energetic | Static ↔ Rainbow cycling |
| **Technical** | Affects `iTime * speed` in shader | Rotates RGB→HSL→RGB in JS |

## Rotation Presets

```typescript
export const COLOR_ROTATION_PRESETS = {
  static: { enabled: false, duration: 0 },        // No rotation
  subtle: { enabled: true, duration: 120 },       // 2 hours per cycle
  normal: { enabled: true, duration: 60 },        // 1 hour per cycle ⭐
  dynamic: { enabled: true, duration: 30 },       // 30 minutes per cycle
  fast: { enabled: true, duration: 10 },          // 10 minutes per cycle
  realtime: { enabled: true, duration: 1 }        // 1 minute (for testing)
};
```

## Usage Examples

### Basic Usage
```tsx
import { BgGooRotating } from '@/components/gloo/rotating-gloo';

// Default: 1 hour color cycle
<BgGooRotating 
  speed={0.3}              // Effect movement speed
  colorRotation="normal"   // Color evolution speed
  showControls={true}      // Show rotation controls
/>
```

### Design Professional Interface
```tsx
// Corporate website - very slow color evolution
<BgGooRotating 
  speed={0.2}              // Elegant, slow movement
  colorRotation="subtle"   // 2-hour color cycle
  context="corporate"
/>

// Creative portfolio - dynamic colors
<BgGooRotating 
  speed={0.4}              // Energetic movement  
  colorRotation="dynamic"  // 30-minute color cycle
  context="artistic"
/>

// Event/festival - rapid rainbow cycling
<BgGooRotating 
  speed={0.5}              // Fast movement
  colorRotation="fast"     // 10-minute color cycle
  context="festival"
/>
```

## Design Token Integration

The rotation system integrates with our design token system:

```typescript
interface GlooDesignToken {
  description: {
    mood: 'elegant' | 'energetic' | 'calm' | 'dramatic' | 'playful';
    intensity: 'subtle' | 'moderate' | 'bold';
    movement: 'gentle' | 'flowing' | 'dynamic' | 'pulsing';
    colors: 'static' | 'evolving' | 'rainbow' | 'shifting';  // ← New!
    colorEvolution: 'none' | 'subtle' | 'normal' | 'dynamic' | 'fast';
  };
  
  params: {
    // ... existing params
    colorRotation: keyof typeof COLOR_ROTATION_PRESETS;
  };
}
```

## What Designers See

**Control Interface:**
```
┌─────────────────────────┐
│ Color Evolution         │
├─────────────────────────┤
│ [Static] [Subtle] [●Normal] │
│ [Dynamic] [Fast] [Realtime] │
├─────────────────────────┤
│ Slow color evolution    │
└─────────────────────────┘
```

**Human-Readable Descriptions:**
- **Static**: "Colors stay the same"
- **Subtle**: "Very slow color evolution" (2 hours)
- **Normal**: "Slow color evolution" (1 hour) ⭐ **Recommended**
- **Dynamic**: "Moderate color evolution" (30 min)
- **Fast**: "Fast color evolution" (10 min)
- **Realtime**: "Rapid color evolution" (1 min)

## Technical Implementation

### Color Conversion Functions
```typescript
// RGB → HSL conversion
rgbToHsl(r: number, g: number, b: number): [number, number, number]

// HSL → RGB conversion  
hslToRgb(h: number, s: number, l: number): [number, number, number]

// Rotate hue by degrees
rotateHue(rgb: number[], degrees: number): number[]

// Get time-based rotation angle
getTimeBasedHueRotation(durationMinutes: number): number
```

### Animation Loop Integration
```typescript
// In the WebGL render loop
const rotatedColors = useMemo(() => {
  return applyColorRotation(baseColors, currentRotation);
}, [baseColors, currentRotation]);

// Update uniforms with rotated colors
gl.uniform3fv(color1Location, new Float32Array(rotatedColors[0]));
gl.uniform3fv(color2Location, new Float32Array(rotatedColors[1]));
gl.uniform3fv(color3Location, new Float32Array(rotatedColors[2]));
```

## Answers to Your Questions

### 🔄 **"Can we rotate colors somehow using the hue?"**
**Yes!** The system converts RGB → HSL, rotates the hue component (0°-360°), then converts back to RGB.

### ⏱️ **"360 degree rotation in one hour?"**
**Yes!** The `normal` preset does exactly this - complete hue cycle in 60 minutes.

### 🏃 **"Is this related to speed too?"**
**No!** Color rotation is independent of effect speed:
- **Effect Speed**: Controls how fast the shapes move/morph
- **Color Rotation**: Controls how fast colors evolve through the spectrum

You can have:
- Slow movement (`speed: 0.2`) + Fast color rotation (`fast`)
- Fast movement (`speed: 0.5`) + Static colors (`static`)
- Any combination!

## Real-World Examples

**Corporate Landing Page:**
```tsx
<BgGooRotating 
  speed={0.2}              // Elegant, calm movement
  colorRotation="subtle"   // Very slow color changes (2 hours)
  depth={2}                // Clean, professional
/>
```

**Art Gallery Website:**
```tsx
<BgGooRotating 
  speed={0.3}              // Moderate movement
  colorRotation="normal"   // Standard color evolution (1 hour)
  depth={3}                // Rich, detailed
/>
```

**Music Festival Site:**
```tsx
<BgGooRotating 
  speed={0.4}              // Dynamic movement
  colorRotation="dynamic"  // Fast color shifts (30 min)
  depth={2}                // Balanced complexity
/>
```

The result is a living, breathing background that subtly evolves throughout a user's visit, creating a unique experience each time! 🌈✨