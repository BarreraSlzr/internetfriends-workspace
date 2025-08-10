// InternetFriends Design System - Accent Token Types
// TypeScript types for accent system integration with SCSS

export type AccentToken =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export interface AccentProps {
  accent?: AccentToken;
}

export interface AccentVariant {
  name: AccentToken;
  color: string;
  hoverColor: string;
  lightBg: string;
  activeBg: string;
  contrastText: string;
}

export const ACCENT_TOKENS: Record<AccentToken, AccentVariant> = {
  primary: {
    name: "primary",
    color: "#3b82f6",
    hoverColor: "#2563eb",
    lightBg: "rgba(59, 130, 246, 0.08)",
    activeBg: "rgba(59, 130, 246, 0.12)",
    contrastText: "#ffffff",
  },
  success: {
    name: "success",
    color: "#16a34a",
    hoverColor: "#15803d",
    lightBg: "rgba(22, 163, 74, 0.08)",
    activeBg: "rgba(22, 163, 74, 0.12)",
    contrastText: "#ffffff",
  },
  warning: {
    name: "warning",
    color: "#d97706",
    hoverColor: "#b45309",
    lightBg: "rgba(217, 119, 6, 0.08)",
    activeBg: "rgba(217, 119, 6, 0.12)",
    contrastText: "#ffffff",
  },
  danger: {
    name: "danger",
    color: "#dc2626",
    hoverColor: "#b91c1c",
    lightBg: "rgba(220, 38, 38, 0.08)",
    activeBg: "rgba(220, 38, 38, 0.12)",
    contrastText: "#ffffff",
  },
  info: {
    name: "info",
    color: "#0ea5e9",
    hoverColor: "#0284c7",
    lightBg: "rgba(14, 165, 233, 0.08)",
    activeBg: "rgba(14, 165, 233, 0.12)",
    contrastText: "#ffffff",
  },
};

export const DEFAULT_ACCENT: AccentToken = "primary";

// Utility functions for accent tokens
export function getAccentColor(accent: AccentToken): string {
  return ACCENT_TOKENS[accent].color;
}

export function getAccentVariant(accent: AccentToken): AccentVariant {
  return ACCENT_TOKENS[accent];
}

export function isValidAccent(accent: string): accent is AccentToken {
  return Object.keys(ACCENT_TOKENS).includes(accent as AccentToken);
}

// CSS Custom Property names for accent tokens
export const ACCENT_CSS_VARS = {
  color: (accent: AccentToken) => `--accent-${accent}`,
  hover: (accent: AccentToken) => `--accent-${accent}-hover`,
  lightBg: (accent: AccentToken) => `--accent-${accent}-light-bg`,
  activeBg: (accent: AccentToken) => `--accent-${accent}-active-bg`,
  contrast: (accent: AccentToken) => `--accent-${accent}-contrast`,
} as const;

// Generate CSS custom properties for runtime
export function generateAccentCSSVars(): string {
  const rules: string[] = [];

  Object.values(ACCENT_TOKENS).forEach(variant => {
    const { name, color, hoverColor, lightBg, activeBg, contrastText } = variant;
    rules.push(
      `  ${ACCENT_CSS_VARS.color(name)}: ${color};`,
      `  ${ACCENT_CSS_VARS.hover(name)}: ${hoverColor};`,
      `  ${ACCENT_CSS_VARS.lightBg(name)}: ${lightBg};`,
      `  ${ACCENT_CSS_VARS.activeBg(name)}: ${activeBg};`,
      `  ${ACCENT_CSS_VARS.contrast(name)}: ${contrastText};`
    );
  });

  return `:root {\n${rules.join('\n')}\n}`;
}
