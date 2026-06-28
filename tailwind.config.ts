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
        "camp-blue": "#C3E3F0",
        "camp-card": "#FAF7F2",
        "camp-purple": "#9333EA",
        "camp-purple-dark": "#7E22CE",
        "camp-teal": "#14B8A6",
        "camp-teal-dark": "#0F766E",
        "camp-gray": "#E5E7EB",
        "camp-gray-dark": "#9CA3AF",
        "camp-slate": "#1E293B",
        paper: "#FAF7F2",
        ink: "#1E293B",
        "purple-accent": "#9333EA",
        "gold-accent": "#F5B942",
        "teal-accent": "#14B8A6",
        "success-accent": "#22C55E",
      },
      fontFamily: {
        display: ["var(--font-nunito)", "system-ui", "sans-serif"],
        sans: ["var(--font-nunito)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "pushable-purple": "0 6px 0 0 #7E22CE",
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
