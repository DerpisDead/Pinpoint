"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Timer, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { getLevel, didLevelUp } from "@/lib/xp";
import LevelUpModal from "@/components/app/LevelUpModal";

const MATCH_XP = 30;

type Card = { id: string; front: string; back: string };

type Tile = {
  tileId: string;
  cardId: string;
  text: string;
  side: "front" | "back";
};

type Props = {
  eventId: string;
  eventName: string;
  eventColor: string;
  cards: Card[];
  userId: string;
  initialXp: number;
  initialLevel: number;
};

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function MatchingGame({
  eventId,
  eventName,
  eventColor,
  cards,
  userId,
  initialXp,
  initialLevel,
}: Props) {
  // Build tile list: terms left column, defs right column (shuffled separately)
  const [terms] = useState<Tile[]>(() =>
    cards.map((c) => ({ tileId: `t-${c.id}`, cardId: c.id, text: c.front, side: "front" }))
  );
  const [defs] = useState<Tile[]>(() => {
    const arr = cards.map((c) => ({
      tileId: `d-${c.id}`,
      cardId: c.id,
      text: c.back,
      side: "back" as const,
    }));
    return arr.sort(() => Math.random() - 0.5);
  });

  const [selected, setSelected] = useState<Tile | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set()); // cardIds
  const [wrong, setWrong] = useState<Set<string>>(new Set()); // tileIds
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ level: number } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer
  useEffect(() => {
    if (done) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => setElapsed((t) => t + 1), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [done]);

  // Award XP on completion
  useEffect(() => {
    if (!done || xpAwarded) return;
    setXpAwarded(true);

    const supabase = createClient();
    (async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("total_xp, level")
        .eq("id", userId)
        .single();

      const currentXp = profile?.total_xp ?? initialXp;
      const newXp = currentXp + MATCH_XP;
      const newLevel = getLevel(newXp).level;

      await supabase
        .from("profiles")
        .update({ total_xp: newXp, level: newLevel, updated_at: new Date().toISOString() })
        .eq("id", userId);

      await supabase.from("xp_log").insert({
        user_id: userId,
        amount: MATCH_XP,
        source: "session_complete",
        details: { mode: "matching", event_id: eventId },
      });

      if (didLevelUp(currentXp, newXp)) {
        setLevelUpData({ level: newLevel });
      }
    })();
  }, [done, xpAwarded, userId, initialXp, eventId]);

  function handleTileClick(tile: Tile) {
    if (matched.has(tile.cardId)) return;
    if (wrong.has(tile.tileId)) return;

    if (!selected) {
      setSelected(tile);
      return;
    }

    if (selected.tileId === tile.tileId) {
      setSelected(null);
      return;
    }

    // Must be opposite sides to match
    if (selected.side === tile.side) {
      // Replace selection with new tile of same side
      setSelected(tile);
      return;
    }

    if (selected.cardId === tile.cardId) {
      // Correct match
      const newMatched = new Set(matched);
      newMatched.add(tile.cardId);
      setMatched(newMatched);
      setSelected(null);
      if (newMatched.size === cards.length) {
        setDone(true);
      }
    } else {
      // Wrong — flash both
      const wrongSet = new Set([selected.tileId, tile.tileId]);
      setWrong(wrongSet);
      setSelected(null);
      setTimeout(() => setWrong(new Set()), 600);
    }
  }

  function renderTile(tile: Tile) {
    const isMatched = matched.has(tile.cardId);
    const isSelected = selected?.tileId === tile.tileId;
    const isWrong = wrong.has(tile.tileId);

    return (
      <AnimatePresence key={tile.tileId}>
        {!isMatched && (
          <motion.button
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => handleTileClick(tile)}
            className={`w-full text-left px-3 py-3 rounded-xl text-sm font-medium transition-all border-2 min-h-[64px] flex items-center ${
              isWrong
                ? "border-red-400 bg-red-50 text-red-700 animate-shake"
                : isSelected
                ? "border-blue-500 bg-blue-50 text-blue-900 shadow-md"
                : "border-gray-200 bg-white text-gray-800 hover:border-blue-300 hover:bg-blue-50"
            }`}
          >
            <span className="leading-snug">{tile.text}</span>
          </motion.button>
        )}
      </AnimatePresence>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <LevelUpModal
          level={levelUpData?.level ?? initialLevel}
          isVisible={!!levelUpData}
          onDismiss={() => setLevelUpData(null)}
        />

        <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
          <Trophy size={32} className="text-yellow-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Matched!</h2>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>Time: {formatTime(elapsed)}</span>
          <span>+{MATCH_XP} XP</span>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/dashboard/event/${eventId}/matching`}
            className="px-5 py-2.5 rounded-full gradient-btn text-white font-semibold text-sm shadow-sm"
          >
            Play Again
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
    <div className="max-w-2xl space-y-4">
      <LevelUpModal
        level={levelUpData?.level ?? initialLevel}
        isVisible={!!levelUpData}
        onDismiss={() => setLevelUpData(null)}
      />

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
          <h1 className="text-xl font-bold text-gray-900 mt-0.5">Matching</h1>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-mono text-gray-500 bg-white border border-gray-200 rounded-full px-3 py-1.5">
          <Timer size={14} />
          {formatTime(elapsed)}
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${(matched.size / cards.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 font-medium shrink-0">
          {matched.size}/{cards.length}
        </span>
      </div>

      {/* Grid: terms | defs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {terms.map(renderTile)}
        </div>
        <div className="space-y-2">
          {defs.map(renderTile)}
        </div>
      </div>
    </div>
  );
}
