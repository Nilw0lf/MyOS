import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        surface2: "var(--surface2)",
        text: "var(--text)",
        muted: "var(--muted)",
        border: "var(--border)",
        accent: "var(--accent)",
        accent2: "var(--accent2)",
        danger: "var(--danger)",
      },
      boxShadow: {
        soft: "0 10px 30px var(--shadow)",
        lifted: "0 12px 30px rgba(15, 23, 42, 0.12)",
      },
      borderRadius: {
        xl: "1.25rem",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
