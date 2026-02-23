"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

const FONT_SIZE_MAP = {
  normal: "16px",
  large: "20px",
  xlarge: "24px",
} as const;

/**
 * Syncs the persisted theme/language/fontSize from Zustand to the <html> element.
 * Must be rendered inside a client boundary.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppStore((s) => s.theme);
  const language = useAppStore((s) => s.language);
  const fontSize = useAppStore((s) => s.fontSize);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("lang", language);
    document.documentElement.setAttribute("dir", language === "fa" ? "rtl" : "ltr");
  }, [language]);

  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SIZE_MAP[fontSize];
  }, [fontSize]);

  return <>{children}</>;
}
