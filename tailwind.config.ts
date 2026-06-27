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
        paper: "#FAF7F2",
        "camp-blue": "#C3E3F0",
        ink: "#2D2A26",
        "purple-accent": "#7C3AED",
        "gold-accent": "#F5B942",
        "teal-accent": "#14B8A6",
        "success-accent": "#22C55E",
      },
      fontFamily: {
        display: ["var(--font-nunito)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        bento: "0 8px 32px -8px rgba(45, 42, 38, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
