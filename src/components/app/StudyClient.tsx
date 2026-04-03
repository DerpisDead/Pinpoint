"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";
import { sm2, formatInterval } from "@/lib/sm2";
import { calcCardXp, XP_SESSION_COMPLETE_BONUS } from "@/lib/xp-rules";
import { getLevel, didLevelUp } from "@/lib/xp";
import { checkAndAwardBadges } from "@/lib/badges";
import LevelUpModal from "./LevelUpModal";
import XpNotification, { type XpNotif } from "./XpNotification";

// ─── Types ────────────────────────────────────────────────────────────────────

export type StudyCard = {
  userCardId: string;
  cardId: string;
  front: string;
  back: string;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  timesReviewed: number;
  eventColor: string;
  eventName: string;
  lastQuality: number | null;
};

type Props = {
  initialCards: StudyCard[];
  userId: string;
  initialXp: number;
  currentStreak: number;
  backHref?: string;
};

// ─── Rating config ────────────────────────────────────────────────────────────

const RATINGS = [
  {
    quality: 0,
    label: "Again",
    key: "1",
    ring: "ring-red-300",
    bg: "bg-red-50 hover:bg-red-100 border-red-200 text-red-700",
    dot: "bg-red-400",
  },
  {
    quality: 3,
    label: "Hard",
    key: "2",
    ring: "ring-orange-300",
    bg: "bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700",
    dot: "bg-orange-400",
  },
  {
    quality: 4,
    label: "Good",
    key: "3",
    ring: "ring-blue-300",
    bg: "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700",
    dot: "bg-blue-400",
  },
  {
    quality: 5,
    label: "Easy",
    key: "4",
    ring: "ring-emerald-300",
    bg: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700",
    dot: "bg-emerald-400",
  },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function StudyClient({
  initialCards,
  userId,
  initialXp,
  currentStreak,
  backHref = "/dashboard",
}: Props) {
  const [cards] = useState<StudyCard[]>(initialCards);
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideClass, setSlideClass] = useState("");
  const [done, setDone] = useState(false);
  const [totalXp, setTotalXp] = useState(initialXp);

  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    correct: 0,
    xpEarned: 0,
  });

  const [levelUpData, setLevelUpData] = useState<{ newLevel: number } | null>(null);
  const [xpNotifs, setXpNotifs] = useState<XpNotif[]>([]);
  const notifCounter = useRef(0);

  const currentCard = cards[index];
  const total = cards.length;
  const progress = total > 0 ? (index / total) * 100 : 0;

  function showXpNotif(amount: number) {
    const id = ++notifCounter.current;
    setXpNotifs((prev) => [...prev, { id, amount }]);
    setTimeout(() => {
      setXpNotifs((prev) => prev.filter((n) => n.id !== id));
    }, 2000);
  }

  // ── Confetti on session complete ──────────────────────────────────────────
  useEffect(() => {
    if (!done) return;
    import("canvas-confetti").then(({ default: confetti }) => {
      confetti({
        particleCount: 140,
        spread: 75,
        origin: { y: 0.55 },
        colors: ["#3B82F6", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B"],
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ["#3B82F6", "#8B5CF6"],
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ["#06B6D4", "#10B981"],
        });
      }, 250);
    });
  }, [done]);

  // ── Session complete: award bonus XP + check badges ───────────────────────
  useEffect(() => {
    if (!done) return;

    async function finishSession() {
      const supabase = createClient();
      const bonusXp = XP_SESSION_COMPLETE_BONUS;
      const newTotalXp = totalXp + bonusXp;

      const levelInfo = getLevel(newTotalXp);
      setTotalXp(newTotalXp);
      showXpNotif(bonusXp);

      if (didLevelUp(totalXp, newTotalXp)) {
        setLevelUpData({ newLevel: levelInfo.level });
      }

      await Promise.all([
        supabase
          .from("profiles")
          .update({ total_xp: newTotalXp, level: levelInfo.level })
          .eq("id", userId),
        supabase.from("xp_log").insert({
          user_id: userId,
          amount: bonusXp,
          source: "session_complete",
          details: { cards_reviewed: sessionStats.reviewed },
        }),
      ]);

      const newBadges = await checkAndAwardBadges(supabase, userId);
      for (const badge of newBadges) {
        toast.success(`Badge unlocked: ${badge.name}`, {
          description: badge.description,
          icon: badge.icon ?? "🏅",
        });
      }
    }

    finishSession().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  // ── Rate a card ───────────────────────────────────────────────────────────
  const handleRate = useCallback(
    async (quality: number) => {
      if (isAnimating || !currentCard) return;

      const card = currentCard;
      const result = sm2(quality, card.repetitions, card.easeFactor, card.intervalDays);
      const wasFailedBefore = card.lastQuality !== null && card.lastQuality < 3;
      const xpAmount = calcCardXp(quality, wasFailedBefore);
      const isCorrect = quality >= 3;
      const now = new Date();
      const nextReview = new Date(
        now.getTime() + result.interval * 24 * 60 * 60 * 1000
      ).toISOString();

      setIsAnimating(true);
      setSlideClass("slide-out-left");

      const newTotalXp = totalXp + xpAmount;
      setTotalXp(newTotalXp);
      showXpNotif(xpAmount);

      if (didLevelUp(totalXp, newTotalXp)) {
        setLevelUpData({ newLevel: getLevel(newTotalXp).level });
      }

      setSessionStats((prev) => ({
        reviewed: prev.reviewed + 1,
        correct: prev.correct + (isCorrect ? 1 : 0),
        xpEarned: prev.xpEarned + xpAmount,
      }));

      const supabase = createClient();
      const levelInfo = getLevel(newTotalXp);
      Promise.all([
        supabase
          .from("user_cards")
          .update({
            ease_factor: result.easeFactor,
            interval_days: result.interval,
            repetitions: result.repetitions,
            next_review: nextReview,
            last_quality: quality,
            last_reviewed: now.toISOString(),
            times_reviewed: card.timesReviewed + 1,
          })
          .eq("id", card.userCardId),

        supabase.from("reviews").insert({
          user_id: userId,
          card_id: card.cardId,
          quality,
          reviewed_at: now.toISOString(),
        }),

        supabase
          .from("profiles")
          .update({ total_xp: newTotalXp, level: levelInfo.level })
          .eq("id", userId),

        supabase.from("xp_log").insert({
          user_id: userId,
          amount: xpAmount,
          source: "card_review",
          details: { card_id: card.cardId, quality, event: card.eventName },
        }),
      ]).catch(console.error);

      setTimeout(() => {
        const nextIndex = index + 1;
        if (nextIndex >= total) {
          setDone(true);
          setIsAnimating(false);
        } else {
          setIndex(nextIndex);
          setIsFlipped(false);
          setSlideClass("slide-in-right");
          setTimeout(() => {
            setSlideClass("");
            setIsAnimating(false);
          }, 220);
        }
      }, 220);
    },
    [isAnimating, currentCard, index, total, totalXp, userId]
  );

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      if (e.code === "Space") {
        e.preventDefault();
        if (!isAnimating && !done) setIsFlipped((f) => !f);
        return;
      }
      if (isFlipped && !isAnimating && !done) {
        if (e.key === "1") handleRate(0);
        if (e.key === "2") handleRate(3);
        if (e.key === "3") handleRate(4);
        if (e.key === "4") handleRate(5);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isFlipped, isAnimating, done, handleRate]);

  // ── Session complete screen ───────────────────────────────────────────────
  if (done) {
    const accuracy =
      sessionStats.reviewed > 0
        ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100)
        : 0;

    const streakMessage =
      currentStreak >= 2
        ? `🔥 ${currentStreak}-day streak!`
        : "🎯 Streak started!";

    return (
      <>
        <LevelUpModal
          isVisible={!!levelUpData}
          level={levelUpData?.newLevel ?? 1}
          onDismiss={() => setLevelUpData(null)}
        />
        <XpNotification notifications={xpNotifs} />

        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
          <div className="w-full max-w-md text-center">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
              <div className="text-6xl">🏆</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  Session Complete!
                </h1>
                <p className="text-gray-500 text-sm">{streakMessage}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <StatPill
                  value={sessionStats.reviewed}
                  label="Reviewed"
                  color="text-blue-600"
                  bg="bg-blue-50"
                />
                <StatPill
                  value={`${accuracy}%`}
                  label="Accuracy"
                  color={
                    accuracy >= 80
                      ? "text-emerald-600"
                      : accuracy >= 60
                      ? "text-yellow-600"
                      : "text-red-600"
                  }
                  bg={
                    accuracy >= 80
                      ? "bg-emerald-50"
                      : accuracy >= 60
                      ? "bg-yellow-50"
                      : "bg-red-50"
                  }
                />
                <StatPill
                  value={`+${sessionStats.xpEarned}`}
                  label="XP Earned"
                  color="text-purple-600"
                  bg="bg-purple-50"
                />
              </div>

              <p className="text-sm text-gray-400">
                Total XP:{" "}
                <span className="font-semibold text-gray-700">{totalXp} XP</span>
              </p>

              <div className="flex flex-col gap-2 pt-2">
                <Link
                  href={`${backHref}/study`}
                  className="flex items-center justify-center gap-2 py-3 rounded-full gradient-btn text-white font-semibold text-sm shadow-md shadow-blue-500/20"
                  onClick={() => {
                    setDone(false);
                    setIndex(0);
                    setIsFlipped(false);
                    setSessionStats({ reviewed: 0, correct: 0, xpEarned: 0 });
                  }}
                >
                  <RotateCcw size={15} />
                  Study More
                </Link>
                <Link
                  href={backHref}
                  className="flex items-center justify-center gap-2 py-3 rounded-full border border-gray-200 text-gray-600 font-medium text-sm hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <LayoutDashboard size={15} />
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (total === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-4">
            <div className="text-5xl">✅</div>
            <h1 className="text-xl font-bold text-gray-900">All caught up!</h1>
            <p className="text-gray-500 text-sm">
              No cards are due for review right now. Come back later or study
              ahead.
            </p>
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 mt-4 py-2.5 px-6 rounded-full border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              <LayoutDashboard size={15} />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Main study UI ─────────────────────────────────────────────────────────
  return (
    <>
      <LevelUpModal
        isVisible={!!levelUpData}
        level={levelUpData?.newLevel ?? 1}
        onDismiss={() => setLevelUpData(null)}
      />
      <XpNotification notifications={xpNotifs} />

      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        {/* ── Top bar ── */}
        <header className="sticky top-0 z-20 bg-[#F8FAFC]/95 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
            <Link
              href={backHref}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back</span>
            </Link>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-500 font-medium">
                  Card {Math.min(index + 1, total)} of {total}
                </span>
                <span className="text-xs text-gray-400">
                  {currentCard?.eventName}
                </span>
              </div>
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: currentCard?.eventColor ?? "#3B82F6",
                  }}
                />
              </div>
            </div>

            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 border border-purple-100 shrink-0">
              ⚡ {totalXp}
            </span>
          </div>
        </header>

        {/* ── Card area ── */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8">
          <div className="w-full max-w-lg">
            {!isFlipped && (
              <p className="text-center text-xs text-gray-400 mb-4">
                Tap card or press{" "}
                <kbd className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 text-[10px] font-mono">
                  Space
                </kbd>{" "}
                to reveal answer
              </p>
            )}

            <div
              className={`card-scene w-full cursor-pointer ${slideClass}`}
              style={{ height: "280px" }}
              role="button"
              tabIndex={0}
              aria-label={isFlipped ? "Card answer (click to flip back)" : "Card question (click to reveal answer)"}
              onClick={() => {
                if (!isAnimating) setIsFlipped((f) => !f);
              }}
              onKeyDown={(e) => {
                if ((e.code === "Space" || e.code === "Enter") && !isAnimating) {
                  e.preventDefault();
                  setIsFlipped((f) => !f);
                }
              }}
            >
              <div className={`card-inner ${isFlipped ? "is-flipped" : ""}`}>
                <div className="card-face bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden flex flex-col">
                  <div
                    className="h-1.5 w-full shrink-0"
                    style={{
                      backgroundColor: currentCard?.eventColor ?? "#3B82F6",
                    }}
                  />
                  <div className="flex-1 flex items-center justify-center p-8">
                    <p className="text-xl sm:text-2xl font-semibold text-gray-800 text-center leading-relaxed">
                      {currentCard?.front}
                    </p>
                  </div>
                  <div className="py-3 text-center">
                    <span className="text-[11px] text-gray-300 uppercase tracking-widest font-medium">
                      Question
                    </span>
                  </div>
                </div>

                <div className="card-face card-back bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden flex flex-col">
                  <div
                    className="h-1.5 w-full shrink-0"
                    style={{
                      backgroundColor: currentCard?.eventColor ?? "#3B82F6",
                    }}
                  />
                  <div className="flex-1 flex items-center justify-center p-8">
                    <p className="text-lg sm:text-xl text-gray-700 text-center leading-relaxed">
                      {currentCard?.back}
                    </p>
                  </div>
                  <div className="py-3 text-center">
                    <span className="text-[11px] text-gray-300 uppercase tracking-widest font-medium">
                      Answer
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Rating buttons ── */}
            <div
              className={`mt-6 transition-all duration-300 ${
                isFlipped
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4 pointer-events-none"
              }`}
            >
              <p className="text-center text-xs text-gray-400 mb-3">
                How well did you recall it?{" "}
                <span className="text-gray-300">(1–4 on keyboard)</span>
              </p>
              <div className="grid grid-cols-4 gap-2">
                {RATINGS.map(({ quality, label, key, bg }) => {
                  const preview = sm2(
                    quality,
                    currentCard?.repetitions ?? 0,
                    currentCard?.easeFactor ?? 2.5,
                    currentCard?.intervalDays ?? 0
                  );
                  return (
                    <button
                      key={quality}
                      onClick={() => handleRate(quality)}
                      disabled={isAnimating}
                      aria-label={`Rate as ${label} — next review in ${formatInterval(preview.interval)}`}
                      className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border font-semibold text-sm transition-all duration-150 disabled:opacity-50 btn-scale min-h-[44px] ${bg} focus:outline-none focus:ring-2 ${RATINGS.find((r) => r.quality === quality)?.ring}`}
                    >
                      <span>{label}</span>
                      <span className="text-[11px] font-normal opacity-70">
                        {formatInterval(preview.interval)}
                      </span>
                      <span className="text-[10px] font-normal opacity-40">
                        [{key}]
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {!isFlipped && (
              <button
                onClick={() => !isAnimating && setIsFlipped(true)}
                aria-label="Show answer"
                className="mt-5 w-full py-3 rounded-full gradient-btn text-white font-semibold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 btn-scale focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Show Answer
                <span className="opacity-60 text-xs font-normal">[Space]</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Small subcomponent ────────────────────────────────────────────────────────

function StatPill({
  value,
  label,
  color,
  bg,
}: {
  value: string | number;
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-xl p-3 flex flex-col items-center gap-1`}>
      <span className={`text-xl font-bold ${color}`}>{value}</span>
      <span className="text-[11px] text-gray-500">{label}</span>
    </div>
  );
}
