/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: "#090a0f",
          900: "#0d0f17",
          850: "#121520",
          800: "#181b2a",
          700: "#22273d",
          600: "#323957",
        },
        brand: {
          cyan: "#06b6d4",
          emerald: "#10b981",
          rose: "#f43f5e",
          amber: "#f59e0b",
          violet: "#8b5cf6",
        },
      },
      boxShadow: {
        glow: "0 0 20px -5px rgba(6, 182, 212, 0.25)",
        "glow-rose": "0 0 20px -5px rgba(244, 63, 94, 0.25)",
      },
    },
  },
  plugins: [],
}
