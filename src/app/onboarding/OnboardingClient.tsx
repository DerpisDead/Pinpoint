"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Search } from "lucide-react";
import { createClient } from "@/lib/supabase";
import DynamicIcon from "@/components/app/DynamicIcon";
import type { Event } from "@/types/database";

const CATEGORIES = [
  "All",
  "Health Science",
  "Health Professions",
  "Emergency Preparedness",
  "Leadership",
  "Teamwork",
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  "Health Science": "#3B82F6",
  "Health Professions": "#8B5CF6",
  "Emergency Preparedness": "#F59E0B",
  "Leadership": "#10B981",
  "Teamwork": "#EC4899",
};

type Props = {
  events: Event[];
  userId: string;
};

export default function OnboardingClient({ events, userId }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  function toggleEvent(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit() {
    if (selected.size === 0) return;
    setSubmitting(true);
    setError(null);

    const supabase = createClient();

    const userEventsRows = Array.from(selected).map((event_id) => ({
      user_id: userId,
      event_id,
    }));

    const { error: ueError } = await supabase
      .from("user_events")
      .insert(userEventsRows);

    if (ueError) {
      console.error("user_events insert error:", ueError);
      setError(`Failed to save your events: ${ueError.message} (${ueError.code})`);
      setSubmitting(false);
      return;
    }

    const { data: cards, error: cardsError } = await supabase
      .from("cards")
      .select("id")
      .in("event_id", Array.from(selected));

    if (cardsError) {
      setError("Failed to load cards. Please try again.");
      setSubmitting(false);
      return;
    }

    if (cards && cards.length > 0) {
      const userCardRows = cards.map((card) => ({
        user_id: userId,
        card_id: card.id,
        ease_factor: 2.5,
        interval_days: 0,
        repetitions: 0,
        next_review: new Date().toISOString(),
      }));

      const { error: ucError } = await supabase
        .from("user_cards")
        .insert(userCardRows);

      if (ucError) {
        setError("Failed to set up your cards. Please try again.");
        setSubmitting(false);
        return;
      }
    }

    router.push("/dashboard");
    router.refresh();
  }

  // Filter events by search + active category
  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events.filter((ev) => {
      const matchesCategory =
        activeCategory === "All" || ev.category === activeCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        ev.name.toLowerCase().includes(q) ||
        ev.category.toLowerCase().includes(q) ||
        (ev.description ?? "").toLowerCase().includes(q)
      );
    });
  }, [events, search, activeCategory]);

  // Group filtered events by category, preserving canonical order
  const byCategory = useMemo(() => {
    const map: Record<string, Event[]> = {};
    for (const ev of filteredEvents) {
      if (!map[ev.category]) map[ev.category] = [];
      map[ev.category].push(ev);
    }
    // Sort within each category by name
    for (const cat of Object.keys(map)) {
      map[cat].sort((a, b) => a.name.localeCompare(b.name));
    }
    return map;
  }, [filteredEvents]);

  const categoryOrder = CATEGORIES.filter((c) => c !== "All");
  const sortedCategories = categoryOrder.filter((c) => byCategory[c]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-[#F8FAFC]/95 backdrop-blur-sm z-10 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-btn flex items-center justify-center shadow">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-lg font-bold gradient-text">PinPoint</span>
          </div>
          <span className="text-sm text-gray-400">
            {selected.size > 0 ? (
              <>
                <span className="font-semibold text-gray-700">{selected.size}</span> selected
              </>
            ) : (
              "0 selected"
            )}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
            What are you competing in?
          </h1>
          <p className="text-gray-500">
            Pick the HOSA events you want to study for. You can change these later.
          </p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Search bar */}
        <div className="relative mb-4">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
          />
        </div>

        {/* Category filter tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 mb-6 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            const color = cat === "All" ? "#3B82F6" : CATEGORY_COLORS[cat];
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  isActive
                    ? "border-transparent text-white shadow-sm"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
                style={isActive ? { backgroundColor: color } : {}}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="space-y-8 pb-28">
          {sortedCategories.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">
              No events match your search.
            </div>
          ) : (
            sortedCategories.map((category) => {
              const categoryEvents = byCategory[category];
              const catColor = CATEGORY_COLORS[category] ?? "#3B82F6";
              return (
                <div key={category}>
                  <h2
                    className="text-xs font-semibold uppercase tracking-widest mb-3"
                    style={{ color: catColor }}
                  >
                    {category}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {categoryEvents.map((event) => {
                      const isSelected = selected.has(event.id);
                      return (
                        <button
                          key={event.id}
                          onClick={() => toggleEvent(event.id)}
                          className={`relative text-left rounded-2xl border-2 p-4 transition-all duration-150 group ${
                            isSelected
                              ? "border-[#1C3F6E] bg-[#EFF3F9] shadow-sm shadow-[#1C3F6E]/10"
                              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                          }`}
                        >
                          {/* Color accent bar */}
                          <div
                            className="absolute left-0 top-4 bottom-4 w-1 rounded-full"
                            style={{ backgroundColor: event.color }}
                          />

                          {/* Check indicator */}
                          {isSelected && (
                            <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#1C3F6E] flex items-center justify-center">
                              <Check size={13} className="text-white" strokeWidth={3} />
                            </div>
                          )}

                          <div className="pl-4">
                            {/* Icon + name */}
                            <div className="flex items-center gap-2 mb-1.5">
                              <DynamicIcon
                                name={event.icon}
                                size={16}
                                className={isSelected ? "text-[#1C3F6E]" : "text-gray-400"}
                              />
                              <span
                                className={`font-semibold text-sm ${
                                  isSelected ? "text-[#1C3F6E]" : "text-gray-900"
                                }`}
                              >
                                {event.name}
                              </span>
                            </div>

                            {/* Category badge */}
                            <span
                              className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full mb-2"
                              style={{
                                backgroundColor: `${event.color}18`,
                                color: event.color,
                              }}
                            >
                              {event.category}
                            </span>

                            {/* Description */}
                            {event.description && (
                              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                                {event.description}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-100 p-4 z-20">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            {selected.size === 0 ? (
              "Select at least one event to continue"
            ) : (
              <>
                <span className="font-semibold text-gray-900">{selected.size}</span>{" "}
                event{selected.size !== 1 ? "s" : ""} selected
              </>
            )}
          </p>
          <button
            onClick={handleSubmit}
            disabled={selected.size === 0 || submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full gradient-btn text-white font-semibold text-sm shadow-lg shadow-[#8B1A2D]/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {submitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Setting up…
              </>
            ) : (
              "Continue →"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
