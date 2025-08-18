// Reads CSS custom properties for Gloo colors at runtime and converts to linear RGB.
export type RGB = [number, number, number];

export function getComputedVar(el: Element, name: string, fallback: string): string {
  const v = getComputedStyle(el as HTMLElement).getPropertyValue(name).trim();
  return v || fallback;
}

export function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function cssColorToLinearRGB(color: string): RGB {
  // Supports "rgb(r,g,b)" or "#rrggbb" minimal parsing
  if (color.startsWith('#') && color.length === 7) {
    const r = parseInt(color.slice(1,3), 16) / 255;
    const g = parseInt(color.slice(3,5), 16) / 255;
    const b = parseInt(color.slice(5,7), 16) / 255;
    return [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)];
  }
  const m = color.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
  if (m) {
    const r = parseInt(m[1], 10) / 255;
    const g = parseInt(m[2], 10) / 255;
    const b = parseInt(m[3], 10) / 255;
    return [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)];
  }
  return [srgbToLinear(1), srgbToLinear(1), srgbToLinear(1)];
}
