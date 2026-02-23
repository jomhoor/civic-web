"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { walletAuth } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { Wallet, Lock } from "lucide-react";
import { t } from "@/lib/i18n";

export default function ConnectPage() {
  const router = useRouter();
  const setAuth = useAppStore((s) => s.setAuth);
  const language = useAppStore((s) => s.language);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Simplified connect for Phase 1.
   * Generates a mock wallet address to get started.
   * Will be replaced with RainbowKit + SIWE.
   */
  async function handleQuickStart() {
    setLoading(true);
    setError("");
    try {
      // Generate a random "wallet address" for now
      const mockAddress = `0x${Array.from({ length: 40 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("")}`;

      const result = await walletAuth(mockAddress, true);
      setAuth(result.user, result.token);
      router.push("/onboarding");
    } catch (err) {
      setError(t("connect_error", language));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="card max-w-md w-full p-5 sm:p-8 space-y-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold glow-text">
          {t("connect_title", language)}
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          {t("connect_desc", language)}
        </p>

        <button
          onClick={handleQuickStart}
          disabled={loading}
          className="btn-primary w-full justify-center text-lg disabled:opacity-50 flex items-center gap-2"
        >
          <Wallet size={18} strokeWidth={1.5} />
          {loading ? t("connect_button_loading", language) : t("connect_button", language)}
        </button>

        {error && (
          <p className="text-sm" style={{ color: "var(--error)" }}>{error}</p>
        )}

        <div className="pt-6" style={{ borderTop: "1px solid var(--border-color)" }}>
          <p className="text-sm flex items-center justify-center gap-1.5" style={{ color: "var(--text-muted)" }}>
            <Lock size={14} strokeWidth={1.5} />
            {t("connect_footer", language)}
          </p>
        </div>
      </div>
    </main>
  );
}
