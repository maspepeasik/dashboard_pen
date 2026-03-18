import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#09111F",
        mist: "#E8EEF8",
        ocean: "#0F766E",
        ember: "#F97316",
        night: "#0B1325",
        panel: "rgba(10, 19, 37, 0.72)",
        stroke: "rgba(148, 163, 184, 0.18)"
      },
      boxShadow: {
        panel: "0 18px 60px rgba(3, 10, 24, 0.35)"
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
