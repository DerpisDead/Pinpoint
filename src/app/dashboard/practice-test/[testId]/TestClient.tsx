"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  RotateCcw,
  LayoutDashboard,
  Clock,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import CircularProgress from "@/components/app/CircularProgress";
import type { Card } from "@/types/database";

// ─── Types ────────────────────────────────────────────────────────────────────

type TestQuestion = {
  cardId: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  correctAnswer: string;
  options: string[];
  correctIndex: number;
};

type Props = {
  allCards: Card[];
  eventId: string;
  eventName: string;
  eventColor: string;
  questionCount: number;
  timedMode: boolean;
  userId: string;
  initialXp: number;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function buildQuestions(cards: Card[], count: number): TestQuestion[] {
  const pool = shuffle(cards).slice(0, count);

  return pool.map((card) => {
    const others = cards.filter((c) => c.id !== card.id);
    const wrongPool = shuffle(others).slice(0, 3);

    // Pad with generic fallbacks if not enough cards in the event
    const wrongAnswers = wrongPool.map((c) => c.back);
    while (wrongAnswers.length < 3) {
      wrongAnswers.push("None of the above");
    }

    const options = shuffle([card.back, ...wrongAnswers]);
    const correctIndex = options.indexOf(card.back);

    return {
      cardId: card.id,
      difficulty: card.difficulty,
      question: card.front,
      correctAnswer: card.back,
      options,
      correctIndex,
    };
  });
}

// ─── Difficulty badge ─────────────────────────────────────────────────────────

function DiffBadge({ d }: { d: "easy" | "medium" | "hard" }) {
  const styles = {
    easy: "bg-emerald-50 text-emerald-600",
    medium: "bg-yellow-50 text-yellow-600",
    hard: "bg-red-50 text-red-600",
  };
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${styles[d]}`}
    >
      {d}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TestClient({
  allCards,
  eventId,
  eventName,
  eventColor,
  questionCount,
  timedMode,
  userId,
  initialXp,
}: Props) {
  // Generate questions once on mount
  const questions = useMemo(
    () => buildQuestions(allCards, questionCount),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const total = questions.length;

  // ── Test state ──────────────────────────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    () => new Array(total).fill(null)
  );
  const [elapsed, setElapsed] = useState(0); // seconds
  const [submitted, setSubmitted] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [savedXp, setSavedXp] = useState(0);

  const currentQ = questions[currentIndex];
  const currentAnswer = selectedAnswers[currentIndex];
  const hasAnswered = currentAnswer !== null;
  const isLastQuestion = currentIndex === total - 1;

  // ── Timer ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!timedMode || submitted) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [timedMode, submitted]);

  // ── Derived results ─────────────────────────────────────────────────────────
  const score = selectedAnswers.filter(
    (a, i) => a === questions[i]?.correctIndex
  ).length;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const xpEarned = 50 + Math.round((score / total) * 50);

  const byDifficulty = useMemo(() => {
    const result = {
      easy: { correct: 0, total: 0 },
      medium: { correct: 0, total: 0 },
      hard: { correct: 0, total: 0 },
    };
    questions.forEach((q, i) => {
      result[q.difficulty].total++;
      if (selectedAnswers[i] === q.correctIndex) result[q.difficulty].correct++;
    });
    return result;
  }, [questions, selectedAnswers]);

  const mistakes = questions
    .map((q, i) => ({ q, i, answered: selectedAnswers[i] }))
    .filter(({ q, answered }) => answered !== null && answered !== q.correctIndex);

  // ── Save results on submit ──────────────────────────────────────────────────
  useEffect(() => {
    if (!submitted) return;

    async function save() {
      const supabase = createClient();
      const newXp = initialXp + xpEarned;

      // Run all writes in parallel
      await Promise.all([
        supabase.from("practice_tests").insert({
          user_id: userId,
          event_id: eventId,
          score,
          total_questions: total,
          time_taken_seconds: timedMode ? elapsed : null,
        }),
        supabase
          .from("profiles")
          .update({ total_xp: newXp })
          .eq("id", userId),
        supabase.from("xp_log").insert({
          user_id: userId,
          amount: xpEarned,
          source: "test_complete",
          details: {
            event_id: eventId,
            score,
            total,
            percentage: pct,
          },
        }),
      ]).catch(console.error);

      // Perfect score — award badge (sequential: need badge id first)
      if (score === total) {
        const { data: badge } = await supabase
          .from("badges")
          .select("id")
          .eq("name", "Perfect Score")
          .single();

        if (badge) {
          await supabase
            .from("user_badges")
            .upsert(
              { user_id: userId, badge_id: badge.id },
              { onConflict: "user_id,badge_id", ignoreDuplicates: true }
            );
        }
      }

      setSavedXp(xpEarned);
    }

    save();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted]);

  // ── Answer a question ───────────────────────────────────────────────────────
  function handleAnswer(optionIndex: number) {
    if (hasAnswered) return;
    setSelectedAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = optionIndex;
      return next;
    });
  }

  // ── Advance to next question ────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    if (!hasAnswered) return;
    if (isLastQuestion) {
      setSubmitted(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [hasAnswered, isLastQuestion]);

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────
  useEffect(() => {
    if (submitted) return;

    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      const answerKeys: Record<string, number> = {
        "1": 0,
        "2": 1,
        "3": 2,
        "4": 3,
      };

      if (e.key in answerKeys && !hasAnswered) {
        handleAnswer(answerKeys[e.key]);
        return;
      }
      if ((e.key === "Enter" || e.key === " ") && hasAnswered) {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [hasAnswered, handleNext, submitted]);

  // ── No cards available ──────────────────────────────────────────────────────
  if (allCards.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <p className="text-4xl mb-4">📚</p>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Not enough cards
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            This event needs at least 4 cards to generate a practice test.
          </p>
          <Link
            href="/dashboard/practice-test"
            className="inline-flex items-center gap-2 py-2.5 px-6 rounded-full border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50"
          >
            <ArrowLeft size={15} />
            Back to Setup
          </Link>
        </div>
      </div>
    );
  }

  // ── Results screen ──────────────────────────────────────────────────────────
  if (submitted) {
    // Review mistakes view
    if (reviewMode) {
      return (
        <div className="min-h-screen bg-[#F8FAFC]">
          <header className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 sm:px-6 h-14 flex items-center gap-3">
            <button
              onClick={() => setReviewMode(false)}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft size={16} /> Results
            </button>
            <span className="text-sm font-semibold text-gray-700">
              Review Mistakes ({mistakes.length})
            </span>
          </header>

          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">
            {mistakes.map(({ q, i, answered }) => (
              <div
                key={q.cardId}
                className="bg-white rounded-2xl border border-gray-100 p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-gray-400">Q{i + 1}</span>
                  <DiffBadge d={q.difficulty} />
                </div>
                <p className="font-semibold text-gray-800 mb-4">{q.question}</p>

                {/* Wrong answer they chose */}
                {answered !== null && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 mb-2">
                    <XCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-red-500 font-medium mb-0.5">
                        Your answer
                      </p>
                      <p className="text-sm text-red-700">{q.options[answered]}</p>
                    </div>
                  </div>
                )}

                {/* Correct answer */}
                <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-emerald-600 font-medium mb-0.5">
                      Correct answer
                    </p>
                    <p className="text-sm text-emerald-800">{q.correctAnswer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Main results view
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          {/* Score card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 text-center">
            <CircularProgress percentage={pct} size={140} />

            <div className="mt-5">
              <h1 className="text-2xl font-bold text-gray-900">
                You got{" "}
                <span
                  className="font-extrabold"
                  style={{ color: eventColor }}
                >
                  {score}/{total}
                </span>{" "}
                correct
              </h1>
              <p className="text-gray-500 text-sm mt-1">{eventName}</p>
            </div>

            {/* Meta row */}
            <div className="flex items-center justify-center gap-5 mt-5 pt-4 border-t border-gray-50">
              <div className="text-center">
                <p className="text-lg font-bold text-[#8B1A2D]">
                  +{savedXp || xpEarned}
                </p>
                <p className="text-xs text-gray-400">XP Earned</p>
              </div>
              {timedMode && (
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-700">
                    {formatTime(elapsed)}
                  </p>
                  <p className="text-xs text-gray-400">Time</p>
                </div>
              )}
              {score === total && (
                <div className="text-center">
                  <p className="text-lg">🏅</p>
                  <p className="text-xs text-gray-400">Perfect!</p>
                </div>
              )}
            </div>
          </div>

          {/* Difficulty breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              Breakdown by difficulty
            </h2>
            <div className="space-y-2.5">
              {(["easy", "medium", "hard"] as const).map((d) => {
                const { correct, total: dtotal } = byDifficulty[d];
                if (dtotal === 0) return null;
                const dpct = Math.round((correct / dtotal) * 100);
                const barColor =
                  d === "easy"
                    ? "#10B981"
                    : d === "medium"
                    ? "#F59E0B"
                    : "#EF4444";
                return (
                  <div key={d}>
                    <div className="flex items-center justify-between mb-1">
                      <DiffBadge d={d} />
                      <span className="text-xs text-gray-500">
                        {correct}/{dtotal}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${dpct}%`,
                          backgroundColor: barColor,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2">
            {mistakes.length > 0 && (
              <button
                onClick={() => setReviewMode(true)}
                className="w-full flex items-center justify-between py-3 px-5 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span>Review {mistakes.length} mistake{mistakes.length !== 1 ? "s" : ""}</span>
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            )}
            <Link
              href={`/dashboard/practice-test/${eventId}?count=${total}&timed=${timedMode}`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-full gradient-btn text-white font-semibold text-sm shadow-md shadow-[#8B1A2D]/20"
            >
              <RotateCcw size={15} />
              Try Again
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-full border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              <LayoutDashboard size={15} />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Test taking UI ────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <Link
            href="/dashboard/practice-test"
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Exit test"
          >
            <ArrowLeft size={18} />
          </Link>

          {/* Progress */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-gray-500">
                Question {currentIndex + 1} of {total}
              </span>
              <div className="flex items-center gap-2">
                {/* Event dot */}
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: eventColor }}
                />
                <span className="text-xs text-gray-400 hidden sm:inline">
                  {eventName}
                </span>
                {/* Timer */}
                {timedMode && (
                  <span className="flex items-center gap-1 text-xs text-gray-500 font-mono">
                    <Clock size={11} />
                    {formatTime(elapsed)}
                  </span>
                )}
              </div>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${((currentIndex + (hasAnswered ? 1 : 0)) / total) * 100}%`,
                  backgroundColor: eventColor,
                }}
              />
            </div>
          </div>

          {/* Score running tally */}
          <span className="text-xs font-semibold text-gray-500 shrink-0">
            {selectedAnswers.filter((a, i) => a === questions[i]?.correctIndex).length}
            <span className="text-gray-300">/{total}</span>
          </span>
        </div>
      </header>

      {/* Question content */}
      <div className="flex-1 flex flex-col items-center px-4 sm:px-6 py-6">
        <div className="w-full max-w-2xl space-y-5">
          {/* Question card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Colored top stripe */}
            <div className="h-1.5" style={{ backgroundColor: eventColor }} />
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <DiffBadge d={currentQ.difficulty} />
                <span className="text-xs text-gray-400">
                  Press 1–4 to answer
                </span>
              </div>
              <p className="text-lg sm:text-xl font-semibold text-gray-900 leading-relaxed">
                {currentQ.question}
              </p>
            </div>
          </div>

          {/* Answer options */}
          <div className="space-y-2.5">
            {currentQ.options.map((option, i) => {
              const isSelected = currentAnswer === i;
              const isCorrect = i === currentQ.correctIndex;
              const showFeedback = hasAnswered;

              let optionStyle =
                "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50";

              if (showFeedback) {
                if (isCorrect) {
                  optionStyle =
                    "border-emerald-500 bg-emerald-50 text-emerald-800";
                } else if (isSelected && !isCorrect) {
                  optionStyle = "border-red-400 bg-red-50 text-red-800";
                } else {
                  optionStyle =
                    "border-gray-100 bg-gray-50 text-gray-400 opacity-60";
                }
              }

              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={hasAnswered}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left text-sm font-medium transition-all duration-150 ${optionStyle} disabled:cursor-default`}
                >
                  {/* Number badge */}
                  <span
                    className={`w-6 h-6 rounded-full border text-xs font-bold flex items-center justify-center shrink-0 ${
                      showFeedback
                        ? isCorrect
                          ? "border-emerald-500 text-emerald-600 bg-white"
                          : isSelected
                          ? "border-red-400 text-red-500 bg-white"
                          : "border-gray-200 text-gray-300"
                        : "border-gray-200 text-gray-400"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1">{option}</span>
                  {/* Feedback icon */}
                  {showFeedback && isCorrect && (
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                  )}
                  {showFeedback && isSelected && !isCorrect && (
                    <XCircle size={18} className="text-red-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation mini-card */}
          {hasAnswered && currentAnswer !== currentQ.correctIndex && (
            <div className="flex items-start gap-2.5 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-sm">
              <CheckCircle2 size={15} className="text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-emerald-600 font-medium mb-0.5">
                  Correct answer
                </p>
                <p className="text-emerald-800">{currentQ.correctAnswer}</p>
              </div>
            </div>
          )}

          {/* Next button */}
          {hasAnswered && (
            <button
              onClick={handleNext}
              className="w-full py-3 rounded-full gradient-btn text-white font-semibold text-sm shadow-md shadow-[#8B1A2D]/20 flex items-center justify-center gap-2"
            >
              {isLastQuestion ? "Finish Test" : "Next Question"}
              <span className="opacity-60 text-xs font-normal">
                [Enter]
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
