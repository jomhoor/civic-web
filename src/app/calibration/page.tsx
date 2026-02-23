"use client";

import { PageNavBar } from "@/components/page-nav-bar";
import { QuestionCard } from "@/components/question-card";
import { QuestionnaireIcon } from "@/components/questionnaire-icon";
import {
    getCalibrationQuestions,
    getQuestionnaireProgress,
    saveSnapshot,
    seedQuestions,
    submitResponses,
} from "@/lib/api";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { ArrowLeft, BookOpen, Check, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Question {
  id: string;
  text: string;
  weights: Record<string, number>;
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

export default function CalibrationPage() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const language = useAppStore((s) => s.language);

  // Questionnaire chooser state
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireProgress[]>([]);
  const [selectedQ, setSelectedQ] = useState<QuestionnaireProgress | null>(null);

  // Questions state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Load questionnaire list with progress on mount
  useEffect(() => {
    if (!user) {
      router.push("/connect");
      return;
    }

    async function init() {
      try {
        // Seed first (idempotent) then fetch progress
        await seedQuestions();
        const progress = await getQuestionnaireProgress();
        setQuestionnaires(progress);
      } catch (err) {
        console.error("Failed to load questionnaires:", err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [user, router]);

  // Load calibration questions for selected questionnaire (already-answered ones are filtered by backend)
  async function selectQuestionnaire(q: QuestionnaireProgress) {
    setSelectedQ(q);
    setLoadingQuestions(true);
    setQuestions([]);
    setCurrentIndex(0);
    setAnsweredCount(0);

    try {
      const qs = await getCalibrationQuestions(q.questionnaireId);
      if (qs.length === 0) {
        // All calibration questions already answered — go to dashboard
        router.push("/dashboard");
        return;
      }
      setQuestions(qs);
    } catch (err) {
      console.error("Failed to load calibration questions:", err);
    } finally {
      setLoadingQuestions(false);
    }
  }

  function goBack() {
    setSelectedQ(null);
    setQuestions([]);
    setCurrentIndex(0);
    setAnsweredCount(0);
  }

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
        // All calibration questions answered — save snapshot, then go to dashboard
        try {
          const label = language === "fa" ? (selectedQ?.titleFa ?? selectedQ?.title) : selectedQ?.title;
          await saveSnapshot(user.id, `Calibration: ${label}`, selectedQ?.questionnaireId);
        } catch (e) {
          console.error("Failed to save calibration snapshot:", e);
        }
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Failed to submit response:", err);
    }
  }

  if (!user) return null;

  // Global loading
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p style={{ color: "var(--text-secondary)" }}>
          {t("calibration_loading", language)}
        </p>
      </main>
    );
  }

  // —— QUESTIONNAIRE CHOOSER ——
  if (!selectedQ) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-xl w-full space-y-8">
          <PageNavBar />
          {/* Header */}
          <div className="text-center space-y-3">
            <BookOpen
              size={36}
              strokeWidth={1.5}
              className="mx-auto"
              style={{ color: "var(--accent-primary)" }}
            />
            <h1 className="text-2xl font-bold glow-text">
              {t("calibration_title", language)}
            </h1>
            <p
              className="text-sm max-w-sm mx-auto"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("calibration_choose_desc", language)}
            </p>
          </div>

          {/* Questionnaire grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {questionnaires.map((q) => (
              <button
                key={q.questionnaireId}
                onClick={() => selectQuestionnaire(q)}
                className="text-left rounded-2xl p-5 transition-all hover:scale-[1.02] group"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div className="flex items-start gap-3">
                  <QuestionnaireIcon
                    name={q.icon}
                    size={28}
                    strokeWidth={1.5}
                    style={{ color: "var(--accent-primary)" }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">
                      {language === "fa" ? q.titleFa : q.title}
                    </h3>
                    <p
                      className="text-xs mt-1 line-clamp-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {language === "fa" ? q.descriptionFa : q.description}
                    </p>
                    {/* Progress bar */}
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--component-primary)" }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${q.progress}%`,
                            background: q.completed ? "var(--success)" : "var(--accent-gradient)",
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                        {q.answered}/{q.total}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      {q.completed ? (
                        <span className="text-xs font-medium flex items-center gap-1" style={{ color: "var(--success)" }}>
                          <Check size={12} strokeWidth={1.5} /> {t("questionnaire_completed", language)}
                        </span>
                      ) : (
                        <span className="text-xs font-medium" style={{ color: "var(--accent-primary)" }}>
                          {q.answered > 0 ? t("questionnaire_continue", language) : t("questionnaire_start", language)}
                        </span>
                      )}
                      <ChevronRight
                        size={14}
                        strokeWidth={1.5}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: "var(--accent-primary)" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Attribution for Political Compass */}
                {q.slug === "political-compass" && (
                  <p
                    className="text-[10px] mt-3 leading-tight"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {t("political_compass_attribution", language)}
                  </p>
                )}
                {/* Attribution for 9 Axes */}
                {q.slug === "nine-axes" && (
                  <p
                    className="text-[10px] mt-3 leading-tight"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {t("nine_axes_attribution", language)}
                  </p>
                )}
              </button>
            ))}
          </div>

          {questionnaires.length === 0 && (
            <p
              className="text-center py-8 text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              {t("calibration_no_questions", language)}
            </p>
          )}
        </div>
      </main>
    );
  }

  // —— LOADING QUESTIONS FOR SELECTED QUESTIONNAIRE ——
  if (loadingQuestions) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p style={{ color: "var(--text-secondary)" }}>
          {t("calibration_loading", language)}
        </p>
      </main>
    );
  }

  // —— NO QUESTIONS FOUND ——
  if (questions.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 gap-4">
        <p style={{ color: "var(--text-secondary)" }}>
          {t("calibration_no_questions", language)}
        </p>
        <button
          onClick={goBack}
          className="flex items-center gap-1.5 text-sm font-medium"
          style={{ color: "var(--accent-primary)" }}
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          {t("questionnaire_back", language)}
        </button>
      </main>
    );
  }

  // —— QUESTIONS VIEW ——
  const currentQuestion = questions[currentIndex];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-lg w-full space-y-6">
        <PageNavBar />
        {/* Back button + selected questionnaire header */}
        <div className="text-center space-y-2">
          <button
            onClick={goBack}
            className="inline-flex items-center gap-1.5 text-xs font-medium mb-2"
            style={{ color: "var(--accent-primary)" }}
          >
            <ArrowLeft size={12} strokeWidth={1.5} />
            {t("questionnaire_back", language)}
          </button>
          <div className="flex items-center justify-center gap-2">
            <QuestionnaireIcon
              name={selectedQ.icon}
              size={22}
              strokeWidth={1.5}
              style={{ color: "var(--accent-primary)" }}
            />
            <h1 className="text-2xl font-bold glow-text">
              {language === "fa" ? selectedQ.titleFa : selectedQ.title}
            </h1>
          </div>
          <p
            className="text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            {t("calibration_desc", language)}
          </p>
          {/* Progress dots */}
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
