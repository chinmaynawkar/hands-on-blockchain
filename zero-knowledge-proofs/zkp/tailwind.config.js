/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        mono: ["Space Mono", "monospace"],
        oxanium: ["Oxanium", "sans-serif"],
      },
      colors: {
        // Web3 Glitch color palette
        cyber: {
          dark: "#0a0a0f",
          darker: "#050508",
          primary: "#00ff9f",
          secondary: "#ff0080",
          accent: "#00c4ff",
          warning: "#fbbf24",
          purple: "#8b5cf6",
          pink: "#ec4899",
        },
        neon: {
          green: "#39ff14",
          blue: "#00ffff",
          purple: "#bf00ff",
          pink: "#ff006e",
          orange: "#ff8c00",
        },
      },
      animation: {
        glitch: "glitch 0.3s ease-in-out infinite alternate",
        flicker: "flicker 2s linear infinite",
        "pulse-neon": "pulse-neon 2s ease-in-out infinite alternate",
        "slide-up": "slide-up 0.5s ease-out",
      },
      keyframes: {
        glitch: {
          "0%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-2px, -2px)" },
          "60%": { transform: "translate(2px, 2px)" },
          "80%": { transform: "translate(2px, -2px)" },
          "100%": { transform: "translate(0)" },
        },
        flicker: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.8 },
        },
        "pulse-neon": {
          "0%": {
            boxShadow:
              "0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor",
          },
          "100%": {
            boxShadow:
              "0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor",
          },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
