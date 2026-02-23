"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { t, axisLabel, AXIS_KEYS } from "@/lib/i18n";
import {
  getCompass,
  getHistory,
  saveSnapshot,
  getWallet,
  getNextQuestions,
  submitResponses,
  diffSnapshots,
  getFrequencyPreference,
  setFrequencyPreference,
} from "@/lib/api";
import { CompassChart } from "@/components/compass-chart";
import { Compass3D } from "@/components/compass-3d";
import { CompassResultCard } from "@/components/compass-result-card";
import { QuestionCard } from "@/components/question-card";
import { SettingsBar } from "@/components/settings-bar";
import { Share2, LogOut, GitCompare, Clock, Check, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

type Tab = "compass" | "session" | "history" | "wallet";

interface Snapshot {
  id: string;
  snapshotName: string;
  dimensions: Record<string, number>;
  confidence: Record<string, number>;
  changeLog: string | null;
  createdAt: string;
}

interface DiffResult {
  from: { id: string; snapshotName: string; createdAt: string; dimensions: Record<string, number> };
  to: { id: string; snapshotName: string; createdAt: string; dimensions: Record<string, number> };
  deltas: Record<string, { from: number; to: number; delta: number }>;
  summary: { totalShift: number; biggestShift: { axis: string; label: string; delta: number }; changeLog: string };
}

interface WalletData {
  id: string;
  polygonAddress: string;
  walletType: string;
  tokenBalance: number;
}

interface Question {
  id: string;
  text: string;
  weights: Record<string, number>;
}

export default function DashboardPage() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const language = useAppStore((s) => s.language);
  const [tab, setTab] = useState<Tab>("compass");
  const [compassView, setCompassView] = useState<"2d" | "3d">("2d");
  const [showExport, setShowExport] = useState(false);
  const [compass, setCompass] = useState<{
    dimensions: Record<string, number>;
    confidence: Record<string, number>;
  } | null>(null);
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [snapshotName, setSnapshotName] = useState("");
  const [snapshotSaved, setSnapshotSaved] = useState(false);

  // Compare state
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [diffLoading, setDiffLoading] = useState(false);

  // Frequency state
  const [frequency, setFrequency] = useState<string>("WEEKLY");

  // Session state
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/connect");
      return;
    }

    async function load() {
      try {
        const [compassData, historyData, walletData, freqData] = await Promise.all([
          getCompass(user!.id),
          getHistory(user!.id),
          getWallet(user!.id).catch(() => null),
          getFrequencyPreference().catch(() => null),
        ]);
        setCompass(compassData);
        setHistory(historyData);
        setWallet(walletData);
        if (freqData?.frequencyPreference) {
          setFrequency(freqData.frequencyPreference);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      }
    }

    load();
  }, [user, router]);

  async function handleSaveSnapshot() {
    if (!user) return;
    try {
      await saveSnapshot(user.id, snapshotName || undefined);
      const updatedHistory = await getHistory(user.id);
      setHistory(updatedHistory);
      setSnapshotName("");
      setSnapshotSaved(true);
      setTimeout(() => setSnapshotSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save snapshot:", err);
    }
  }

  // Toggle snapshot selection for compare
  function toggleCompareId(id: string) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id]; // replace oldest
      return [...prev, id];
    });
    setDiffResult(null);
  }

  // Run diff when two snapshots are selected
  async function runDiff() {
    if (compareIds.length !== 2) return;
    setDiffLoading(true);
    try {
      const result = await diffSnapshots(compareIds[0], compareIds[1]);
      setDiffResult(result);
    } catch (err) {
      console.error("Failed to diff:", err);
    } finally {
      setDiffLoading(false);
    }
  }

  // Save frequency preference
  async function handleFrequencyChange(freq: string) {
    setFrequency(freq);
    try {
      await setFrequencyPreference(freq);
    } catch (err) {
      console.error("Failed to save frequency:", err);
    }
  }

  async function loadSession() {
    if (!user) return;
    setSessionLoading(true);
    try {
      const qs = await getNextQuestions(user.id, 3);
      setSessionQuestions(qs);
      setSessionIndex(0);
      setSessionDone(qs.length === 0);
    } catch (err) {
      console.error("Failed to load session:", err);
    } finally {
      setSessionLoading(false);
    }
  }

  async function handleSessionAnswer(
    questionId: string,
    answerValue: number,
    responseTimeMs: number
  ) {
    if (!user) return;
    try {
      await submitResponses(user.id, [
        { questionId, answerValue, responseTimeMs },
      ]);

      if (sessionIndex < sessionQuestions.length - 1) {
        setSessionIndex((i) => i + 1);
      } else {
        setSessionDone(true);
        // Refresh compass after session and auto-save snapshot
        const compassData = await getCompass(user.id);
        setCompass(compassData);
        try {
          await saveSnapshot(user.id, `Session ${new Date().toISOString().split('T')[0]}`);
          const updatedHistory = await getHistory(user.id);
          setHistory(updatedHistory);
        } catch {
          // Non-critical — just skip auto-snapshot
        }
      }
    } catch (err) {
      console.error("Failed to submit session response:", err);
    }
  }

  if (!user) return null;

  const tabs: { id: Tab; label: string }[] = [
    { id: "compass", label: t("tab_compass", language) },
    { id: "session", label: t("tab_session", language) },
    { id: "history", label: t("tab_history", language) },
    { id: "wallet", label: t("tab_wallet", language) },
  ];

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-12 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold glow-text">{t("dashboard_title", language)}</h1>
        <div className="flex items-center gap-3">
          <SettingsBar />
          <button
            onClick={() => {
              useAppStore.getState().logout();
              router.push("/");
            }}
            className="btn-outline text-sm py-2 px-4 flex items-center gap-1.5"
            style={{ color: "var(--text-muted)" }}
          >
            <LogOut size={14} strokeWidth={1.5} />
            {t("disconnect", language)}
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div
        className="grid grid-cols-4 sm:flex gap-1 rounded-xl p-1 mb-6 sm:mb-8"
        style={{ background: "var(--bg-card)" }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all"
            style={{
              background:
                tab === t.id ? "var(--accent-gradient)" : "transparent",
              color: tab === t.id ? "#111111" : "var(--text-secondary)",
              fontWeight: tab === t.id ? 700 : 500,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Compass tab */}
      {tab === "compass" && compass && (
        <div className="space-y-6">
          {/* View toggle + export toggle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* 2D / 3D toggle */}
            <div
              className="flex gap-1 rounded-full p-1"
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

            {/* Share / Export toggle */}
            <button
              onClick={() => setShowExport((v) => !v)}
              className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all"
              style={{
                background: showExport ? "var(--accent-gradient-soft)" : "var(--component-primary)",
                border: `1px solid ${showExport ? "var(--border-accent)" : "var(--border-color)"}`,
                color: showExport ? "var(--accent-primary)" : "var(--text-secondary)",
              }}
            >
              <Share2 size={12} strokeWidth={1.5} />
              {t("share", language)} / {t("download", language)}
            </button>
          </div>

          {/* Compass visualization */}
          {compassView === "2d" ? (
            <CompassChart
              dimensions={compass.dimensions}
              confidence={compass.confidence}
            />
          ) : (
            <Compass3D
              dimensions={compass.dimensions}
              confidence={compass.confidence}
            />
          )}

          {/* Export card (collapsible) */}
          {showExport && (
            <CompassResultCard
              dimensions={compass.dimensions}
              confidence={compass.confidence}
              language={language}
            />
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={snapshotName}
              onChange={(e) => setSnapshotName(e.target.value)}
              placeholder={t("snapshot_placeholder", language)}
              className="flex-1 rounded-xl px-4 py-2 text-sm outline-none min-h-[44px]"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                color: "var(--text-primary)",
              }}
            />
            <button
              onClick={handleSaveSnapshot}
              className="btn-primary text-sm py-2 px-6 w-full sm:w-auto justify-center flex items-center gap-1.5"
            >
              {snapshotSaved ? (
                <><Check size={14} /> {t("snapshot_saved", language)}</>
              ) : (
                t("save_snapshot", language)
              )}
            </button>
          </div>
        </div>
      )}

      {/* Session tab */}
      {tab === "session" && (
        <div className="space-y-6">
          {sessionQuestions.length === 0 && !sessionDone && !sessionLoading ? (
            <div className="text-center py-12 space-y-4">
              <div className="text-5xl">🎯</div>
              <h2 className="text-xl font-semibold">{t("session_ready_title", language)}</h2>
              <p style={{ color: "var(--text-secondary)" }}>
                {t("session_ready_desc", language)}
              </p>
              <button onClick={loadSession} className="btn-primary mx-auto">
                {t("start_session", language)}
              </button>
            </div>
          ) : sessionLoading ? (
            <p className="text-center py-12" style={{ color: "var(--text-secondary)" }}>
              {t("loading_questions", language)}
            </p>
          ) : sessionDone ? (
            <div className="text-center py-12 space-y-4">
              <div className="text-5xl">✅</div>
              <h2 className="text-xl font-semibold text-gradient">{t("session_complete", language)}</h2>
              <p style={{ color: "var(--text-secondary)" }}>
                {sessionQuestions.length === 0
                  ? t("session_all_done", language)
                  : t("session_updated", language)}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => { setTab("compass"); }}
                  className="btn-primary"
                >
                  {t("view_compass", language)}
                </button>
                <button
                  onClick={() => {
                    setSessionDone(false);
                    setSessionQuestions([]);
                    loadSession();
                  }}
                  className="btn-outline"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {t("another_round", language)}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {t("question_of", language, { current: sessionIndex + 1, total: sessionQuestions.length })}
                </p>
                <div className="flex gap-1.5">
                  {sessionQuestions.map((_, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-full transition-all"
                      style={{
                        background:
                          i < sessionIndex
                            ? "var(--accent-primary)"
                            : i === sessionIndex
                              ? "rgba(91, 157, 245, 0.35)"
                              : "var(--component-primary)",
                        boxShadow:
                          i === sessionIndex
                            ? "0 0 0 2px var(--accent-primary)"
                            : "none",
                      }}
                    />
                  ))}
                </div>
              </div>
              <QuestionCard
                key={sessionQuestions[sessionIndex].id}
                question={sessionQuestions[sessionIndex]}
                onAnswer={handleSessionAnswer}
              />
            </div>
          )}
        </div>
      )}

      {/* History tab — Timeline + Compare */}
      {tab === "history" && (
        <div className="space-y-6">
          {history.length === 0 ? (
            <p className="text-center py-12" style={{ color: "var(--text-muted)" }}>
              {t("no_snapshots", language)}
            </p>
          ) : (
            <>
              {/* Compare toolbar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <GitCompare size={16} style={{ color: "var(--accent-primary)" }} />
                  <span className="text-sm font-medium">
                    {compareIds.length === 2
                      ? `${t("comparing", language)}…`
                      : t("select_to_compare", language)}
                  </span>
                </div>
                <div className="flex gap-2">
                  {compareIds.length > 0 && (
                    <button
                      onClick={() => { setCompareIds([]); setDiffResult(null); }}
                      className="btn-outline text-xs py-1.5 px-3"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {t("clear_selection", language)}
                    </button>
                  )}
                  {compareIds.length === 2 && (
                    <button
                      onClick={runDiff}
                      className="btn-primary text-xs py-1.5 px-4"
                      disabled={diffLoading}
                    >
                      {diffLoading ? "…" : t("compare", language)}
                    </button>
                  )}
                </div>
              </div>

              {/* Diff result card */}
              {diffResult && (
                <div className="card p-5 space-y-4" style={{ border: "1px solid var(--border-accent)" }}>
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <GitCompare size={14} />
                    {t("diff_title", language)}
                  </h3>

                  {/* Summary */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl p-3" style={{ background: "var(--component-primary)" }}>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t("total_shift", language)}</p>
                      <p className="text-lg font-bold text-gradient">{diffResult.summary.totalShift.toFixed(2)}</p>
                    </div>
                    <div className="rounded-xl p-3" style={{ background: "var(--component-primary)" }}>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t("biggest_shift", language)}</p>
                      <p className="text-lg font-bold" style={{ color: diffResult.summary.biggestShift.delta > 0 ? "var(--success)" : "var(--error)" }}>
                        {axisLabel(diffResult.summary.biggestShift.axis, language)}
                      </p>
                    </div>
                  </div>

                  {/* Snapshot labels */}
                  <div className="flex items-center justify-between text-xs" style={{ color: "var(--text-muted)" }}>
                    <span>{diffResult.from.snapshotName} ({new Date(diffResult.from.createdAt).toLocaleDateString()})</span>
                    <span>→</span>
                    <span>{diffResult.to.snapshotName} ({new Date(diffResult.to.createdAt).toLocaleDateString()})</span>
                  </div>

                  {/* Per-axis delta bars */}
                  <div className="space-y-2">
                    {AXIS_KEYS.map((axis) => {
                      const d = diffResult.deltas[axis];
                      if (!d) return null;
                      const absDelta = Math.abs(d.delta);
                      const barWidth = Math.min(absDelta * 100, 100);
                      return (
                        <div key={axis} className="flex items-center gap-3">
                          <span className="text-xs w-24 shrink-0 text-end" style={{ color: "var(--text-secondary)" }}>
                            {axisLabel(axis, language)}
                          </span>
                          <div className="flex-1 h-4 rounded-full relative overflow-hidden" style={{ background: "var(--component-primary)" }}>
                            <div
                              className="absolute top-0 h-full rounded-full transition-all"
                              style={{
                                width: `${barWidth}%`,
                                left: d.delta >= 0 ? "50%" : `${50 - barWidth}%`,
                                background: d.delta > 0 ? "var(--success)" : d.delta < 0 ? "var(--error)" : "var(--text-muted)",
                                opacity: 0.7,
                              }}
                            />
                            {/* center line */}
                            <div className="absolute top-0 left-1/2 w-px h-full" style={{ background: "var(--border-color)" }} />
                          </div>
                          <span className="text-xs w-16 shrink-0 flex items-center gap-1" style={{ color: d.delta > 0 ? "var(--success)" : d.delta < 0 ? "var(--error)" : "var(--text-muted)" }}>
                            {d.delta > 0 ? <ArrowUpRight size={10} /> : d.delta < 0 ? <ArrowDownRight size={10} /> : <Minus size={10} />}
                            {d.delta > 0 ? "+" : ""}{d.delta.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Overlay comparison chart */}
                  <div className="mt-4">
                    <CompassChart
                      dimensions={diffResult.to.dimensions}
                      confidence={{}}
                      overlayDimensions={diffResult.from.dimensions}
                    />
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="relative">
                {/* Timeline line */}
                <div
                  className="absolute top-0 bottom-0 start-4 w-px"
                  style={{ background: "var(--border-color)" }}
                />

                <div className="space-y-4">
                  {history.map((s, i) => {
                    const isSelected = compareIds.includes(s.id);
                    return (
                      <div key={s.id} className="relative flex gap-4 ps-10">
                        {/* Timeline dot */}
                        <button
                          onClick={() => toggleCompareId(s.id)}
                          className="absolute start-2 top-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all z-10 shrink-0"
                          style={{
                            borderColor: isSelected ? "var(--accent-primary)" : "var(--border-color)",
                            background: isSelected ? "var(--accent-primary)" : "var(--bg-primary)",
                          }}
                          title={isSelected ? "Deselect" : "Select for compare"}
                        >
                          {isSelected && <Check size={10} color="#111" strokeWidth={3} />}
                        </button>

                        {/* Snapshot card */}
                        <div
                          className="card p-4 flex-1 transition-all cursor-pointer"
                          onClick={() => toggleCompareId(s.id)}
                          style={{
                            border: isSelected ? "1px solid var(--accent-primary)" : undefined,
                            boxShadow: isSelected ? "0 0 0 1px var(--accent-primary)" : undefined,
                          }}
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mb-2">
                            <h3 className="font-medium text-sm">{s.snapshotName}</h3>
                            <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                              <Clock size={11} />
                              {new Date(s.createdAt).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>

                          {/* Changelog */}
                          {s.changeLog && (
                            <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
                              {s.changeLog}
                            </p>
                          )}

                          {/* Axis tags */}
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(s.dimensions).map(([axis, val]) => (
                              <span
                                key={axis}
                                className="tag text-xs"
                                style={{
                                  background:
                                    (val as number) > 0
                                      ? "rgba(14, 187, 144, 0.1)"
                                      : (val as number) < 0
                                        ? "rgba(224, 81, 77, 0.1)"
                                        : "var(--component-primary)",
                                  borderColor:
                                    (val as number) > 0
                                      ? "rgba(14, 187, 144, 0.3)"
                                      : (val as number) < 0
                                        ? "rgba(224, 81, 77, 0.3)"
                                        : "var(--border-color)",
                                  color:
                                    (val as number) > 0
                                      ? "var(--success)"
                                      : (val as number) < 0
                                        ? "var(--error)"
                                        : "var(--text-muted)",
                                }}
                              >
                                {axisLabel(axis, language)}: {(val as number).toFixed(2)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Frequency preference */}
              <div className="card p-4 space-y-3">
                <h3 className="text-sm font-medium">{t("frequency_title", language)}</h3>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {t("frequency_desc", language)}
                </p>
                <div className="flex gap-2">
                  {(["DAILY", "WEEKLY", "MONTHLY"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => handleFrequencyChange(f)}
                      className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: frequency === f ? "var(--accent-gradient)" : "var(--component-primary)",
                        color: frequency === f ? "#111" : "var(--text-secondary)",
                        border: `1px solid ${frequency === f ? "transparent" : "var(--border-color)"}`,
                      }}
                    >
                      {t(`freq_${f.toLowerCase()}` as "freq_daily" | "freq_weekly" | "freq_monthly", language)}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Wallet tab */}
      {tab === "wallet" && (
        <div className="space-y-6">
          {wallet ? (
            <>
              <div className="card p-6 text-center">
                <p className="text-4xl font-bold text-gradient">
                  {wallet.tokenBalance.toFixed(1)}
                </p>
                <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                  {t("civic_tokens", language)}
                </p>
              </div>

              <div className="card p-4 space-y-2">
                <h3 className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  {t("wallet_details", language)}
                </h3>
                <p className="text-xs break-all" style={{ color: "var(--text-muted)" }}>
                  {t("address", language)}: {wallet.polygonAddress}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {t("type", language)}: {wallet.walletType}
                </p>
              </div>
            </>
          ) : (
            <p className="text-center py-12" style={{ color: "var(--text-muted)" }}>
              {t("no_wallet", language)}
            </p>
          )}
        </div>
      )}
    </main>
  );
}
