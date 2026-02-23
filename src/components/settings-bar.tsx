"use client";

import { useAppStore, type Language, type FontSize } from "@/lib/store";
import { t } from "@/lib/i18n";
import { Sun, Moon, Globe, ALargeSmall } from "lucide-react";

const FONT_SIZES: FontSize[] = ["normal", "large", "xlarge"];
const FONT_LABELS: Record<FontSize, "font_normal" | "font_large" | "font_xlarge"> = {
  normal: "font_normal",
  large: "font_large",
  xlarge: "font_xlarge",
};

/** Sun / Moon toggle + language selector + font size — fits in a nav bar */
export function SettingsBar() {
  const theme = useAppStore((s) => s.theme);
  const language = useAppStore((s) => s.language);
  const fontSize = useAppStore((s) => s.fontSize);
  const setTheme = useAppStore((s) => s.setTheme);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const setFontSize = useAppStore((s) => s.setFontSize);

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  function cycleLanguage() {
    const langs: Language[] = ["en", "fa"];
    const idx = langs.indexOf(language);
    setLanguage(langs[(idx + 1) % langs.length]);
  }

  function cycleFontSize() {
    const idx = FONT_SIZES.indexOf(fontSize);
    setFontSize(FONT_SIZES[(idx + 1) % FONT_SIZES.length]);
  }

  return (
    <div className="flex items-center gap-2">
      {/* Language toggle */}
      <button
        onClick={cycleLanguage}
        className="flex items-center gap-1.5 rounded-full px-3 py-2.5 text-xs font-medium transition-all min-h-[44px]"
        style={{
          background: "var(--component-primary)",
          border: "1px solid var(--border-color)",
          color: "var(--text-secondary)",
        }}
        title={t("language", language)}
      >
        <Globe size={14} strokeWidth={1.5} />
        <span>{language === "en" ? "EN" : "فا"}</span>
      </button>

      {/* Font size toggle */}
      <button
        onClick={cycleFontSize}
        className="flex items-center gap-1.5 rounded-full px-3 py-2.5 text-xs font-bold transition-all min-h-[44px]"
        style={{
          background: fontSize !== "normal" ? "var(--accent-gradient-soft)" : "var(--component-primary)",
          border: `1px solid ${fontSize !== "normal" ? "var(--border-accent)" : "var(--border-color)"}`,
          color: fontSize !== "normal" ? "var(--accent-primary)" : "var(--text-secondary)",
        }}
        title={t("font_size", language)}
      >
        <ALargeSmall size={14} strokeWidth={1.5} />
        <span>{t(FONT_LABELS[fontSize], language)}</span>
      </button>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="flex items-center justify-center w-10 h-10 rounded-full transition-all"
        style={{
          background: "var(--component-primary)",
          border: "1px solid var(--border-color)",
          color: "var(--text-secondary)",
        }}
        title={theme === "dark" ? t("light_mode", language) : t("dark_mode", language)}
      >
        {theme === "dark" ? (
          <Sun size={16} strokeWidth={1.5} />
        ) : (
          <Moon size={16} strokeWidth={1.5} />
        )}
      </button>
    </div>
  );
}
