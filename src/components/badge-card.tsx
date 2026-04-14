"use client";

import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { Check, Info, Lock, Share2, Trophy, Wallet } from "lucide-react";
import { useState } from "react";

interface FlashcardDeck {
  id: string;
  code: string;
  titleFa: string;
  titleEn: string;
  description?: string;
  icon: string;
  totalCards: number;
  completedCards: number;
  rewardClaimed: boolean;
  rewardUsd: number;
}

interface BadgeCardProps {
  deck: FlashcardDeck;
  onStart: (code: string) => void;
}

export function BadgeCard({ deck, onStart }: BadgeCardProps) {
  const language = useAppStore((s) => s.language);
  const isGuest = useAppStore((s) => s.isGuest);
  const [showInfo, setShowInfo] = useState(false);
  const [copied, setCopied] = useState(false);

  const isCompleted = deck.completedCards >= deck.totalCards && deck.totalCards > 0;
  const hasStarted = deck.completedCards > 0;
  const progress = deck.totalCards > 0 ? (deck.completedCards / deck.totalCards) * 100 : 0;

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/learn/${deck.code}`;

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: deck.titleFa || deck.titleEn, url: shareUrl });
        return;
      } catch {
        // fallback to clipboard
      }
    }
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="card p-4 sm:p-5 relative overflow-hidden transition-all hover:scale-[1.02]"
      style={{
        opacity: isCompleted ? 1 : 0.95,
        border: isCompleted ? "1px solid var(--accent)" : undefined,
      }}
    >
      {/* Info & Share buttons */}
      <div className="absolute top-2 right-2 flex items-center gap-1">
        <button
          onClick={handleShare}
          className="p-1 rounded-full transition-colors"
          style={{ color: copied ? "var(--accent-primary)" : "var(--text-muted)" }}
          aria-label={t("flashcard_share", language)}
        >
          {copied ? <Check size={14} /> : <Share2 size={14} />}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowInfo(!showInfo);
          }}
          className="p-1 rounded-full transition-colors"
          style={{ color: "var(--text-muted)" }}
          aria-label="Info"
        >
          <Info size={16} />
        </button>
      </div>

      {/* Info tooltip overlay */}
      {showInfo && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center p-4 rounded-xl"
          style={{ background: "var(--bg-card)", opacity: 0.97 }}
          onClick={() => setShowInfo(false)}
        >
          <div className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
            <p className="mb-2 font-medium" style={{ color: "var(--text-primary)" }}>
              {language === "fa" ? deck.titleFa : deck.titleEn}
            </p>
            <p className="mb-3">
              {deck.description ?? (language === "fa" ? deck.titleFa : deck.titleEn)}
            </p>
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: "var(--accent-gradient)", color: "#111" }}
            >
              {isGuest ? <Wallet size={12} /> : <Trophy size={12} />}
              {t(isGuest ? "flashcard_reward_info_guest" : "flashcard_reward_info", language)}
            </div>
          </div>
        </div>
      )}

      {/* Badge icon */}
      <div className="text-center mb-3">
        <div className="text-3xl sm:text-4xl mb-1">
          {isCompleted ? (
            <span>{deck.icon}</span>
          ) : (
            <span style={{ filter: "grayscale(100%)", opacity: 0.5 }}>
              <Lock size={28} className="inline" style={{ color: "var(--text-muted)" }} />
            </span>
          )}
        </div>
        <h3
          className="text-sm sm:text-base font-semibold leading-tight"
          style={{ color: "var(--text-primary)", direction: language === "fa" ? "rtl" : "ltr" }}
        >
          {language === "fa" ? deck.titleFa : deck.titleEn}
        </h3>
      </div>

      {/* Status */}
      <div className="space-y-2">
        {/* Reward badge */}
        {isCompleted && deck.rewardClaimed ? (
          <div
            className="flex items-center justify-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg"
            style={{ background: "rgba(34,197,94,0.15)", color: "var(--success, #22c55e)" }}
          >
            ✓ {t("flashcard_reward_claimed", language)}
          </div>
        ) : isGuest ? (
          <div
            className="flex items-center justify-center gap-1.5 text-xs px-2 py-1 rounded-lg"
            style={{ background: "rgba(99,102,241,0.1)", color: "var(--text-muted)" }}
          >
            <Wallet size={11} />
            {t("flashcard_reward_requires_wallet", language)}
          </div>
        ) : (
          <div
            className="flex items-center justify-center gap-1.5 text-xs px-2 py-1 rounded-lg"
            style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}
          >
            <Trophy size={11} />
            ~{deck.rewardUsd} USDC
          </div>
        )}

        {/* Progress bar */}
        <div className="w-full rounded-full h-1.5" style={{ background: "var(--bg-secondary)" }}>
          <div
            className="h-1.5 rounded-full transition-all"
            style={{
              width: `${progress}%`,
              background: isCompleted ? "var(--success, #22c55e)" : "var(--accent-gradient)",
            }}
          />
        </div>

        {/* Progress text */}
        <p className="text-xs text-center" style={{ color: "var(--text-muted)", direction: "rtl" }}>
          {deck.completedCards} {t("flashcard_of", language)} {deck.totalCards} {t("flashcard_cards", language)}
        </p>

        {/* Action button */}
        <button
          onClick={() => onStart(deck.code)}
          className="w-full py-2 rounded-lg text-xs sm:text-sm font-medium transition-all"
          style={{
            background: isCompleted ? "var(--bg-secondary)" : "var(--accent-gradient)",
            color: isCompleted ? "var(--text-secondary)" : "#111",
          }}
        >
          {isCompleted
            ? t("flashcard_review", language)
            : hasStarted
              ? t("flashcard_continue", language)
              : t("flashcard_start", language)}
        </button>
      </div>
    </div>
  );
}
