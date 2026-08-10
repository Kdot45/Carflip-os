import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          50: "#eff9f3",
          100: "#d7f0e1",
          400: "#34b871",
          500: "#1e9e5a",
          600: "#178049",
          700: "#136640",
        },
        good: "#178049",
        marginal: "#b45309",
        bad: "#b91c1c",
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
