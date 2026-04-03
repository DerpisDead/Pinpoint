"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, X, ChevronLeft } from "lucide-react";
import type { BrowsableCard } from "@/app/dashboard/event/[eventId]/cards/page";

type Filter = "all" | "due" | "new" | "learning" | "mastered";

function getStatus(card: BrowsableCard, now: string): Filter {
  if (card.repetitions === 0) return "new";
  if (card.repetitions <= 1) return "learning";
  if (card.intervalDays >= 21) return "mastered";
  if (card.nextReview && card.nextReview <= now) return "due";
  return "learning";
}

function getDifficultyColor(d: "easy" | "medium" | "hard") {
  if (d === "easy") return "bg-green-100 text-green-700";
  if (d === "medium") return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
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
    { key: "all", label: "All" },
    { key: "due", label: "Due" },
    { key: "new", label: "New" },
    { key: "learning", label: "Learning" },
    { key: "mastered", label: "Mastered" },
  ];

  const filtered = cards.filter((c) => {
    const matchesSearch =
      search === "" ||
      c.front.toLowerCase().includes(search.toLowerCase()) ||
      c.back.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === "all") return true;
    if (filter === "due") return c.nextReview !== null && c.nextReview <= now;
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
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: eventColor + "20", border: `1.5px solid ${eventColor}40` }}
          >
            {eventIcon}
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            Browse Cards
            <span className="ml-2 text-sm font-normal text-gray-400">
              {cards.length} total
            </span>
          </h1>
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
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-colors bg-white"
        />
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              filter === key
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600"
            }`}
          >
            {label}
            {key !== "all" && (
              <span className="ml-1 opacity-60">
                {cards.filter((c) =>
                  key === "due"
                    ? c.nextReview !== null && c.nextReview <= now
                    : getStatus(c, now) === key
                ).length}
              </span>
            )}
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
            const isDue = card.nextReview !== null && card.nextReview <= now;
            return (
              <button
                key={card.id}
                onClick={() => setSelected(card)}
                className="w-full text-left bg-white rounded-2xl border border-gray-100 p-4 hover:border-blue-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{card.front}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{card.back}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isDue && card.repetitions > 0 && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                        Due
                      </span>
                    )}
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                        status === "new"
                          ? "bg-gray-100 text-gray-500"
                          : status === "learning"
                          ? "bg-blue-100 text-blue-600"
                          : status === "mastered"
                          ? "bg-green-100 text-green-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {status}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${getDifficultyColor(
                        card.difficulty
                      )}`}
                    >
                      {card.difficulty}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span>Reviewed {card.timesReviewed}×</span>
                  {card.intervalDays > 0 && <span>Interval {card.intervalDays}d</span>}
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

            <div className="flex items-center gap-2 mb-4">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${getDifficultyColor(
                  selected.difficulty
                )}`}
              >
                {selected.difficulty}
              </span>
              <span className="text-xs text-gray-400">
                Reviewed {selected.timesReviewed}×
              </span>
            </div>

            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                Front
              </div>
              <div className="text-base font-medium text-gray-900 leading-relaxed">
                {selected.front}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                Back
              </div>
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selected.back}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
