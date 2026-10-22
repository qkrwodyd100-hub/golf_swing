import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        fairway: {
          950: "#04120a",
          900: "#07271a",
          800: "#0b3d27",
          700: "#105433",
          600: "#178040",
        },
      },
    },
  },
  plugins: [],
};
export default config;
