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
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        destructive: "var(--destructive)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          dark: "var(--primary-dark)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
          dark: "var(--secondary-dark)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        body: "var(--text)",
        highlight: "var(--highlight)",
        success: "var(--success)",
        "surface-muted": "var(--surface-muted)",
        "camp-blue": "var(--background)",
        "camp-card": "var(--card)",
        "camp-purple": "var(--primary)",
        "camp-purple-dark": "var(--primary-dark)",
        "camp-teal": "var(--secondary)",
        "camp-teal-dark": "var(--secondary-dark)",
        "camp-gray": "var(--surface-muted)",
        "camp-gray-dark": "var(--muted-foreground)",
        "camp-slate": "var(--text)",
        paper: "var(--card)",
        ink: "var(--text)",
        "purple-accent": "var(--primary)",
        "gold-accent": "var(--highlight)",
        "teal-accent": "var(--secondary)",
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
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
