"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCalibrationQuestions, submitResponses, seedQuestions } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { QuestionCard } from "@/components/question-card";
import { t } from "@/lib/i18n";

interface Question {
  id: string;
  text: string;
  weights: Record<string, number>;
}

export default function CalibrationPage() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const language = useAppStore((s) => s.language);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [answeredCount, setAnsweredCount] = useState(0);

  useEffect(() => {
    if (!user) {
      router.push("/connect");
      return;
    }

    async function loadQuestions() {
      try {
        // Try to seed questions first (idempotent)
        await seedQuestions();
        const qs = await getCalibrationQuestions();
        setQuestions(qs);
      } catch (err) {
        console.error("Failed to load questions:", err);
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, [user, router]);

  async function handleAnswer(
    questionId: string,
    answerValue: number,
    responseTimeMs: number
  ) {
    if (!user) return;

    try {
      await submitResponses(user.id, [
        { questionId, answerValue, responseTimeMs },
      ]);
      setAnsweredCount((c) => c + 1);

      if (currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        // All calibration questions answered
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Failed to submit response:", err);
    }
  }

  if (!user) return null;

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p style={{ color: "var(--text-secondary)" }}>{t("calibration_loading", language)}</p>
      </main>
    );
  }

  if (questions.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p style={{ color: "var(--text-secondary)" }}>{t("calibration_no_questions", language)}</p>
      </main>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold glow-text">{t("calibration_title", language)}</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {t("calibration_desc", language)}
          </p>
          <div className="flex justify-center gap-1.5 pt-2">
            {questions.map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full transition-all"
                style={{
                  background:
                    i < answeredCount
                      ? "var(--accent-primary)"
                      : i === currentIndex
                        ? "rgba(91, 157, 245, 0.35)"
                        : "var(--component-primary)",
                  boxShadow:
                    i === currentIndex
                      ? "0 0 0 2px var(--accent-primary)"
                      : "none",
                }}
              />
            ))}
          </div>
        </div>

        <QuestionCard
          key={currentQuestion.id}
          question={currentQuestion}
          onAnswer={handleAnswer}
        />
      </div>
    </main>
  );
}
