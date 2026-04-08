"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, X, ChevronLeft } from "lucide-react";
import type { BrowsableCard } from "@/app/dashboard/event/[eventId]/cards/page";

type Filter = "all" | "due" | "new" | "learning" | "mastered";

function getStatus(card: BrowsableCard, now: string): "new" | "learning" | "reviewing" | "mastered" {
  if (card.repetitions === 0) return "new";
  if (card.repetitions <= 1) return "learning";
  if (card.intervalDays >= 21) return "mastered";
  return "reviewing";
}

function isDue(card: BrowsableCard, now: string) {
  return card.nextReview !== null && card.nextReview <= now && card.repetitions > 0;
}

const STATUS_DOT: Record<string, string> = {
  new:       "bg-red-400",
  learning:  "bg-yellow-400",
  reviewing: "bg-[#1C3F6E]",
  mastered:  "bg-green-500",
};

const STATUS_BADGE: Record<string, string> = {
  new:       "bg-red-50 text-red-600",
  learning:  "bg-yellow-50 text-yellow-700",
  reviewing: "bg-[#EFF3F9] text-[#1C3F6E]",
  mastered:  "bg-green-50 text-green-700",
};

function getDifficultyColor(d: "easy" | "medium" | "hard") {
  if (d === "easy") return "bg-green-100 text-green-700";
  if (d === "medium") return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

function formatNextReview(nextReview: string | null, now: string): string {
  if (!nextReview) return "Not started";
  if (nextReview <= now) return "Due now";
  const diffMs = new Date(nextReview).getTime() - new Date(now).getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays < 30) return `Due in ${diffDays}d`;
  const diffMonths = Math.floor(diffDays / 30);
  return `Due in ${diffMonths}mo`;
}

type Props = {
  cards: BrowsableCard[];
  eventName: string;
  eventColor: string;
  eventIcon: string;
  eventId: string;
  now: string;
};

export default function CardBrowserClient({
  cards,
  eventName,
  eventColor,
  eventIcon,
  eventId,
  now,
}: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<BrowsableCard | null>(null);

  const filters: { key: Filter; label: string }[] = [
    { key: "all",      label: "All" },
    { key: "due",      label: "Due Now" },
    { key: "new",      label: "New" },
    { key: "learning", label: "Learning" },
    { key: "mastered", label: "Mastered" },
  ];

  const filterCount = (key: Filter) => {
    if (key === "all") return cards.length;
    if (key === "due") return cards.filter((c) => isDue(c, now)).length;
    return cards.filter((c) => getStatus(c, now) === key).length;
  };

  const filtered = cards.filter((c) => {
    const matchesSearch =
      search === "" ||
      c.front.toLowerCase().includes(search.toLowerCase()) ||
      c.back.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === "all") return true;
    if (filter === "due") return isDue(c, now);
    return getStatus(c, now) === filter;
  });

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Header */}
      <div>
        <Link
          href={`/dashboard/event/${eventId}`}
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-3 transition-colors"
        >
          <ChevronLeft size={15} />
          {eventName}
        </Link>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: eventColor + "20", border: `1.5px solid ${eventColor}40` }}
          >
            {eventIcon}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Browse Cards</h1>
            <p className="text-xs text-gray-400">{cards.length} total</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search front or back…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1C3F6E]/20 focus:border-[#1C3F6E]/40 transition-colors bg-white"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              filter === key
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-500 hover:border-[#1C3F6E]/40 hover:text-[#1C3F6E]"
            }`}
          >
            {key !== "all" && key !== "due" && (
              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[key]}`} />
            )}
            {label}
            <span className={filter === key ? "opacity-70" : "opacity-50"}>
              {filterCount(key)}
            </span>
          </button>
        ))}
      </div>

      {/* Card list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No cards found</div>
        ) : (
          filtered.map((card) => {
            const status = getStatus(card, now);
            const due = isDue(card, now);
            const nextReviewLabel = formatNextReview(card.nextReview, now);

            return (
              <button
                key={card.id}
                onClick={() => setSelected(card)}
                className="w-full text-left bg-white rounded-2xl border border-gray-100 p-4 hover:border-[#1C3F6E]/20 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-3">
                  {/* Color dot */}
                  <div className="mt-1.5 shrink-0">
                    <div className={`w-2 h-2 rounded-full ${STATUS_DOT[status]}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{card.front}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{card.back}</p>

                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {/* Status badge */}
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[status]}`}>
                        {status}
                      </span>

                      {/* Due badge */}
                      {due && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                          Due now
                        </span>
                      )}

                      {/* Difficulty */}
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${getDifficultyColor(card.difficulty)}`}>
                        {card.difficulty}
                      </span>

                      {/* Next review */}
                      <span className="text-xs text-gray-400">{nextReviewLabel}</span>

                      {card.timesReviewed > 0 && (
                        <span className="text-xs text-gray-400">· {card.timesReviewed}× reviewed</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Card detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-5 flex-wrap">
              <div className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[getStatus(selected, now)]}`} />
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[getStatus(selected, now)]}`}>
                {getStatus(selected, now)}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${getDifficultyColor(selected.difficulty)}`}>
                {selected.difficulty}
              </span>
              <span className="text-xs text-gray-400">
                {formatNextReview(selected.nextReview, now)}
              </span>
            </div>

            <div className="mb-5">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Front
              </div>
              <div className="text-base font-medium text-gray-900 leading-relaxed">
                {selected.front}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Back
              </div>
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selected.back}
              </div>
            </div>

            {selected.timesReviewed > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4 text-xs text-gray-400">
                <span>Reviewed {selected.timesReviewed}×</span>
                {selected.intervalDays > 0 && <span>Interval {selected.intervalDays}d</span>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
