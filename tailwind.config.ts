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
        /* Design-system ramps ("Tageslicht"). Semantic aliases
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

        ink: "var(--warm-900)",
        paper: "var(--warm-50)",
        yellow: { DEFAULT: "var(--yellow)", soft: "var(--yellow-soft)" },
        blue: { DEFAULT: "var(--blue)", soft: "var(--blue-soft)" },
        green: { DEFAULT: "var(--green)", soft: "var(--green-soft)" },
        pink: { DEFAULT: "var(--pink)", soft: "var(--pink-soft)" },
        peach: { soft: "var(--peach-soft)" },
        pine: "var(--pine)",
        edge: "var(--edge)",

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
        display: ["var(--font-display)", "Bricolage Grotesque", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "Instrument Sans", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "DM Mono", "ui-monospace", "monospace"],
        hand: ["var(--font-hand)", "Caveat", "cursive"],
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
        "hard-sm": "var(--shadow-hard-sm)",
        hard: "var(--shadow-hard)",
        "hard-lg": "var(--shadow-hard-lg)",
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
