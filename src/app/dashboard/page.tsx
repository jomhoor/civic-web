"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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
  getMatches,
  getMatchSettings,
  updateMatchSettings,
  sendConnectionRequest,
  respondToConnection,
  cancelConnection,
  getIncomingRequests,
  getConnections,
  getQuestionnaireProgress,
  resetQuestionnaireResponses,
  getReceivedPokes,
  markPokesSeen,
  getUnseenPokeCount,
  sendPoke,
} from "@/lib/api";
import { PoliticalCompassChart } from "@/components/political-compass-chart";
import { Compass3D } from "@/components/compass-3d";
import { toPng } from "html-to-image";
import { QuestionCard } from "@/components/question-card";
import { PageNavBar } from "@/components/page-nav-bar";
import { Share2, GitCompare, Clock, Check, ArrowUpRight, ArrowDownRight, Minus, Users, Shield, Eye, EyeOff, Loader2, Scan, Swords, Puzzle, Link, MessageSquare, X, Send, UserPlus, ExternalLink, BarChart3, BookOpen, ArrowLeft, RotateCcw, CircleCheckBig, Download, Zap, MessageCircle } from "lucide-react";
import { QuestionnaireIcon } from "@/components/questionnaire-icon";

type Tab = "compass" | "session" | "history" | "community" | "wallet";

interface Snapshot {
  id: string;
  snapshotName: string;
  dimensions: Record<string, number>;
  confidence: Record<string, number>;
  changeLog: string | null;
  createdAt: string;
  questionnaireId?: string | null;
  questionnaire?: { slug: string; title: string; titleFa: string; icon: string } | null;
}

interface QuestionnaireProgress {
  questionnaireId: string;
  slug: string;
  title: string;
  titleFa: string;
  description: string;
  descriptionFa: string;
  icon: string;
  total: number;
  answered: number;
  completed: boolean;
  progress: number;
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

interface MatchResult {
  userId: string;
  walletAddress: string;
  displayName: string | null;
  dimensions: Record<string, number>;
  score: number;
  mode: string;
  connectionStatus?: string | null;
  connectionId?: string | null;
  connectionDirection?: "sent" | "received" | null;
}

interface IncomingRequest {
  id: string;
  matchMode: string;
  matchScore: number;
  message: string | null;
  createdAt: string;
  sender: {
    id: string;
    displayName: string | null;
    walletAddress: string;
  };
}

interface Connection {
  connectionId: string;
  userId: string;
  displayName: string | null;
  walletAddress: string;
  matchMode: string;
  matchScore: number;
  connectedAt: string;
  blockscanChatUrl: string;
}

type MatchMode = "mirror" | "challenger" | "complement";

export default function DashboardPage() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const language = useAppStore((s) => s.language);
  const [tab, setTab] = useState<Tab>("compass");
  const [compassView, setCompassView] = useState<"2d" | "3d">("2d");
  const [showUserId, setShowUserId] = useState(false);
  const compassChartRef = useRef<HTMLDivElement>(null);
  const [compass, setCompass] = useState<{
    dimensions: Record<string, number>;
    confidence: Record<string, number>;
  } | null>(null);
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [snapshotName, setSnapshotName] = useState("");
  const [snapshotSaved, setSnapshotSaved] = useState(false);
  const [profileCopied, setProfileCopied] = useState(false);

  // Poke state
  const [receivedPokes, setReceivedPokes] = useState<{
    id: string;
    senderId: string;
    seen: boolean;
    mutual: boolean;
    createdAt: string;
    sender: { displayName: string | null; walletAddress: string };
  }[]>([]);
  const [unseenPokeCount, setUnseenPokeCount] = useState(0);

  // Compare state
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [diffLoading, setDiffLoading] = useState(false);

  // Frequency state
  const [frequency, setFrequency] = useState<string>("WEEKLY");

  // Community / Matchmaking state
  const [matchMode, setMatchMode] = useState<MatchMode>("mirror");
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);

  // Privacy settings state
  const [sharingMode, setSharingMode] = useState<string>("GHOST");
  const [displayName, setDisplayName] = useState("");
  const [matchThreshold, setMatchThreshold] = useState(0.8);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Connection state
  const [incomingRequests, setIncomingRequests] = useState<IncomingRequest[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectingTo, setConnectingTo] = useState<string | null>(null); // userId being connected to
  const [connectMessage, setConnectMessage] = useState("");
  const [respondingTo, setRespondingTo] = useState<string | null>(null); // connectionId being responded to

  // Session state
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);

  // Questionnaire state
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<QuestionnaireProgress | null>(null);
  const [questionnaireProgress, setQuestionnaireProgress] = useState<QuestionnaireProgress[]>([]);

  useEffect(() => {
    if (!user) {
      router.push("/connect");
      return;
    }

    async function load() {
      try {
        const [compassData, historyData, walletData, freqData, matchSettingsData, incomingData, connectionsData, progressData, pokesData, pokeCountData] = await Promise.all([
          getCompass(user!.id),
          getHistory(user!.id),
          getWallet(user!.id).catch(() => null),
          getFrequencyPreference().catch(() => null),
          getMatchSettings().catch(() => null),
          getIncomingRequests().catch(() => []),
          getConnections().catch(() => []),
          getQuestionnaireProgress().catch(() => []),
          getReceivedPokes().catch(() => []),
          getUnseenPokeCount().catch(() => ({ count: 0 })),
        ]);
        setCompass(compassData);
        setHistory(historyData);
        setWallet(walletData);
        if (freqData?.frequencyPreference) {
          setFrequency(freqData.frequencyPreference);
        }
        if (matchSettingsData) {
          setSharingMode(matchSettingsData.sharingMode ?? "GHOST");
          setDisplayName(matchSettingsData.displayName ?? "");
          setMatchThreshold(matchSettingsData.matchThreshold ?? 0.8);
        }
        setIncomingRequests(incomingData ?? []);
        setConnections(connectionsData ?? []);
        setQuestionnaireProgress(progressData ?? []);
        setReceivedPokes(pokesData ?? []);
        setUnseenPokeCount(pokeCountData?.count ?? 0);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      }
    }

    load();
  }, [user, router]);

  const handleShareProfile = useCallback(async () => {
    if (!user) return;
    const profileUrl = `${window.location.origin}/profile/${user.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: t("profile_title", language), url: profileUrl });
        return;
      } catch { /* cancelled */ }
    }
    await navigator.clipboard.writeText(profileUrl);
    setProfileCopied(true);
    setTimeout(() => setProfileCopied(false), 2000);
  }, [user, language]);

  const handleDownloadDiagram = useCallback(async () => {
    if (!compassChartRef.current) return;
    try {
      const el = compassChartRef.current;
      const dataUrl = await toPng(el, {
        width: el.offsetWidth * 2,
        height: el.offsetHeight * 2,
        canvasWidth: el.offsetWidth * 2,
        canvasHeight: el.offsetHeight * 2,
        pixelRatio: 2,
        backgroundColor: "#111",
        style: { transform: "scale(2)", transformOrigin: "top left" },
      });
      const link = document.createElement("a");
      link.download = "civic-compass.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download diagram:", err);
    }
  }, []);

  const handleShareDiagram = useCallback(async () => {
    if (!compassChartRef.current) return;
    try {
      const el = compassChartRef.current;
      const dataUrl = await toPng(el, {
        width: el.offsetWidth * 2,
        height: el.offsetHeight * 2,
        canvasWidth: el.offsetWidth * 2,
        canvasHeight: el.offsetHeight * 2,
        pixelRatio: 2,
        backgroundColor: "#111",
        style: { transform: "scale(2)", transformOrigin: "top left" },
      });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "civic-compass.png", { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "My Civic Compass" });
      } else {
        // Fallback: copy image URL to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Failed to share diagram:", err);
    }
  }, []);

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

  // Load matches for the selected mode
  async function loadMatches(mode: MatchMode) {
    setMatchesLoading(true);
    try {
      const result = await getMatches(mode, 10);
      setMatches(result);
    } catch (err) {
      console.error("Failed to load matches:", err);
      setMatches([]);
    } finally {
      setMatchesLoading(false);
    }
  }

  // Save privacy/sharing settings
  async function handleSaveSettings() {
    try {
      await updateMatchSettings({
        sharingMode,
        displayName: displayName || undefined,
        matchThreshold,
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  }

  // Send a connection request
  async function handleConnect(userId: string, matchMode: string, matchScore: number) {
    setConnectingTo(userId);
    try {
      await sendConnectionRequest({
        receiverId: userId,
        matchMode,
        matchScore,
        message: connectMessage || undefined,
      });
      setConnectMessage("");
      // Refresh matches to update connection status
      await loadMatches(matchMode as MatchMode);
      // Also refresh incoming requests in case of auto-accept
      const [inc, conns] = await Promise.all([
        getIncomingRequests().catch(() => []),
        getConnections().catch(() => []),
      ]);
      setIncomingRequests(inc ?? []);
      setConnections(conns ?? []);
    } catch (err) {
      console.error("Failed to send connection request:", err);
    } finally {
      setConnectingTo(null);
    }
  }

  // Accept or decline a connection request
  async function handleRespond(connectionId: string, action: "ACCEPTED" | "DECLINED") {
    setRespondingTo(connectionId);
    try {
      await respondToConnection(connectionId, action);
      // Refresh
      const [inc, conns] = await Promise.all([
        getIncomingRequests().catch(() => []),
        getConnections().catch(() => []),
      ]);
      setIncomingRequests(inc ?? []);
      setConnections(conns ?? []);
      // Refresh matches too
      if (matchMode) await loadMatches(matchMode);
    } catch (err) {
      console.error("Failed to respond to connection:", err);
    } finally {
      setRespondingTo(null);
    }
  }

  // Cancel a pending request
  async function handleCancelConnection(connectionId: string) {
    try {
      await cancelConnection(connectionId);
      if (matchMode) await loadMatches(matchMode);
    } catch (err) {
      console.error("Failed to cancel connection:", err);
    }
  }

  async function loadSession() {
    if (!user) return;
    setSessionLoading(true);
    try {
      const qs = await getNextQuestions(user.id, 999, selectedQuestionnaire?.questionnaireId);
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
    const qId = selectedQuestionnaire?.questionnaireId;
    try {
      await submitResponses(user.id, [
        { questionId, answerValue, responseTimeMs },
      ]);

      if (sessionIndex < sessionQuestions.length - 1) {
        setSessionIndex((i) => i + 1);
      } else {
        setSessionDone(true);
        // Refresh compass after session and auto-save snapshot
        const compassData = await getCompass(user.id, qId);
        setCompass(compassData);
        try {
          const label = selectedQuestionnaire
            ? `${selectedQuestionnaire.title} ${new Date().toISOString().split('T')[0]}`
            : `Session ${new Date().toISOString().split('T')[0]}`;
          await saveSnapshot(user.id, label, qId);
          const updatedHistory = await getHistory(user.id, qId);
          setHistory(updatedHistory);
        } catch {
          // Non-critical — just skip auto-snapshot
        }
        // Refresh questionnaire progress
        try {
          const progressData = await getQuestionnaireProgress();
          setQuestionnaireProgress(progressData ?? []);
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.error("Failed to submit session response:", err);
    }
  }

  if (!user) return null;

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: "compass", label: t("tab_compass", language) },
    { id: "session", label: t("tab_session", language) },
    { id: "history", label: t("tab_history", language) },
    { id: "community", label: t("tab_community", language), badge: unseenPokeCount },
    { id: "wallet", label: t("tab_wallet", language) },
  ];

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-12 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold glow-text">{t("dashboard_title", language)}</h1>
        <PageNavBar showHome={false} />
      </div>

      {/* Tab bar */}
      <div
        className="grid grid-cols-5 sm:flex gap-1 rounded-xl p-1 mb-6 sm:mb-8"
        style={{ background: "var(--bg-card)" }}
      >
        {tabs.map((tb) => (
          <button
            key={tb.id}
            onClick={() => {
              setTab(tb.id);
              if (tb.id === "community" && unseenPokeCount > 0) {
                markPokesSeen().then(() => setUnseenPokeCount(0)).catch(() => {});
              }
            }}
            className="relative flex-1 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all"
            style={{
              background:
                tab === tb.id ? "var(--accent-gradient)" : "transparent",
              color: tab === tb.id ? "#111111" : "var(--text-secondary)",
              fontWeight: tab === tb.id ? 700 : 500,
            }}
          >
            {tb.label}
            {tb.badge && tb.badge > 0 ? (
              <span className="absolute -top-1 -right-1 sm:top-0 sm:right-0 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[10px] font-bold px-1" style={{ background: "var(--error)", color: "#fff" }}>
                {tb.badge}
              </span>
            ) : null}
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

            {/* Download / Share */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowUserId((v) => !v)}
                className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all"
                style={{
                  background: showUserId ? "var(--accent-gradient-soft)" : "var(--component-primary)",
                  border: `1px solid ${showUserId ? "var(--border-accent)" : "var(--border-color)"}`,
                  color: showUserId ? "var(--accent-primary)" : "var(--text-secondary)",
                }}
                title={t("toggle_id", language)}
              >
                {showUserId ? <EyeOff size={12} strokeWidth={1.5} /> : <Eye size={12} strokeWidth={1.5} />}
                {t("show_id", language)}
              </button>
              <button
                onClick={handleDownloadDiagram}
                className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all"
                style={{
                  background: "var(--component-primary)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-secondary)",
                }}
              >
                <Download size={12} strokeWidth={1.5} />
                {t("download", language)}
              </button>
              <button
                onClick={handleShareDiagram}
                className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all"
                style={{
                  background: "var(--component-primary)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-secondary)",
                }}
              >
                <Share2 size={12} strokeWidth={1.5} />
                {t("share", language)}
              </button>
              <button
                onClick={handleShareProfile}
                className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all"
                style={{
                  background: profileCopied ? "var(--accent-gradient-soft)" : "var(--component-primary)",
                  border: `1px solid ${profileCopied ? "var(--border-accent)" : "var(--border-color)"}`,
                  color: profileCopied ? "var(--accent-primary)" : "var(--text-secondary)",
                }}
              >
                <ExternalLink size={12} strokeWidth={1.5} />
                {profileCopied ? t("copied", language) : t("share_profile", language)}
              </button>
            </div>
          </div>
          {compassView === "2d" ? (
            <PoliticalCompassChart
              ref={compassChartRef}
              dimensions={compass.dimensions}
              confidence={compass.confidence}
              userId={showUserId ? user?.id : undefined}
            />
          ) : (
            <Compass3D
              dimensions={compass.dimensions}
              confidence={compass.confidence}
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
                <><Check size={14} strokeWidth={1.5} /> {t("snapshot_saved", language)}</>
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
          {/* No questionnaire selected — show selector */}
          {!selectedQuestionnaire && sessionQuestions.length === 0 && !sessionDone ? (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <BookOpen size={32} strokeWidth={1.5} className="mx-auto" style={{ color: "var(--accent-primary)" }} />
                <h2 className="text-xl font-semibold">{t("questionnaire_choose", language)}</h2>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {t("session_ready_desc", language)}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {questionnaireProgress.map((qp) => (
                  <div
                    key={qp.questionnaireId}
                    onClick={() => {
                      setSelectedQuestionnaire(qp);
                      setSessionQuestions([]);
                      setSessionDone(false);
                    }}
                    role="button"
                    tabIndex={0}
                    className="text-left rounded-2xl p-5 transition-all hover:scale-[1.02] cursor-pointer"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <QuestionnaireIcon
                        name={qp.icon}
                        size={28}
                        strokeWidth={1.5}
                        style={{ color: "var(--accent-primary)" }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm">
                          {language === "fa" ? qp.titleFa : qp.title}
                        </h3>
                        <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                          {language === "fa" ? qp.descriptionFa : qp.description}
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--component-primary)" }}>
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${qp.progress}%`,
                                background: qp.completed ? "var(--success)" : "var(--accent-gradient)",
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                            {qp.answered}/{qp.total}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          {qp.completed ? (
                            <>
                              <span className="text-xs font-medium flex items-center gap-1" style={{ color: "var(--success)" }}>
                                <Check size={12} strokeWidth={1.5} /> {t("questionnaire_completed", language)}
                              </span>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (!user) return;
                                  try {
                                    // Save current state as snapshot before resetting
                                    const label = language === "fa" ? qp.titleFa : qp.title;
                                    await saveSnapshot(user.id, `Pre-retake: ${label}`, qp.questionnaireId);
                                    // Reset responses for this questionnaire
                                    await resetQuestionnaireResponses(qp.questionnaireId);
                                    // Refresh progress
                                    const prog = await getQuestionnaireProgress();
                                    setQuestionnaireProgress(prog);
                                  } catch (err) {
                                    console.error("Retake failed:", err);
                                  }
                                }}
                                className="text-xs font-medium flex items-center gap-1 px-2 py-0.5 rounded-lg transition-colors hover:opacity-80"
                                style={{ color: "var(--accent-primary)", background: "var(--component-primary)" }}
                              >
                                <RotateCcw size={12} strokeWidth={1.5} /> {t("questionnaire_retake", language)}
                              </button>
                            </>
                          ) : (
                            <span className="text-xs font-medium" style={{ color: "var(--accent-primary)" }}>
                              {qp.answered > 0 ? t("questionnaire_continue", language) : t("questionnaire_start", language)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {questionnaireProgress.length === 0 && (
                <p className="text-center py-8 text-sm" style={{ color: "var(--text-muted)" }}>
                  {t("loading_questions", language)}
                </p>
              )}
            </div>
          ) : !selectedQuestionnaire && sessionQuestions.length === 0 && !sessionDone ? (
            /* Fallback — shouldn't reach here */
            null
          ) : selectedQuestionnaire && sessionQuestions.length === 0 && !sessionDone && !sessionLoading ? (
            /* Questionnaire selected, ready to start */
            <div className="text-center py-12 space-y-4">
              <QuestionnaireIcon
                name={selectedQuestionnaire.icon}
                size={40}
                strokeWidth={1.5}
                style={{ color: "var(--accent-primary)" }}
              />
              <h2 className="text-xl font-semibold">
                {language === "fa" ? selectedQuestionnaire.titleFa : selectedQuestionnaire.title}
              </h2>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {language === "fa" ? selectedQuestionnaire.descriptionFa : selectedQuestionnaire.description}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {t("questionnaire_questions", language, { count: selectedQuestionnaire.total })} · {selectedQuestionnaire.answered} {t("questionnaire_progress", language)}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={loadSession} className="btn-primary">
                  {selectedQuestionnaire.answered > 0 ? t("questionnaire_continue", language) : t("questionnaire_start", language)}
                </button>
                <button
                  onClick={() => { setSelectedQuestionnaire(null); }}
                  className="btn-outline flex items-center gap-1.5 justify-center"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <ArrowLeft size={14} strokeWidth={1.5} /> {t("questionnaire_back", language)}
                </button>
              </div>
            </div>
          ) : sessionLoading ? (
            <p className="text-center py-12" style={{ color: "var(--text-secondary)" }}>
              {t("loading_questions", language)}
            </p>
          ) : sessionDone ? (
            <div className="text-center py-12 space-y-4">
              <CircleCheckBig size={48} strokeWidth={1.5} style={{ color: "var(--accent-primary)" }} />
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
                <button
                  onClick={() => {
                    setSelectedQuestionnaire(null);
                    setSessionQuestions([]);
                    setSessionDone(false);
                  }}
                  className="btn-outline flex items-center gap-1.5 justify-center"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <ArrowLeft size={14} strokeWidth={1.5} /> {t("questionnaire_back", language)}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {selectedQuestionnaire && (
                    <button
                      onClick={() => {
                        setSelectedQuestionnaire(null);
                        setSessionQuestions([]);
                        setSessionDone(false);
                      }}
                      className="p-1 rounded-lg transition-colors hover:bg-white/5"
                    >
                      <ArrowLeft size={16} strokeWidth={1.5} style={{ color: "var(--text-secondary)" }} />
                    </button>
                  )}
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {selectedQuestionnaire && (
                      <QuestionnaireIcon
                        name={selectedQuestionnaire.icon}
                        size={14}
                        strokeWidth={1.5}
                        className="mr-1 inline-block"
                        style={{ color: "var(--accent-primary)" }}
                      />
                    )}
                    {t("question_of", language, { current: sessionIndex + 1, total: sessionQuestions.length })}
                  </p>
                </div>
                <div className="flex gap-1 flex-wrap max-w-full">
                  {sessionQuestions.map((_, i) => (
                    <div
                      key={i}
                      className="w-2.5 h-2.5 rounded-full transition-all flex-shrink-0"
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
                  <GitCompare size={16} strokeWidth={1.5} style={{ color: "var(--accent-primary)" }} />
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
                    <GitCompare size={14} strokeWidth={1.5} />
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
                            {d.delta > 0 ? <ArrowUpRight size={10} strokeWidth={1.5} /> : d.delta < 0 ? <ArrowDownRight size={10} strokeWidth={1.5} /> : <Minus size={10} strokeWidth={1.5} />}
                            {d.delta > 0 ? "+" : ""}{d.delta.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Overlay comparison chart */}
                  <div className="mt-4">
                    <PoliticalCompassChart
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
                          {isSelected && <Check size={10} color="#111" strokeWidth={2.5} />}
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
                              <Clock size={11} strokeWidth={1.5} />
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

      {/* Community tab */}
      {tab === "community" && (
        <div className="space-y-6">
          {/* Received Pokes */}
          {receivedPokes.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Zap size={14} strokeWidth={1.5} style={{ color: "var(--accent-primary)" }} />
                {t("pokes_title", language)}
                <span className="text-xs font-mono rounded-full px-2 py-0.5" style={{ background: "var(--accent-gradient-soft)", color: "var(--accent-primary)" }}>
                  {receivedPokes.length}
                </span>
              </h3>
              <div className="space-y-2">
                {receivedPokes.map((poke) => (
                  <div key={poke.id} className="card p-4" style={{ border: poke.seen ? undefined : "1px solid var(--border-accent)" }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{
                            background: poke.mutual ? "var(--accent-gradient)" : "var(--accent-gradient-soft)",
                            color: poke.mutual ? "#111" : "var(--accent-primary)",
                            border: `1px solid ${poke.mutual ? "transparent" : "var(--border-accent)"}`,
                          }}
                        >
                          {poke.mutual ? <MessageCircle size={14} strokeWidth={1.5} /> : <Zap size={14} strokeWidth={1.5} />}
                        </div>
                        <div>
                          <button
                            className="text-sm font-medium hover:underline"
                            onClick={() => router.push(`/profile/${poke.senderId}`)}
                          >
                            {poke.sender.displayName || t("anonymous_user", language)}
                          </button>
                          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                            {poke.mutual ? t("poke_mutual", language) : t("poke_from", language)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {poke.mutual ? (
                          <a
                            href={`https://chat.blockscan.com/eth/${poke.sender.walletAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5"
                          >
                            <MessageSquare size={12} strokeWidth={1.5} />
                            {t("chat_blockscan", language)}
                            <ExternalLink size={10} strokeWidth={1.5} />
                          </a>
                        ) : (
                          <button
                            onClick={async () => {
                              try {
                                const result = await sendPoke(poke.senderId);
                                // Refresh pokes
                                const updated = await getReceivedPokes();
                                setReceivedPokes(updated ?? []);
                              } catch (err) {
                                console.error("Failed to poke back:", err);
                              }
                            }}
                            className="btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5"
                          >
                            <Zap size={12} strokeWidth={1.5} />
                            {t("poke_back", language)}
                          </button>
                        )}
                        <button
                          onClick={() => router.push(`/profile/${poke.senderId}`)}
                          className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1"
                        >
                          <ExternalLink size={12} strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Privacy settings card */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Shield size={16} strokeWidth={1.5} style={{ color: "var(--accent-primary)" }} />
              <h3 className="text-sm font-semibold">{t("privacy_title", language)}</h3>
            </div>

            {/* Sharing mode selector */}
            <div>
              <p className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>
                {t("sharing_mode", language)}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { mode: "GHOST", icon: <EyeOff size={14} strokeWidth={1.5} />, label: t("mode_ghost", language), desc: t("mode_ghost_desc", language) },
                  { mode: "PUBLIC", icon: <Eye size={14} strokeWidth={1.5} />, label: t("mode_public", language), desc: t("mode_public_desc", language) },
                  { mode: "SELECTIVE", icon: <Users size={14} strokeWidth={1.5} />, label: t("mode_selective", language), desc: t("mode_selective_desc", language) },
                ] as const).map((opt) => (
                  <button
                    key={opt.mode}
                    onClick={() => setSharingMode(opt.mode)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-all"
                    style={{
                      background: sharingMode === opt.mode ? "var(--accent-gradient-soft)" : "var(--component-primary)",
                      border: `1px solid ${sharingMode === opt.mode ? "var(--border-accent)" : "var(--border-color)"}`,
                      color: sharingMode === opt.mode ? "var(--accent-primary)" : "var(--text-secondary)",
                    }}
                  >
                    {opt.icon}
                    <span className="text-xs font-semibold">{opt.label}</span>
                    <span className="text-[10px] leading-tight" style={{ color: "var(--text-muted)" }}>{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Display name */}
            <div>
              <label className="text-xs block mb-1" style={{ color: "var(--text-secondary)" }}>
                {t("display_name", language)}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t("display_name_placeholder", language)}
                className="w-full rounded-xl px-4 py-2 text-sm outline-none min-h-[44px]"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {/* Match threshold slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {t("match_threshold_label", language)}
                </label>
                <span className="text-xs font-mono" style={{ color: "var(--accent-primary)" }}>
                  {Math.round(matchThreshold * 100)}%
                </span>
              </div>
              <p className="text-[10px] mb-2" style={{ color: "var(--text-muted)" }}>
                {t("match_threshold_desc", language)}
              </p>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(matchThreshold * 100)}
                onChange={(e) => setMatchThreshold(parseInt(e.target.value) / 100)}
                className="w-full accent-[var(--accent-primary)]"
              />
            </div>

            {/* Save button */}
            <button
              onClick={handleSaveSettings}
              className="btn-primary text-sm py-2 px-6 w-full justify-center flex items-center gap-1.5"
            >
              {settingsSaved ? (
                <><Check size={14} strokeWidth={1.5} /> {t("settings_saved", language)}</>
              ) : (
                t("save_snapshot", language)
              )}
            </button>
          </div>

          {/* Match mode selector */}
          <div>
            <h3 className="text-sm font-semibold mb-3">{t("community_title", language)}</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {([
                { mode: "mirror" as MatchMode, label: t("mode_mirror", language), desc: t("mode_mirror_desc", language), icon: <Scan size={18} strokeWidth={1.5} /> },
                { mode: "challenger" as MatchMode, label: t("mode_challenger", language), desc: t("mode_challenger_desc", language), icon: <Swords size={18} strokeWidth={1.5} /> },
                { mode: "complement" as MatchMode, label: t("mode_complement", language), desc: t("mode_complement_desc", language), icon: <Puzzle size={18} strokeWidth={1.5} /> },
              ]).map((opt) => (
                <button
                  key={opt.mode}
                  onClick={() => { setMatchMode(opt.mode); loadMatches(opt.mode); }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-all"
                  style={{
                    background: matchMode === opt.mode ? "var(--accent-gradient)" : "var(--component-primary)",
                    border: `1px solid ${matchMode === opt.mode ? "transparent" : "var(--border-color)"}`,
                    color: matchMode === opt.mode ? "#111" : "var(--text-secondary)",
                  }}
                >
                  {opt.icon}
                  <span className="text-xs font-semibold">{opt.label}</span>
                  <span className="text-[10px] leading-tight" style={{ color: matchMode === opt.mode ? "rgba(0,0,0,0.6)" : "var(--text-muted)" }}>
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Match results */}
          {matchesLoading ? (
            <div className="flex items-center justify-center py-12 gap-2" style={{ color: "var(--text-secondary)" }}>
              <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
              <span className="text-sm">{t("loading_matches", language)}</span>
            </div>
          ) : matches.length === 0 && matchMode ? (
            <p className="text-center py-8 text-sm" style={{ color: "var(--text-muted)" }}>
              {t("no_matches", language)}
            </p>
          ) : (
            <div className="space-y-3">
              {matches.map((m) => (
                <div
                  key={m.userId}
                  className="card overflow-hidden transition-all"
                  style={{
                    border: expandedMatch === m.userId ? "1px solid var(--border-accent)" : undefined,
                  }}
                >
                  <button
                    onClick={() => setExpandedMatch(expandedMatch === m.userId ? null : m.userId)}
                    className="w-full p-4 flex items-center justify-between text-start"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{
                          background: m.connectionStatus === "ACCEPTED" ? "var(--success)" : "var(--accent-gradient-soft)",
                          color: m.connectionStatus === "ACCEPTED" ? "#fff" : "var(--accent-primary)",
                          border: `1px solid ${m.connectionStatus === "ACCEPTED" ? "var(--success)" : "var(--border-accent)"}`,
                        }}
                      >
                        {m.connectionStatus === "ACCEPTED"
                          ? <Link size={14} strokeWidth={1.5} />
                          : (m.displayName || m.walletAddress)[0].toUpperCase()
                        }
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {m.displayName || t("anonymous_user", language)}
                        </p>
                        <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                          {m.walletAddress}
                        </p>
                      </div>
                    </div>
                    <div className="text-end">
                      <p className="text-lg font-bold text-gradient">
                        {Math.round(m.score * 100)}%
                      </p>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                        {t("match_score", language)}
                      </p>
                    </div>
                  </button>

                  {/* Expanded: compass overlay + connection action */}
                  {expandedMatch === m.userId && compass && (
                    <div className="px-4 pb-4 pt-0 space-y-3">
                      <PoliticalCompassChart
                        dimensions={m.dimensions}
                        confidence={{}}
                        overlayDimensions={compass.dimensions}
                      />
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(m.dimensions).map(([axis, val]) => (
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

                      {/* Connection action buttons */}
                      <div className="pt-2 border-t" style={{ borderColor: "var(--border-color)" }}>
                        {m.connectionStatus === "ACCEPTED" ? (
                          <a
                            href={`https://chat.blockscan.com/eth/${m.walletAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary text-sm py-2 px-4 w-full flex items-center justify-center gap-2"
                          >
                            <MessageSquare size={14} strokeWidth={1.5} />
                            {t("chat_blockscan", language)}
                            <ExternalLink size={12} strokeWidth={1.5} />
                          </a>
                        ) : m.connectionStatus === "PENDING" && m.connectionDirection === "sent" ? (
                          <div className="flex gap-2">
                            <span className="flex-1 flex items-center justify-center gap-1.5 text-sm py-2 rounded-xl" style={{ background: "var(--component-primary)", color: "var(--text-muted)" }}>
                              <Clock size={14} strokeWidth={1.5} />
                              {t("pending_btn", language)}
                            </span>
                            <button
                              onClick={() => m.connectionId && handleCancelConnection(m.connectionId)}
                              className="btn-outline text-sm py-2 px-4 flex items-center gap-1.5"
                              style={{ color: "var(--error)" }}
                            >
                              <X size={14} strokeWidth={1.5} />
                              {t("cancel_btn", language)}
                            </button>
                          </div>
                        ) : m.connectionStatus === "PENDING" && m.connectionDirection === "received" ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => m.connectionId && handleRespond(m.connectionId, "ACCEPTED")}
                              className="btn-primary text-sm py-2 px-4 flex-1 flex items-center justify-center gap-1.5"
                              disabled={respondingTo === m.connectionId}
                            >
                              <Check size={14} strokeWidth={1.5} />
                              {t("accept_btn", language)}
                            </button>
                            <button
                              onClick={() => m.connectionId && handleRespond(m.connectionId, "DECLINED")}
                              className="btn-outline text-sm py-2 px-4 flex items-center gap-1.5"
                              style={{ color: "var(--error)" }}
                              disabled={respondingTo === m.connectionId}
                            >
                              <X size={14} strokeWidth={1.5} />
                              {t("decline_btn", language)}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleConnect(m.userId, m.mode, m.score)}
                            className="btn-primary text-sm py-2 px-4 w-full flex items-center justify-center gap-1.5"
                            disabled={connectingTo === m.userId}
                          >
                            {connectingTo === m.userId ? (
                              <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
                            ) : (
                              <UserPlus size={14} strokeWidth={1.5} />
                            )}
                            {t("connect_btn", language)}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Incoming connection requests */}
          {incomingRequests.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <UserPlus size={14} strokeWidth={1.5} style={{ color: "var(--accent-primary)" }} />
                {t("incoming_requests", language)}
                <span className="text-xs font-mono rounded-full px-2 py-0.5" style={{ background: "var(--accent-gradient-soft)", color: "var(--accent-primary)" }}>
                  {incomingRequests.length}
                </span>
              </h3>
              <div className="space-y-2">
                {incomingRequests.map((req) => (
                  <div key={req.id} className="card p-4" style={{ border: "1px solid var(--border-accent)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{
                            background: "var(--accent-gradient-soft)",
                            color: "var(--accent-primary)",
                            border: "1px solid var(--border-accent)",
                          }}
                        >
                          {(req.sender.displayName || req.sender.walletAddress)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{req.sender.displayName || t("anonymous_user", language)}</p>
                          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                            {t("match_mode_label", language)}: {req.matchMode} · {Math.round(req.matchScore * 100)}%
                          </p>
                        </div>
                      </div>
                    </div>
                    {req.message && (
                      <p className="text-xs mb-3 px-3 py-2 rounded-lg" style={{ background: "var(--component-primary)", color: "var(--text-secondary)" }}>
                        &ldquo;{req.message}&rdquo;
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRespond(req.id, "ACCEPTED")}
                        className="btn-primary text-xs py-1.5 px-4 flex-1 flex items-center justify-center gap-1.5"
                        disabled={respondingTo === req.id}
                      >
                        <Check size={12} strokeWidth={1.5} />
                        {t("accept_btn", language)}
                      </button>
                      <button
                        onClick={() => handleRespond(req.id, "DECLINED")}
                        className="btn-outline text-xs py-1.5 px-4 flex items-center gap-1.5"
                        style={{ color: "var(--error)" }}
                        disabled={respondingTo === req.id}
                      >
                        <X size={12} strokeWidth={1.5} />
                        {t("decline_btn", language)}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active connections */}
          {connections.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Link size={14} strokeWidth={1.5} style={{ color: "var(--success)" }} />
                {t("your_connections", language)}
                <span className="text-xs font-mono rounded-full px-2 py-0.5" style={{ background: "rgba(14, 187, 144, 0.1)", color: "var(--success)" }}>
                  {connections.length}
                </span>
              </h3>
              <div className="space-y-2">
                {connections.map((c) => (
                  <div key={c.connectionId} className="card p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm"
                          style={{ background: "var(--success)", color: "#fff" }}
                        >
                          <Link size={14} strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{c.displayName || t("anonymous_user", language)}</p>
                          <p className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>
                            {c.walletAddress}
                          </p>
                          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                            {t("match_mode_label", language)}: {c.matchMode} · {Math.round(c.matchScore * 100)}%
                          </p>
                        </div>
                      </div>
                    </div>
                    <a
                      href={c.blockscanChatUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-xs py-2 px-4 mt-3 w-full flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={14} strokeWidth={1.5} />
                      {t("chat_blockscan", language)}
                      <ExternalLink size={12} strokeWidth={1.5} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
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

      {/* Public Analytics link */}
      <div className="mt-8 text-center">
        <button
          onClick={() => router.push("/analytics")}
          className="btn-outline text-sm py-2 px-6 inline-flex items-center gap-2"
          style={{ color: "var(--text-muted)" }}
        >
          <BarChart3 size={14} strokeWidth={1.5} />
          {t("analytics_explore", language)}
        </button>
      </div>
    </main>
  );
}
