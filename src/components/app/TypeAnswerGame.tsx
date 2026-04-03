"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, CheckCircle2, XCircle, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { calcCardXp } from "@/lib/xp-rules";
import { getLevel, didLevelUp } from "@/lib/xp";
import LevelUpModal from "@/components/app/LevelUpModal";
import XpNotification from "@/components/app/XpNotification";

type Card = { id: string; front: string; back: string };

type Props = {
  eventId: string;
  eventName: string;
  eventColor: string;
  cards: Card[];
  userId: string;
  initialXp: number;
  initialLevel: number;
};

// Levenshtein distance
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return (maxLen - levenshtein(a, b)) / maxLen;
}

function isCloseEnough(input: string, answer: string): boolean {
  const a = input.trim().toLowerCase();
  const b = answer.trim().toLowerCase();
  if (a === b) return true;
  return similarity(a, b) >= 0.85;
}

type Result = { card: Card; input: string; correct: boolean; xp: number };

export default function TypeAnswerGame({
  eventId,
  eventName,
  cards,
  userId,
  initialXp,
  initialLevel,
}: Props) {
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [done, setDone] = useState(false);
  const [totalXp, setTotalXp] = useState(initialXp);
  const [level, setLevel] = useState(initialLevel);
  const [levelUpData, setLevelUpData] = useState<{ level: number } | null>(null);
  const [xpNotifs, setXpNotifs] = useState<{ id: number; amount: number }[]>([]);
  const notifCounter = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const card = cards[index];

  useEffect(() => {
    inputRef.current?.focus();
  }, [index]);

  function showXp(amount: number) {
    const id = ++notifCounter.current;
    setXpNotifs((prev) => [...prev, { id, amount }]);
    setTimeout(() => setXpNotifs((prev) => prev.filter((n) => n.id !== id)), 2000);
  }

  async function submitResult(correct: boolean, xp: number) {
    const supabase = createClient();
    const newTotalXp = totalXp + xp;
    const newLevel = getLevel(newTotalXp).level;

    setTotalXp(newTotalXp);
    setLevel(newLevel);
    showXp(xp);

    await supabase
      .from("profiles")
      .update({ total_xp: newTotalXp, level: newLevel, updated_at: new Date().toISOString() })
      .eq("id", userId);

    await supabase.from("xp_log").insert({
      user_id: userId,
      amount: xp,
      source: "card_review",
      details: { mode: "type_answer", card_id: card.id, event_id: eventId },
    });

    if (didLevelUp(totalXp, newTotalXp)) {
      setLevelUpData({ level: newLevel });
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || revealed) return;

    const correct = isCloseEnough(input, card.back);
    const quality = correct ? 4 : 1;
    const xp = calcCardXp(quality);
    setRevealed(true);
    setResults((prev) => [...prev, { card, input, correct, xp }]);
    submitResult(correct, xp);
  }

  function handleNext() {
    const nextIndex = index + 1;
    if (nextIndex >= cards.length) {
      setDone(true);
    } else {
      setIndex(nextIndex);
      setInput("");
      setRevealed(false);
    }
  }

  const correct = revealed && isCloseEnough(input, card.back);

  if (done) {
    const correctCount = results.filter((r) => r.correct).length;
    const totalXpEarned = results.reduce((s, r) => s + r.xp, 0);
    const accuracy = Math.round((correctCount / cards.length) * 100);

    return (
      <div className="max-w-lg mx-auto space-y-6">
        <LevelUpModal
          level={levelUpData?.level ?? level}
          isVisible={!!levelUpData}
          onDismiss={() => setLevelUpData(null)}
        />

        <div className="flex flex-col items-center py-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <Trophy size={32} className="text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Done!</h2>
          <div className="flex gap-6 text-sm text-gray-500">
            <span>{accuracy}% accuracy</span>
            <span>+{totalXpEarned} XP total</span>
          </div>
        </div>

        {/* Result list */}
        <div className="space-y-2">
          {results.map(({ card: c, input: inp, correct: ok, xp }) => (
            <div
              key={c.id}
              className={`bg-white rounded-xl border p-3 ${
                ok ? "border-green-200" : "border-red-200"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{c.front}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Your answer: <span className={ok ? "text-green-600" : "text-red-500"}>{inp || "(blank)"}</span>
                  </p>
                  {!ok && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Correct: <span className="font-medium">{c.back}</span>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {ok ? (
                    <CheckCircle2 size={16} className="text-green-500" />
                  ) : (
                    <XCircle size={16} className="text-red-400" />
                  )}
                  <span className="text-xs font-semibold text-gray-500">+{xp} XP</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <Link
            href={`/dashboard/event/${eventId}/type-answer`}
            className="px-5 py-2.5 rounded-full gradient-btn text-white font-semibold text-sm shadow-sm"
          >
            Try Again
          </Link>
          <Link
            href={`/dashboard/event/${eventId}`}
            className="px-5 py-2.5 rounded-full border border-gray-200 text-gray-700 font-semibold text-sm hover:border-blue-300 hover:text-blue-600 transition-colors"
          >
            Back to Event
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <LevelUpModal
        level={levelUpData?.level ?? level}
        isVisible={!!levelUpData}
        onDismiss={() => setLevelUpData(null)}
      />
      <XpNotification notifications={xpNotifs} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/dashboard/event/${eventId}`}
            className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronLeft size={15} />
            {eventName}
          </Link>
          <h1 className="text-xl font-bold text-gray-900 mt-0.5">Type Answer</h1>
        </div>
        <span className="text-sm text-gray-400 font-medium">
          {index + 1} / {cards.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full gradient-btn transition-all"
          style={{ width: `${(index / cards.length) * 100}%` }}
        />
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Term
          </div>
          <p className="text-lg font-semibold text-gray-900 leading-snug">{card.front}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={revealed}
            placeholder="Type the definition…"
            className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
              revealed
                ? correct
                  ? "border-green-400 bg-green-50 focus:ring-green-400/20"
                  : "border-red-400 bg-red-50 focus:ring-red-400/20"
                : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-400"
            }`}
          />

          {!revealed && (
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-full py-2.5 rounded-full gradient-btn text-white font-semibold text-sm shadow-sm disabled:opacity-50"
            >
              Check
            </button>
          )}
        </form>

        {revealed && (
          <div className="space-y-3">
            <div
              className={`flex items-start gap-2 rounded-xl p-3 ${
                correct ? "bg-green-50" : "bg-red-50"
              }`}
            >
              {correct ? (
                <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
              ) : (
                <XCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p
                  className={`text-sm font-semibold ${
                    correct ? "text-green-700" : "text-red-600"
                  }`}
                >
                  {correct ? "Correct!" : "Not quite"}
                </p>
                {!correct && (
                  <p className="text-sm text-gray-600 mt-0.5">
                    <span className="font-medium">Answer:</span> {card.back}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-2.5 rounded-full gradient-btn text-white font-semibold text-sm shadow-sm"
            >
              {index + 1 >= cards.length ? "See Results" : "Next Card →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
