"use client";

import { getFlashcardDeck } from "@/lib/api";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { ArrowLeft, BookOpen, Check, ExternalLink, GraduationCap, Loader2, Share2 } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";

interface DeckData {
  id: string;
  code: string;
  titleFa: string;
  titleEn: string;
  description?: string;
  icon: string;
  cards: { id: string; front: string; back: string; articleRef?: string; difficulty: string; order: number }[];
}

export default function LearnDeckPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const language = useAppStore((s) => s.language);
  const [deck, setDeck] = useState<DeckData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getFlashcardDeck(code)
      .then(setDeck)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [code]);

  const rtl = language === "fa";
  const dir = rtl ? "rtl" : "ltr";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin" style={{ color: "var(--text-muted)" }} />
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <GraduationCap size={48} style={{ color: "var(--text-muted)" }} />
        <p className="text-lg font-medium" style={{ color: "var(--text-primary)" }}>
          {rtl ? "مجموعه پیدا نشد" : "Deck not found"}
        </p>
        <Link href="/dashboard?tab=learn" className="btn-primary px-6 py-2 text-sm rounded-lg">
          {rtl ? "بازگشت به یادگیری" : "Back to Learn"}
        </Link>
      </div>
    );
  }

  const title = rtl ? deck.titleFa : deck.titleEn;

  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
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
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-3xl mx-auto" style={{ direction: dir }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard?tab=learn"
          className="p-2 rounded-lg hover:opacity-70 transition-opacity"
        >
          <ArrowLeft size={20} strokeWidth={1.5} style={{ transform: rtl ? "scaleX(-1)" : undefined }} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{deck.icon}</span>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{title}</h1>
          </div>
          {deck.description && (
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{deck.description}</p>
          )}
        </div>
        <button
          onClick={handleShare}
          className="p-2 rounded-lg hover:opacity-70 transition-opacity"
          aria-label={t("flashcard_share", language)}
          style={{ color: copied ? "var(--accent-primary)" : "var(--text-muted)" }}
        >
          {copied ? <Check size={20} /> : <Share2 size={20} />}
        </button>
      </div>

      {/* Card count */}
      <div className="flex items-center gap-2 mb-6 text-sm" style={{ color: "var(--text-muted)" }}>
        <BookOpen size={14} />
        <span>{deck.cards.length} {t("flashcard_cards", language)}</span>
      </div>

      {/* CTA */}
      <div className="card p-5 mb-6 text-center">
        <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
          {rtl
            ? "برای شروع یادگیری تعاملی و کسب جوایز وارد شوید"
            : "Sign in to start interactive learning and earn rewards"}
        </p>
        <Link
          href="/dashboard?tab=learn"
          className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg"
        >
          <GraduationCap size={16} />
          {rtl ? "شروع یادگیری" : "Start Learning"}
        </Link>
      </div>

      {/* Card preview grid */}
      <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
        {rtl ? "پیش‌نمایش کارت‌ها" : "Card Preview"}
      </h2>
      <div className="space-y-3">
        {deck.cards.map((card) => {
          const isFlipped = flippedCards.has(card.id);
          return (
            <div
              key={card.id}
              className="card p-4 cursor-pointer transition-all hover:shadow-md"
              onClick={() =>
                setFlippedCards((prev) => {
                  const next = new Set(prev);
                  if (next.has(card.id)) next.delete(card.id);
                  else next.add(card.id);
                  return next;
                })
              }
            >
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)", direction: "rtl" }}>
                {card.front}
              </p>
              {isFlipped && (
                <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--border-color)" }}>
                  <p className="text-sm" style={{ color: "var(--text-secondary)", direction: "rtl" }}>
                    {card.back}
                  </p>
                  {card.articleRef && (
                    <a
                      href={(() => {
                        const m = card.articleRef.match(/Article\s*(\d+)/i);
                        if (m) return `https://www.un.org/en/about-us/universal-declaration-of-human-rights#article-${m[1]}`;
                        return deck.sourceUrl || "#";
                      })()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs mt-2 hover:underline"
                      style={{ color: "var(--accent-primary)" }}
                    >
                      {t("flashcard_article", language)} <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
