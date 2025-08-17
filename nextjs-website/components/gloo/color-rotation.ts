/**
 * Color Rotation Utilities for Gloo
 * Implements HSL-based color rotation for time-evolving palettes
 */

// Convert RGB to HSL
export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h: number, s: number, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
}

// Convert HSL to RGB
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  if (s === 0) {
    return [l, l, l]; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = hue2rgb(p, q, h + 1/3);
    const g = hue2rgb(p, q, h);
    const b = hue2rgb(p, q, h - 1/3);
    return [r, g, b];
  }
}

// Rotate hue by degrees
export function rotateHue(rgb: number[], degrees: number): number[] {
  const [r, g, b] = rgb;
  const [h, s, l] = rgbToHsl(r, g, b);
  
  // Rotate hue and wrap around 360 degrees
  const newHue = (h + degrees) % 360;
  
  const [newR, newG, newB] = hslToRgb(newHue, s, l);
  return [newR, newG, newB];
}

// Get time-based hue rotation (360° in specified minutes)
export function getTimeBasedHueRotation(durationMinutes: number = 60): number {
  const now = Date.now();
  const millisecondsInCycle = durationMinutes * 60 * 1000;
  const cyclePosition = (now % millisecondsInCycle) / millisecondsInCycle;
  return cyclePosition * 360; // 0 to 360 degrees
}

// Color rotation presets for designers
export const COLOR_ROTATION_PRESETS = {
  static: { enabled: false, duration: 0 },
  subtle: { enabled: true, duration: 120 }, // 2 hours for full rotation
  normal: { enabled: true, duration: 60 },  // 1 hour for full rotation
  dynamic: { enabled: true, duration: 30 }, // 30 minutes for full rotation
  fast: { enabled: true, duration: 10 },    // 10 minutes for full rotation
  realtime: { enabled: true, duration: 1 }  // 1 minute for testing
};

// Apply time-based color rotation to a color palette
export function applyColorRotation(
  baseColors: number[][],
  rotationPreset: keyof typeof COLOR_ROTATION_PRESETS = 'normal'
): number[][] {
  const preset = COLOR_ROTATION_PRESETS[rotationPreset];
  
  if (!preset.enabled) {
    return baseColors;
  }
  
  const rotation = getTimeBasedHueRotation(preset.duration);
  
  return baseColors.map(color => rotateHue(color, rotation));
}

// Get human-readable description of rotation
export function describeColorRotation(
  rotationPreset: keyof typeof COLOR_ROTATION_PRESETS
): string {
  const preset = COLOR_ROTATION_PRESETS[rotationPreset];
  
  if (!preset.enabled) {
    return 'Static colors';
  }
  
  if (preset.duration >= 120) {
    return 'Very slow color evolution';
  } else if (preset.duration >= 60) {
    return 'Slow color evolution';
  } else if (preset.duration >= 30) {
    return 'Moderate color evolution';
  } else if (preset.duration >= 10) {
    return 'Fast color evolution';
  } else {
    return 'Rapid color evolution';
  }
}