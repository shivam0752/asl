/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
    "./utils/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0D0D0D",
        surface: "#1A1A1A",
        gold: "#F5C542",
        "text-primary": "#FFFFFF",
        "text-secondary": "#888888",
        str: "#FF5E5E",
        int: "#5EA8FF",
        wis: "#A78BFA",
        vit: "#4ADE80",
        cha: "#F472B6",
        agi: "#FB923C",
      },
    },
  },
  plugins: [],
};