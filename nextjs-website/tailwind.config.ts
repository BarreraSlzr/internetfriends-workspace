import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Engineering Interface System Colors
        "system-blue": "var(--system-blue)",
        "system-blue-hover": "var(--system-blue-hover)",
        "system-blue-active": "var(--system-blue-active)",
        "system-blue-soft": "var(--system-blue-soft)",

        // Engineering Grays
        gray: {
          25: "var(--gray-025)",
          50: "var(--gray-050)",
        },

        // Semantic Status Colors
        status: {
          success: "var(--status-success)",
          warning: "var(--status-warning)",
          danger: "var(--status-danger)",
          info: "var(--status-info)",
        },

        // Surface System
        surface: {
          base: "var(--surface-base)",
          elevated: "var(--surface-elevated)",
          accent: "var(--surface-accent)",
        },

        // Border System
        border: {
          subtle: "var(--border-subtle)",
          standard: "var(--border-standard)",
          emphasis: "var(--border-emphasis)",
          focus: "var(--border-focus)",
        },

        // Text System
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
          link: "var(--text-link)",
          inverse: "var(--text-inverse)",
        },

        // shadcn/ui compatibility (mapped to engineering system)
        background: "var(--surface-base)",
        foreground: "var(--text-primary)",
        card: {
          DEFAULT: "var(--surface-elevated)",
          foreground: "var(--text-primary)",
        },
        primary: {
          DEFAULT: "var(--system-blue)",
          foreground: "var(--text-inverse)",
        },
        secondary: {
          DEFAULT: "var(--surface-elevated)",
          foreground: "var(--text-secondary)",
        },
        muted: {
          DEFAULT: "var(--surface-elevated)",
          foreground: "var(--text-tertiary)",
        },
      },

      spacing: {
        // Engineering spacing scale (4px base unit)
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        5: "var(--space-5)",
        6: "var(--space-6)",
        8: "var(--space-8)",
        10: "var(--space-10)",
        12: "var(--space-12)",
        16: "var(--space-16)",
      },

      borderRadius: {
        // Engineering radius system
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },

      boxShadow: {
        // Engineering shadow system
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        focus: "var(--shadow-focus)",
      },

      transitionDuration: {
        // Engineering animation system
        fast: "var(--duration-fast)",
        standard: "var(--duration-standard)",
        slow: "var(--duration-slow)",
      },

      transitionTimingFunction: {
        standard: "var(--easing-standard)",
        emphasis: "var(--easing-emphasis)",
      },

      maxWidth: {
        container: "var(--container-width)",
        content: "var(--content-width)",
      },

      height: {
        header: "var(--header-height)",
      },

      fontFamily: {
        sans: ["system-ui", "-apple-system", "sans-serif"],
        mono: ["Menlo", "Monaco", "monospace"],
      },
    },
  },
  plugins: [
    animate,
    // Engineering Interface Components
    function ({ addComponents }: any) {
      addComponents({
        ".btn-primary": {
          background: "var(--system-blue)",
          color: "var(--text-inverse)",
          border: "none",
          "border-radius": "var(--radius-md)",
          padding: "var(--space-2) var(--space-4)",
          "font-weight": "500",
          "font-size": "0.875rem",
          transition: "all var(--duration-standard) var(--easing-standard)",
          cursor: "pointer",
          display: "inline-flex",
          "align-items": "center",
          gap: "var(--space-2)",
          "&:hover": {
            background: "var(--system-blue-hover)",
            transform: "translateY(-1px)",
            "box-shadow": "var(--shadow-md)",
          },
          "&:active": {
            background: "var(--system-blue-active)",
            transform: "translateY(0)",
          },
        },
        ".btn-secondary": {
          background: "transparent",
          color: "var(--text-primary)",
          border: "1px solid var(--border-standard)",
          "border-radius": "var(--radius-md)",
          padding: "var(--space-2) var(--space-4)",
          "font-weight": "500",
          "font-size": "0.875rem",
          transition: "all var(--duration-standard) var(--easing-standard)",
          cursor: "pointer",
          "&:hover": {
            background: "var(--surface-elevated)",
            "border-color": "var(--border-emphasis)",
          },
        },
        ".card": {
          background: "var(--surface-base)",
          border: "1px solid var(--border-subtle)",
          "border-radius": "var(--radius-lg)",
          overflow: "hidden",
        },
        ".card-elevated": {
          background: "var(--surface-elevated)",
          border: "1px solid var(--border-standard)",
          "border-radius": "var(--radius-lg)",
          "box-shadow": "var(--shadow-sm)",
        },
        ".header": {
          height: "var(--header-height)",
          background: "var(--surface-base)",
          "border-bottom": "1px solid var(--border-subtle)",
          display: "flex",
          "align-items": "center",
          position: "sticky",
          top: "0",
          "z-index": "100",
        },
        ".container": {
          "max-width": "var(--container-width)",
          margin: "0 auto",
          padding: "0 var(--space-4)",
        },
        ".content-container": {
          "max-width": "var(--content-width)",
          margin: "0 auto",
        },
      });
    },
  ],
};

export default config;
