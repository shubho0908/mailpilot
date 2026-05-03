"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function LandingThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      type="button"
      aria-label={mounted && isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="cursor-pointer grid size-9 place-items-center rounded-md border border-[var(--landing-border)] bg-[var(--landing-panel)] text-[var(--landing-muted)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-[var(--landing-border-strong)] hover:text-[var(--landing-text)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--landing-focus)] active:scale-[0.98]"
      suppressHydrationWarning
    >
      {mounted && isDark ? (
        <Sun className="size-4" strokeWidth={1.7} aria-hidden="true" />
      ) : (
        <Moon className="size-4" strokeWidth={1.7} aria-hidden="true" />
      )}
    </button>
  );
}
