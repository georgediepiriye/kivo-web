/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],

  // 🔥 ADD THIS BLOCK
  safelist: [
    "bg-yellow-100",
    "text-yellow-800",
    "bg-green-100",
    "text-green-800",
    "bg-blue-100",
    "text-blue-800",
    "bg-purple-100",
    "text-purple-800",
    "bg-orange-100",
    "text-orange-800",
    "bg-pink-100",
    "text-pink-800",
    "bg-indigo-100",
    "text-indigo-800",
    "bg-teal-100",
    "text-teal-800",
    "bg-amber-100",
    "text-amber-800",
    "bg-rose-100",
    "text-rose-800",
    "bg-gray-200",
    "text-gray-800",
    "bg-lime-100",
    "text-lime-800",
    "bg-violet-100",
    "text-violet-800",
    "bg-cyan-100",
    "text-cyan-800",
    "bg-emerald-100",
    "text-emerald-800",
  ],

  theme: {
    extend: {
      colors: {
        primary: "#715800",
        "primary-container": "#f8d472",
        "primary-fixed-dim": "#e9c666",

        secondary: "#88494d",
        "secondary-container": "#ffc3c4",

        surface: "#f5f6f7",
        "on-surface": "#2c2f30",
      },
    },
  },

  plugins: [],
};
