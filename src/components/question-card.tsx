"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { t, axisLabel } from "@/lib/i18n";
import { questionsFa } from "@/lib/questions-fa";

interface Question {
  id: string;
  text: string;
  weights: Record<string, number>;
}

interface QuestionCardProps {
  question: Question;
  onAnswer: (questionId: string, value: number, responseTimeMs: number) => void;
}

export function QuestionCard({ question, onAnswer }: QuestionCardProps) {
  const [value, setValue] = useState(0);
  const [startTime] = useState(Date.now());
  const language = useAppStore((s) => s.language);

  const handleSubmit = () => {
    const responseTimeMs = Date.now() - startTime;
    onAnswer(question.id, value, responseTimeMs);
  };

  const axes = Object.keys(question.weights);
  const questionText =
    language === "fa" ? questionsFa[question.text] ?? question.text : question.text;

  return (
    <div className="card p-4 sm:p-6 max-w-lg mx-auto">
      <div className="mb-2 flex gap-2 flex-wrap">
        {axes.map((axis) => (
          <span key={axis} className="tag text-xs">
            {axisLabel(axis, language)}
          </span>
        ))}
      </div>

      <p className="text-base sm:text-lg font-medium mb-6 leading-relaxed" style={{ color: "var(--text-primary)" }}>
        {questionText}
      </p>

      <div className="space-y-4">
        <div className="flex justify-between text-xs sm:text-sm" style={{ color: "var(--text-muted)" }}>
          <span>{t("strongly_disagree", language)}</span>
          <span>{t("strongly_agree", language)}</span>
        </div>

        <input
          type="range"
          min={-1}
          max={1}
          step={0.1}
          value={value}
          onChange={(e) => setValue(parseFloat(e.target.value))}
          className="w-full"
          style={{ direction: "ltr" }}
        />

        <div className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
          {value === 0
            ? t("neutral", language)
            : value > 0
              ? `${t("agree", language)} (${(value * 100).toFixed(0)}%)`
              : `${t("disagree", language)} (${(Math.abs(value) * 100).toFixed(0)}%)`}
        </div>

        <button
          onClick={handleSubmit}
          className="btn-primary w-full justify-center"
        >
          {t("submit", language)}
        </button>
      </div>
    </div>
  );
}
