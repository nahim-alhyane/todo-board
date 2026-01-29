"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="relative w-14 h-14 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm border border-border/50 overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
      aria-label="Toggle theme"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative w-full h-full flex items-center justify-center">
        <div
          className={`absolute transition-all duration-500 ${
            isDark
              ? "opacity-0 rotate-180 scale-0"
              : "opacity-100 rotate-0 scale-100"
          }`}
        >
          <Sun className="w-5 h-5 text-amber-500" />
        </div>
        <div
          className={`absolute transition-all duration-500 ${
            isDark
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 -rotate-180 scale-0"
          }`}
        >
          <Moon className="w-5 h-5 text-indigo-400" />
        </div>
      </div>

      <div
        className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-500 ${
          isDark
            ? "from-indigo-500/10 to-purple-500/10 opacity-100"
            : "from-amber-500/10 to-orange-500/10 opacity-100"
        }`}
      />
    </button>
  );
}
