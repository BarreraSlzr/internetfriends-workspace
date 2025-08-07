import animate from "tailwindcss-animate";

const config: Config = {

  content: [

    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class", "[data-theme='dark']"],
  theme: {

    extend: {

      colors: {

        // InternetFriends brand colors
        "if-primary": "var(--if-primary)",
        "if-primary-hover": "var(--if-primary-hover)",
        "if-primary-light": "var(--if-primary-light)",
        "if-primary-active": "var(--if-primary-active)",

        // Brand blue palette
        "brand-blue": {
          "100": "hsl(var(--brand-blue-100))",
          "200": "hsl(var(--brand-blue-200))",
          "300": "hsl(var(--brand-blue-300))",
          "400": "hsl(var(--brand-blue-400))",
          "500": "hsl(var(--brand-blue-500))",
          "600": "hsl(var(--brand-blue-600))",
          "700": "hsl(var(--brand-blue-700))",
          "800": "hsl(var(--brand-blue-800))",
          "900": "hsl(var(--brand-blue-900))",
        },

        // Glass morphism colors
        glass: {

          header: "var(--glass-bg-header)",
          "header-scrolled": "var(--glass-bg-header-scrolled)",
          border: "var(--glass-border)",
          "border-enhanced": "var(--glass-border-enhanced)",
          "border-outset": "var(--glass-border-outset)",
        },

        // Coin of value system colors
        text: {

          primary: "var(--color-text-primary)",
          contrast: "var(--color-text-contrast)",
        },
        bg: {

          primary: "var(--color-bg-primary)",
          glass: "var(--color-bg-glass)",
        },
        "border-focus": "var(--color-border-focus)",

        // shadcn/ui colors
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {

          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {

          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {

          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {

          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {

          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {

          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {

          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {

          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },

      borderRadius: {

        // InternetFriends compact radius system
        "compact-xs": "var(--radius-xs)", // 4px
        "compact-sm": "var(--radius-sm)", // 6px
        "compact-md": "var(--radius-md)", // 8px
        "compact-lg": "var(--radius-lg)", // 12px
        "compact-xl": "var(--radius-lg)", // 12px - same as lg (max for InternetFriends)

        // Standard shadcn radius
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      spacing: {

        // Compact spacing system (0.25rem increments)
        "0.5": "0.125rem", // 2px
        "1.5": "0.375rem", // 6px
        "2.5": "0.625rem", // 10px
        "3.5": "0.875rem", // 14px
        "4.5": "1.125rem", // 18px
        "5.5": "1.375rem", // 22px
      },

      backdropBlur: {

        glass: "12px",
      },

      animation: {

        "glass-float": "glass-float 6s ease-in-out infinite",
        tilt: "tilt 10s infinite linear",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
      },

      keyframes: {

        "glass-float": {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },
        tilt: {

          "0%, 50%, 100%": {
            transform: "rotate(0deg)",
          },
          "25%": {
            transform: "rotate(3deg)",
          },
          "75%": {
            transform: "rotate(-3deg)",
          },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
        "slide-up": {
          "0%": {
            transform: "translateY(20px)",
            opacity: "0",
          },
          "100%": {
            transform: "translateY(0)",
            opacity: "1",
          },
        },
        "scale-in": {
          "0%": {
            transform: "scale(0.95)",
            opacity: "0",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1",
          },
        },
      },

      boxShadow: {

        glass: "0 4px 20px rgba(0, 0, 0, 0.08)",
        "glass-hover": "0 8px 32px rgba(0, 0, 0, 0.12)",
        "if-primary": "0 4px 12px rgba(59, 130, 246, 0.25)",
        "if-primary-active": "0 2px 4px rgba(59, 130, 246, 0.25)",
      },

      fontFamily: {

        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "Menlo", "Monaco", "monospace"],
      },

      typography: {

        DEFAULT: {

          css: {

            maxWidth: "none",
            color: "var(--color-text-primary)",
            "--tw-prose-body": "var(--color-text-primary)",
            "--tw-prose-headings": "var(--color-text-contrast)",
            "--tw-prose-lead": "var(--color-text-primary)",
            "--tw-prose-links": "var(--if-primary)",
            "--tw-prose-bold": "var(--color-text-contrast)",
            "--tw-prose-counters": "var(--color-text-primary)",
            "--tw-prose-bullets": "var(--if-primary)",
            "--tw-prose-hr": "var(--glass-border)",
            "--tw-prose-quotes": "var(--color-text-primary)",
            "--tw-prose-quote-borders": "var(--if-primary)",
            "--tw-prose-captions": "var(--color-text-primary)",
            "--tw-prose-code": "var(--color-text-contrast)",
            "--tw-prose-pre-code": "var(--color-text-primary)",
            "--tw-prose-pre-bg": "var(--color-bg-glass)",
            "--tw-prose-th-borders": "var(--glass-border)",
            "--tw-prose-td-borders": "var(--glass-border)",
          },
        },
      },
    },
  },
  plugins: [

    animate,
    // Custom plugin for InternetFriends utilities
    function ({ addUtilities, addComponents, theme }: unknown) {
      addComponents({)
        ".glass-morphism": {)
          "backdrop-filter": "blur(12px)",
          "-webkit-backdrop-filter": "blur(12px)",
          border: "1px solid var(--glass-border)",
          transition: "all 0.3s ease",
        },
        ".focus-dashed": {
          "&:focus": {
            outline: "none",
            border: "2px dashed var(--color-border-focus)",
            "border-radius": "var(--radius-sm)",
          },
        },
        ".btn-if-primary": {
          background: "var(--if-primary)",
          color: "white",
          border: "none",
          "border-radius": "var(--radius-md)",
          padding: "0.5rem 1rem",
          "font-weight": "500",
          transition: "all 0.2s ease",
          cursor: "pointer",
          "&:hover": {
            background: "var(--if-primary-hover)",
            transform: "translateY(-1px)",
            "box-shadow": "0 4px 12px rgba(59, 130, 246, 0.25)",
          },
          "&:active": {
            background: "var(--if-primary)",
            transform: "translateY(0)",
            "box-shadow": "0 2px 4px rgba(59, 130, 246, 0.25)",
          },
        },
      });

      addUtilities({
        ".flex-no-break": {
          display: "flex",
          "flex-wrap": "nowrap",
          "overflow-x": "auto",
          gap: "0.5rem",
          "& > *": {
            "flex-shrink": "0",
            "min-width": "max-content",
          },
        },
        ".scrollbar-if": {
          "&::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },)
          "&::-webkit-scrollbar-thumb": {)
            background: "var(--if-primary)",
            "border-radius": "var(--radius-lg)",
          },
          "&::-webkit-scrollbar-thumb: hover": {

            background: "var(--if-primary-hover)",
          },
        },
      });
    },
  ],

export default config;
