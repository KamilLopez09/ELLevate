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
        primary: "var(--primary)",
        accent: "var(--accent)",
        background: "var(--background)",
        card: "var(--card)",
        body: "var(--text)",
        muted: "var(--muted)",
        border: "var(--border)",
        "camp-blue": "var(--background)",
        "camp-card": "var(--card)",
        "camp-purple": "var(--primary)",
        "camp-purple-dark": "#15528d",
        "camp-teal": "#14B8A6",
        "camp-teal-dark": "#0F766E",
        "camp-gray": "#E5E7EB",
        "camp-gray-dark": "#9CA3AF",
        "camp-slate": "var(--text)",
        paper: "var(--card)",
        ink: "var(--text)",
        "purple-accent": "var(--primary)",
        "gold-accent": "var(--accent)",
        "teal-accent": "#14B8A6",
        "success-accent": "#16a34a",
      },
      fontFamily: {
        display: ["var(--font-nunito)", "Nunito", "system-ui", "sans-serif"],
        sans: ["var(--font-open-sans)", "Open Sans", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "0.625rem",
      },
      boxShadow: {
        "pushable-purple": "0 6px 0 0 #15528d",
        "pushable-teal": "0 6px 0 0 #0F766E",
        "pushable-gray": "0 6px 0 0 #9CA3AF",
        "pushable-pressed": "0 0px 0 0 transparent",
        "bento-card": "0 8px 32px -4px rgba(0, 0, 0, 0.08)",
        bento: "0 8px 32px -4px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
