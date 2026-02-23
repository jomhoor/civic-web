"use client";

import { useRouter } from "next/navigation";
import { useAppStore, type Language, type FontSize } from "@/lib/store";
import { Globe, ArrowRight, Sun, Moon, ALargeSmall, Check } from "lucide-react";
import { t } from "@/lib/i18n";

const FONT_SIZES: { code: FontSize; label: string }[] = [
  { code: "normal", label: "A" },
  { code: "large", label: "A+" },
  { code: "xlarge", label: "A++" },
];

const LANGUAGES: { code: Language; label: string; nativeLabel: string; dir: "ltr" | "rtl" }[] = [
  { code: "en", label: "English", nativeLabel: "English", dir: "ltr" },
  { code: "fa", label: "Persian", nativeLabel: "فارسی", dir: "rtl" },
];

export default function WelcomePage() {
  const router = useRouter();
  const language = useAppStore((s) => s.language);
  const theme = useAppStore((s) => s.theme);
  const fontSize = useAppStore((s) => s.fontSize);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const setTheme = useAppStore((s) => s.setTheme);
  const setFontSize = useAppStore((s) => s.setFontSize);
  const markVisited = useAppStore((s) => s.markVisited);

  function handleContinue() {
    markVisited();
    router.push("/connect");
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Background glows */}
      <div
        className="absolute -top-62.5 -end-37.5 w-175 h-175 rounded-full opacity-[0.12] blur-[120px] pointer-events-none"
        style={{ background: "#93C5FD" }}
      />
      <div
        className="absolute -bottom-50 -start-37.5 w-150 h-150 rounded-full opacity-[0.08] blur-[120px] pointer-events-none"
        style={{ background: "#7DD3FC" }}
      />

      <div className="relative z-10 max-w-md w-full space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-2" style={{ background: "var(--accent-gradient-soft)", border: "1px solid var(--border-accent)" }}>
            <Globe size={28} style={{ color: "var(--accent-primary)" }} strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold glow-text">
            Civic <span className="text-gradient">Compass</span>
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {t("welcome_choose_lang", language)}
          </p>
        </div>

        {/* Font size selector */}
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ALargeSmall size={18} style={{ color: "var(--text-secondary)" }} strokeWidth={1.5} />
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {t("font_size", language)}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {t("font_desc", language)}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              {FONT_SIZES.map((fs) => {
                const selected = fontSize === fs.code;
                return (
                  <button
                    key={fs.code}
                    onClick={() => setFontSize(fs.code)}
                    className="rounded-lg px-3 py-2 text-xs font-bold transition-all min-h-[44px]"
                    style={{
                      background: selected ? "var(--accent-gradient-soft)" : "var(--component-primary)",
                      border: `1.5px solid ${selected ? "var(--accent-primary)" : "var(--border-color)"}`,
                      color: selected ? "var(--accent-primary)" : "var(--text-secondary)",
                    }}
                  >
                    {fs.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Theme preference */}

        {/* Language cards */}
        <div className="space-y-3">
          {LANGUAGES.map((lang) => {
            const selected = language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className="w-full flex items-center gap-4 rounded-xl px-5 py-4 text-start transition-all"
                style={{
                  background: selected ? "var(--accent-gradient-soft)" : "var(--bg-card)",
                  border: `1.5px solid ${selected ? "var(--accent-primary)" : "var(--border-color)"}`,
                  boxShadow: selected ? "0 0 24px rgba(91, 157, 245, 0.1)" : "none",
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
                  style={{
                    background: selected ? "var(--accent-gradient)" : "var(--component-primary)",
                    color: selected ? "#111" : "var(--text-secondary)",
                  }}
                >
                  {lang.code === "en" ? "En" : "فا"}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                    {lang.nativeLabel}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {lang.label} · {lang.dir.toUpperCase()}
                  </p>
                </div>
                {selected && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "var(--accent-gradient)" }}
                  >
                    <Check size={12} strokeWidth={2.5} color="#111" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Theme preference */}
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <Moon size={18} style={{ color: "var(--text-secondary)" }} strokeWidth={1.5} />
              ) : (
                <Sun size={18} style={{ color: "var(--text-secondary)" }} strokeWidth={1.5} />
              )}
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {theme === "dark" ? t("dark_mode", language) : t("light_mode", language)}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {t("tap_switch_appearance", language)}
                </p>
              </div>
            </div>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="relative w-14 h-8 rounded-full transition-all"
              style={{
                background: theme === "light" ? "var(--accent-primary)" : "var(--component-primary)",
                border: "1px solid var(--border-color)",
              }}
            >
              <div
                className="absolute top-0.5 w-6.5 h-6.5 rounded-full transition-all"
                style={{
                  background: theme === "light" ? "#fff" : "var(--text-secondary)",
                  insetInlineStart: theme === "light" ? "calc(100% - 28px)" : "2px",
                }}
              />
            </button>
          </div>
        </div>

        {/* Continue */}
        <button
          onClick={handleContinue}
          className="btn-primary w-full justify-center text-lg"
        >
          {language === "fa" ? "ادامه" : t("get_started", language)}
          <ArrowRight size={18} strokeWidth={1.5} className="rtl:rotate-180" />
        </button>
      </div>
    </main>
  );
}
