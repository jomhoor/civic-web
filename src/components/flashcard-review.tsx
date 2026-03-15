"use client";

import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { ChevronLeft, ChevronRight, Eye, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface Card {
  id: string;
  front: string;
  back: string;
  type: string;
  articleRef?: string | null;
  difficulty: string;
  order: number;
}

interface FlashcardReviewProps {
  cards: Card[];
  deckTitleFa: string;
  deckTitleEn: string;
  onReview: (cardId: string, status: string) => Promise<void>;
  onComplete: () => void;
  onBack: () => void;
  masteredCardIds: Set<string>;
}

export function FlashcardReview({
  cards,
  deckTitleFa,
  deckTitleEn,
  onReview,
  onComplete,
  onBack,
  masteredCardIds,
}: FlashcardReviewProps) {
  const language = useAppStore((s) => s.language);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewStartTime, setReviewStartTime] = useState(Date.now());
  const [localMastered, setLocalMastered] = useState<Set<string>>(new Set(masteredCardIds));
  const [saving, setSaving] = useState(false);

  // Filter to cards not yet mastered for the session
  const remainingCards = cards.filter((c) => !localMastered.has(c.id));
  const currentCard = remainingCards[currentIndex % Math.max(remainingCards.length, 1)];
  const allMastered = remainingCards.length === 0;

  useEffect(() => {
    setReviewStartTime(Date.now());
    setShowAnswer(false);
  }, [currentIndex]);

  const handleRating = useCallback(
    async (status: string) => {
      if (!currentCard || saving) return;
      const elapsed = Date.now() - reviewStartTime;
      if (elapsed < 3000) return; // anti-cheat: minimum 3 seconds

      setSaving(true);
      try {
        await onReview(currentCard.id, status);

        if (status === "MASTERED") {
          setLocalMastered((prev) => new Set(prev).add(currentCard.id));
        }

        setShowAnswer(false);

        // Move to next card
        const nextRemaining = cards.filter(
          (c) => !localMastered.has(c.id) && !(status === "MASTERED" && c.id === currentCard.id)
        );
        if (nextRemaining.length === 0) {
          // All done
        } else {
          setCurrentIndex((i) => (i + 1) % nextRemaining.length);
        }
      } finally {
        setSaving(false);
      }
    },
    [currentCard, saving, reviewStartTime, onReview, cards, localMastered]
  );

  // Check completion
  useEffect(() => {
    if (allMastered && cards.length > 0) {
      onComplete();
    }
  }, [allMastered, cards.length, onComplete]);

  if (allMastered) {
    return null; // Parent handles the completion modal
  }

  if (!currentCard) return null;

  const progressText = `${localMastered.size} ${t("flashcard_of", language)} ${cards.length}`;

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <ChevronLeft size={16} />
          {t("flashcard_back_to_decks", language)}
        </button>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {progressText}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full rounded-full h-1.5 mb-6" style={{ background: "var(--bg-secondary)" }}>
        <div
          className="h-1.5 rounded-full transition-all"
          style={{
            width: `${(localMastered.size / cards.length) * 100}%`,
            background: "var(--accent-gradient)",
          }}
        />
      </div>

      {/* Card */}
      <div className="card p-6 sm:p-8 min-h-[280px] flex flex-col">
        {/* Article reference tag */}
        {currentCard.articleRef && (
          <span
            className="tag text-xs self-start mb-3"
          >
            {t("flashcard_article", language)} {currentCard.articleRef.replace("Article ", "")}
          </span>
        )}

        {/* Difficulty */}
        <span
          className="text-[10px] uppercase tracking-wider self-start mb-4"
          style={{
            color: currentCard.difficulty === "ADVANCED"
              ? "var(--error)"
              : currentCard.difficulty === "INTERMEDIATE"
                ? "var(--warning, #f59e0b)"
                : "var(--success, #22c55e)",
          }}
        >
          {currentCard.difficulty}
        </span>

        {/* Front (question) */}
        <div className="flex-1 flex items-center justify-center">
          <p
            className="text-base sm:text-lg font-medium text-center leading-relaxed"
            style={{ color: "var(--text-primary)", direction: "rtl" }}
          >
            {currentCard.front}
          </p>
        </div>

        {/* Answer section */}
        {showAnswer ? (
          <div
            className="mt-6 pt-4 border-t"
            style={{ borderColor: "var(--border)", direction: "rtl" }}
          >
            <p
              className="text-sm sm:text-base leading-relaxed mb-6"
              style={{ color: "var(--text-secondary)" }}
            >
              {currentCard.back}
            </p>

            {/* Rating buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleRating("SEEN")}
                disabled={saving}
                className="px-2 py-4 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer w-full"
                style={{ background: "rgba(239,68,68,0.15)", color: "var(--error)" }}
              >
                {t("flashcard_didnt_know", language)}
              </button>
              <button
                onClick={() => handleRating("LEARNING")}
                disabled={saving}
                className="px-2 py-4 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer w-full"
                style={{ background: "rgba(245,158,11,0.15)", color: "var(--warning, #f59e0b)" }}
              >
                {t("flashcard_almost", language)}
              </button>
              <button
                onClick={() => handleRating("MASTERED")}
                disabled={saving}
                className="px-2 py-4 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer w-full"
                style={{ background: "rgba(34,197,94,0.15)", color: "var(--success, #22c55e)" }}
              >
                {t("flashcard_knew_it", language)}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAnswer(true)}
            className="mt-6 btn-primary w-full justify-center"
          >
            <Eye size={16} />
            {t("flashcard_show_answer", language)}
          </button>
        )}
      </div>

      {/* Card counter */}
      <p className="text-center text-xs mt-3" style={{ color: "var(--text-muted)" }}>
        {currentIndex + 1} / {remainingCards.length} {t("flashcard_cards", language)}
      </p>
    </div>
  );
}
