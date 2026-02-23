"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { activateResearch } from "@/lib/api";
import { ArrowRight } from "lucide-react";
import { t } from "@/lib/i18n";

export default function OnboardingPage() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const setAuth = useAppStore((s) => s.setAuth);
  const language = useAppStore((s) => s.language);
  const [inviteCode, setInviteCode] = useState("");
  const [researchError, setResearchError] = useState("");
  const [activating, setActivating] = useState(false);

  if (!user) {
    router.push("/connect");
    return null;
  }

  async function handleActivateResearch() {
    if (!user || !inviteCode.trim()) return;
    setActivating(true);
    setResearchError("");
    try {
      const result = await activateResearch(user.id, inviteCode.trim());
      if (result.error) {
        setResearchError(result.error);
      } else {
        // Update local user state with research participant flag
        setAuth(result.user, useAppStore.getState().token ?? "");
        router.push("/calibration");
      }
    } catch {
        setResearchError(t("onboard_research_error", language));
    } finally {
      setActivating(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-lg w-full space-y-10">
        {/* Manifesto */}
        <div className="text-center space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold glow-text">
            {t("onboard_welcome", language)}
          </h1>
          <div
            className="card p-4 sm:p-6 text-start space-y-3"
            style={{ color: "var(--text-secondary)" }}
          >
            <p className="leading-relaxed">
              {t("onboard_manifesto_1", language)}
            </p>
            <p className="leading-relaxed">
              {t("onboard_manifesto_2", language)}
            </p>
            <p className="leading-relaxed">
              {t("onboard_manifesto_3", language)}
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {t("onboard_manifesto_4", language)}
            </p>
          </div>
        </div>

        {/* Research Mode (optional) */}
        <div className="card p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="badge">
              <span className="pulse-dot" />
              {t("onboard_research_label", language)}
            </span>
            <h2 className="text-sm font-semibold">{t("onboard_research_title", language)}</h2>
          </div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {t("onboard_research_desc", language)}
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder={t("onboard_research_placeholder", language)}
              className="flex-1 rounded-xl px-4 py-2 text-sm outline-none"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                color: "var(--text-primary)",
              }}
            />
            <button
              onClick={handleActivateResearch}
              disabled={!inviteCode.trim() || activating}
              className="btn-outline text-sm py-2 px-4 disabled:opacity-50"
              style={{ color: "var(--text-secondary)" }}
            >
              {activating ? "..." : t("onboard_research_activate", language)}
            </button>
          </div>
          {researchError && (
            <p className="text-xs" style={{ color: "var(--error)" }}>
              {researchError}
            </p>
          )}
        </div>

        {/* Continue */}
        <div className="text-center">
          <button
            onClick={() => router.push("/calibration")}
            className="btn-primary text-lg"
          >
            {t("begin_calibration", language)}
            <ArrowRight size={16} strokeWidth={1.5} className="rtl:rotate-180" />
          </button>
        </div>
      </div>
    </main>
  );
}
