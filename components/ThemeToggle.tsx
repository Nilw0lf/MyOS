"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import clsx from "clsx";

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("myos_theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldDark = stored ? stored === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", shouldDark);
    setIsDark(shouldDark);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("myos_theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      className={clsx(
        "btn-ghost w-10 justify-center rounded-full border border-border",
        "hover:bg-surface2"
      )}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
};
