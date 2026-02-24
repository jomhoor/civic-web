"use client";

import type { Compass3DHandle } from "@/components/compass-3d";
import { Compass3D } from "@/components/compass-3d";
import { PageNavBar } from "@/components/page-nav-bar";
import type { CompassChartHandle } from "@/components/political-compass-chart";
import { PoliticalCompassChart } from "@/components/political-compass-chart";
import { getPokeStatus, getPublicProfile, sendPoke } from "@/lib/api";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { ArrowLeft, Check, Copy, Download, Lock, Share2, Zap } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface ProfileData {
  id: string;
  wallet: string;
  displayName: string | null;
  createdAt: string;
  dimensions: Record<string, number>;
  confidence: Record<string, number>;
}

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const language = useAppStore((s) => s.language);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pokeState, setPokeState] = useState<{ hasPoked: boolean; hasBeenPoked: boolean; mutual: boolean; walletAddress?: string } | null>(null);
  const [pokeSending, setPokeSending] = useState(false);
  const [compassView, setCompassView] = useState<"2d" | "3d">("3d");
  const chartRef = useRef<CompassChartHandle>(null);
  const compass3DRef = useRef<Compass3DHandle>(null);
  const currentUser = useAppStore((s) => s.user);
  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    async function load() {
      try {
        const data = await getPublicProfile(userId);
        setProfile(data);
        // Load poke status if logged in and not own profile
        if (currentUser && currentUser.id !== userId) {
          try {
            const status = await getPokeStatus(userId);
            setPokeState(status);
          } catch { /* not logged in or error */ }
        }
      } catch {
        setError("Profile not found");
      } finally {
        setLoading(false);
      }
    }
    if (userId) load();
  }, [userId, currentUser]);

  const handleDownload = useCallback(async () => {
    try {
      let dataUrl: string | null = null;
      if (compassView === "3d") {
        dataUrl = compass3DRef.current?.toDataURL() ?? null;
      } else {
        dataUrl = await chartRef.current?.toDataURL() ?? null;
      }
      if (!dataUrl) return;
      const link = document.createElement("a");
      link.download = `civic-compass-${userId.slice(0, 8)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download:", err);
    }
  }, [userId, compassView]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: t("profile_title", language), url });
        return;
      } catch { /* user cancelled */ }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [language]);

  const handleCopyId = useCallback(async () => {
    await navigator.clipboard.writeText(userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [userId]);

  const handlePoke = useCallback(async () => {
    if (!currentUser || pokeSending) return;
    setPokeSending(true);
    try {
      const result = await sendPoke(userId);
      setPokeState({ hasPoked: true, hasBeenPoked: pokeState?.hasBeenPoked ?? false, mutual: result.mutual, walletAddress: result.walletAddress });
    } catch (err) {
      console.error("Failed to poke:", err);
    } finally {
      setPokeSending(false);
    }
  }, [currentUser, userId, pokeSending, pokeState]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <div className="animate-pulse text-sm" style={{ color: "var(--text-muted)" }}>
          {t("loading", language)}...
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "var(--bg-primary)" }}>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {t("profile_not_found", language)}
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="btn-primary text-sm px-6 py-2 flex items-center gap-1.5"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          {t("back_to_dashboard", language)}
        </button>
      </main>
    );
  }

  const joinDate = new Date(profile.createdAt).toLocaleDateString(
    language === "fa" ? "fa-IR" : "en-US",
    { year: "numeric", month: "long" }
  );

  return (
    <main
      className="min-h-screen"
      style={{ background: "var(--bg-primary)" }}
    >
      <PageNavBar />

      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Profile header */}
        <div className="card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                {profile.displayName || t("profile_title", language)}
              </h1>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                {profile.wallet}
              </p>
            </div>
            <button
              onClick={handleCopyId}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all"
              style={{
                background: copied ? "var(--accent-gradient-soft)" : "var(--component-primary)",
                border: `1px solid ${copied ? "var(--border-accent)" : "var(--border-color)"}`,
                color: copied ? "var(--accent-primary)" : "var(--text-secondary)",
              }}
              title={t("copy_id", language)}
            >
              {copied ? <Check size={12} strokeWidth={1.5} /> : <Copy size={12} strokeWidth={1.5} />}
              {copied ? t("copied", language) : t("copy_id", language)}
            </button>
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {t("joined", language)} {joinDate}
          </p>
        </div>

        {/* Compass view toggle + chart */}
        <div className="space-y-3">
          <div
            className="flex gap-1 rounded-full p-1 w-fit mx-auto"
            style={{ background: "var(--component-primary)", border: "1px solid var(--border-color)" }}
          >
            <button
              onClick={() => setCompassView("2d")}
              className="px-4 py-1 rounded-full text-xs font-semibold transition-all"
              style={{
                background: compassView === "2d" ? "var(--accent-gradient)" : "transparent",
                color: compassView === "2d" ? "#111" : "var(--text-secondary)",
              }}
            >
              {t("view_2d", language)}
            </button>
            <button
              onClick={() => setCompassView("3d")}
              className="px-4 py-1 rounded-full text-xs font-semibold transition-all"
              style={{
                background: compassView === "3d" ? "var(--accent-gradient)" : "transparent",
                color: compassView === "3d" ? "#111" : "var(--text-secondary)",
              }}
            >
              {t("view_3d", language)}
            </button>
          </div>

          {compassView === "2d" ? (
            <PoliticalCompassChart
              ref={chartRef}
              dimensions={profile.dimensions}
              confidence={profile.confidence}
              userId={profile.id}
            />
          ) : (
            <Compass3D
              ref={compass3DRef}
              dimensions={profile.dimensions}
              confidence={profile.confidence}
              userId={profile.id}
            />
          )}
        </div>

        {/* Poke / Chat action */}
        {currentUser && !isOwnProfile && (
          <div className="flex items-center justify-center gap-2">
            {pokeState?.mutual ? (
              <button
                onClick={() => router.push("/dashboard?tab=chat&user=" + userId)}
                className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-all"
                style={{
                  background: "var(--accent-gradient)",
                  color: "#111",
                }}
              >
                <Lock size={16} strokeWidth={1.5} />
                {t("start_chat", language)}
              </button>
            ) : (
              <button
                onClick={handlePoke}
                disabled={pokeState?.hasPoked || pokeSending}
                className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-all disabled:opacity-50"
                style={{
                  background: pokeState?.hasPoked ? "var(--component-primary)" : "var(--accent-gradient)",
                  color: pokeState?.hasPoked ? "var(--text-secondary)" : "#111",
                  border: pokeState?.hasPoked ? "1px solid var(--border-color)" : "none",
                }}
              >
                <Zap size={16} strokeWidth={1.5} />
                {pokeSending
                  ? t("loading", language) + "..."
                  : pokeState?.hasPoked
                    ? t("poke_sent", language)
                    : t("poke_user", language)}
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-medium transition-all"
            style={{
              background: "var(--component-primary)",
              border: "1px solid var(--border-color)",
              color: "var(--text-secondary)",
            }}
          >
            <Download size={14} strokeWidth={1.5} />
            {t("download", language)}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-medium transition-all"
            style={{
              background: "var(--component-primary)",
              border: "1px solid var(--border-color)",
              color: "var(--text-secondary)",
            }}
          >
            <Share2 size={14} strokeWidth={1.5} />
            {t("share", language)}
          </button>
        </div>

        {/* Back link */}
        <div className="text-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-xs font-medium transition-all"
            style={{ color: "var(--text-muted)" }}
          >
            <span className="flex items-center justify-center gap-1">
              <ArrowLeft size={12} strokeWidth={1.5} />
              {t("back_to_dashboard", language)}
            </span>
          </button>
        </div>
      </div>
    </main>
  );
}
