/* InternetFriends Contrast Audit Script */
/* WCAG compliance checking for dynamic accent system */

interface ContrastResult {
  pairing: string;
  foreground: string;
  background: string;
  ratio: number;
  level: 'AAA' | 'AA' | 'FAIL';
  recommendation?: string;
}

interface AuditReport {
  timestamp: string;
  totalPairings: number;
  passed: number;
  failed: number;
  results: ContrastResult[];
  summary: {
    aaa: number;
    aa: number;
    fail: number;
  };
}

// =================================================================
// COLOR UTILITIES
// =================================================================

/**
 * Parse HSL string to numbers
 * @param hslString - HSL string like "217 89% 60%"
 * @returns HSL object
 */
function parseHSL(hslString: string): { h: number; s: number; l: number } {
  const parts = hslString.trim().split(/\s+/);
  return {
    h: parseInt(parts[0]),
    s: parseFloat(parts[1].replace('%', '')),
    l: parseFloat(parts[2].replace('%', ''))
  };
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 1/6) {
    r = c; g = x; b = 0
