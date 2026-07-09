import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        /* Design-system nav breakpoint: header links collapse below 860px. */
        nav: "860px",
      },
      colors: {
        /* Design-system ramps ("The Marquee"). Semantic aliases
           (--bg-page, --text-strong, …) are used via arbitrary values
           so they re-point automatically inside [data-theme="dark"]. */
        warm: {
          50: "var(--warm-50)",
          100: "var(--warm-100)",
          200: "var(--warm-200)",
          300: "var(--warm-300)",
          400: "var(--warm-400)",
          500: "var(--warm-500)",
          600: "var(--warm-600)",
          700: "var(--warm-700)",
          800: "var(--warm-800)",
          900: "var(--warm-900)",
        },
        amber: {
          300: "var(--amber-300)",
          400: "var(--amber-400)",
          500: "var(--amber-500)",
          600: "var(--amber-600)",
          700: "var(--amber-700)",
        },
        night: {
          600: "var(--night-600)",
          700: "var(--night-700)",
          800: "var(--night-800)",
          900: "var(--night-900)",
        },

        /* Legacy palette (admin area only). */
        background: "var(--background)",
        foreground: "var(--foreground)",
        gold: "var(--gold)",
        "gold-light": "var(--gold-light)",
        muted: "var(--muted)",
        "dark-card": "var(--dark-card)",
        "dark-border": "var(--dark-border)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Archivo", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "Hanken Grotesk", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "Spline Sans Mono", "ui-monospace", "monospace"],
      },
      maxWidth: {
        container: "var(--container)",
        "container-narrow": "var(--container-narrow)",
      },
      boxShadow: {
        "warm-sm": "var(--shadow-sm)",
        "warm-md": "var(--shadow-md)",
        "warm-lg": "var(--shadow-lg)",
        "warm-xl": "var(--shadow-xl)",
      },
      borderRadius: {
        ds: "var(--radius-md)",
        "ds-lg": "var(--radius-lg)",
        "ds-xl": "var(--radius-xl)",
      },
    },
  },
  plugins: [],
};
export default config;
