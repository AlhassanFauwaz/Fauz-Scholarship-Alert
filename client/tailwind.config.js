/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#edf5f8",
          100: "#d9ebf2",
          200: "#b4d5e0",
          300: "#7eaebe",
          400: "#3f7587",
          500: "#0a2b3c",
          600: "#081f2e",
          700: "#061922",
          800: "#040f17",
          900: "#020a0f",
        },
        secondary: {
          50: "#eafaf1",
          100: "#d2f3df",
          200: "#a5e6c0",
          300: "#76d7a1",
          400: "#49c982",
          500: "#1c9c4d",
          600: "#167f3f",
          700: "#115f31",
          800: "#0b4223",
          900: "#072b16",
        },
      },
      boxShadow: {
        soft: "0 12px 30px rgba(10, 43, 60, 0.12)",
      },
    },
  },
  plugins: [],
};
