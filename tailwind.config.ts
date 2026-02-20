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
        navy: {
          900: "#3B0010",
          800: "#5E001A",
          700: "#800024",
          600: "#9E0A30",
          500: "#BC1C42",
          400: "#D44A6A",
          300: "#E47F96",
          200: "#EFB3C0",
          100: "#F8DDE3",
          50:  "#FDF0F2",
        },
        gold: {
          600: "#D97706",
          500: "#F59E0B",
          400: "#FBBF24",
          300: "#FCD34D",
          200: "#FDE68A",
          100: "#FEF3C7",
          50:  "#FFFBEB",
        },
        success: "#10B981",
        warning: "#F59E0B",
        error:   "#EF4444",
        info:    "#3B82F6",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 12px 0 rgba(0,0,0,0.10), 0 2px 4px -1px rgba(0,0,0,0.06)",
        modal: "0 20px 60px -10px rgba(0,0,0,0.25)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.2s ease-out",
        "slide-in-right": "slideInRight 0.25s ease-out",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(16px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
