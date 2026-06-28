import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        card: "var(--card)",
        body: "var(--text)",
        muted: "var(--muted)",
        border: "var(--border)",
        "surface-muted": "var(--surface-muted)",
        primary: "var(--primary)",
        "primary-dark": "var(--primary-dark)",
        secondary: "var(--secondary)",
        "secondary-dark": "var(--secondary-dark)",
        highlight: "var(--highlight)",
        success: "var(--success)",
        "camp-blue": "var(--background)",
        "camp-card": "var(--card)",
        "camp-purple": "var(--primary)",
        "camp-purple-dark": "var(--primary-dark)",
        "camp-teal": "var(--secondary)",
        "camp-teal-dark": "var(--secondary-dark)",
        "camp-gray": "var(--surface-muted)",
        "camp-gray-dark": "var(--muted)",
        "camp-slate": "var(--text)",
        paper: "var(--card)",
        ink: "var(--text)",
        "purple-accent": "var(--primary)",
        "gold-accent": "var(--highlight)",
        "teal-accent": "var(--secondary)",
        accent: "var(--highlight)",
        "success-accent": "var(--success)",
      },
      fontSize: {
        body: "var(--text-body)",
        h2: "var(--text-h2)",
        h1: "var(--text-h1)",
      },
      fontFamily: {
        display: ["var(--font-nunito)", "Nunito", "system-ui", "sans-serif"],
        sans: ["var(--font-open-sans)", "Open Sans", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "0.625rem",
      },
      transitionTimingFunction: {
        decel: "var(--ease-decel)",
      },
      boxShadow: {
        "pushable-purple": "0 6px 0 0 var(--primary-dark)",
        "pushable-teal": "0 6px 0 0 var(--secondary-dark)",
        "pushable-gray": "0 6px 0 0 oklch(0.62 0.025 265)",
        "pushable-pressed": "0 0px 0 0 transparent",
        "bento-card": "0 8px 32px -4px oklch(0.28 0.04 265 / 0.08)",
        bento: "0 8px 32px -4px oklch(0.28 0.04 265 / 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
