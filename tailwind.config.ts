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
        "pushable-gray": "0 6px 0 0 #9aa8bf",
        "pushable-pressed": "0 0px 0 0 transparent",
        "bento-card": "0 8px 32px -4px rgba(26, 39, 68, 0.08)",
        bento: "0 12px 40px -8px rgba(26, 39, 68, 0.1), 0 4px 16px -4px rgba(26, 39, 68, 0.06)",
        "bento-purple":
          "0 14px 44px -10px rgba(26, 95, 168, 0.18), 0 6px 20px -6px rgba(26, 39, 68, 0.07)",
        "bento-teal":
          "0 14px 44px -10px rgba(26, 143, 122, 0.18), 0 6px 20px -6px rgba(26, 39, 68, 0.07)",
        "bento-gold":
          "0 14px 44px -10px rgba(240, 165, 0, 0.2), 0 6px 20px -6px rgba(26, 39, 68, 0.07)",
      },
    },
  },
  plugins: [],
};

export default config;
