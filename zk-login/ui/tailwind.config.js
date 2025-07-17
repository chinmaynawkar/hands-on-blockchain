/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cyberBg: "#0d0d0d",
        neon: "#19f9d8",
        magenta: "#ff005b",
      },
    },
  },
  plugins: [],
};
