import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Instrument-panel dark surfaces, warm near-black (not pure black).
        ink: {
          950: "#0c0d0f",
          900: "#121316",
          800: "#17181c",
          700: "#1d1f24",
          600: "#24262b",
          500: "#2a2c30",
          400: "#3a3d43",
          300: "#6f7278",
          200: "#8f9095",
          100: "#c7c4bd",
          50: "#ece9e4",
        },
        // Primary brand accent — tachometer amber.
        accent: {
          50: "#fff4e8",
          100: "#ffe1bd",
          400: "#ff9a4d",
          500: "#ff8b3d",
          600: "#ff7a1a",
          700: "#e0651a",
        },
        // Secondary accent — digital-readout teal, used for positive numbers.
        teal: {
          50: "#e9fbf9",
          400: "#5ee0d0",
          500: "#35d0c0",
          600: "#22b3a4",
        },
        good: "#35d0c0",
        marginal: "#e0a83d",
        bad: "#ff5c5c",
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["ui-monospace", "SF Mono", "Menlo", "monospace"],
      },
      keyframes: {
        sweep: {
          from: { strokeDashoffset: "var(--sweep-from)" },
          to: { strokeDashoffset: "var(--sweep-to)" },
        },
      },
      animation: {
        sweep: "sweep 1.1s cubic-bezier(.2,.8,.2,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
