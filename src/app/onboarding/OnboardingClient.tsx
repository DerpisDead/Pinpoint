"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase";
import DynamicIcon from "@/components/app/DynamicIcon";
import type { Event } from "@/types/database";

type Props = {
  events: Event[];
  userId: string;
};

export default function OnboardingClient({ events, userId }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    // 1. Insert user_events
    const userEventsRows = Array.from(selected).map((event_id) => ({
      user_id: userId,
      event_id,
    }));

    const { error: ueError } = await supabase
      .from("user_events")
      .insert(userEventsRows);

    if (ueError) {
      setError("Failed to save your events. Please try again.");
      setSubmitting(false);
      return;
    }

    // 2. Fetch all cards for selected events
    const { data: cards, error: cardsError } = await supabase
      .from("cards")
      .select("id")
      .in("event_id", Array.from(selected));

    if (cardsError) {
      setError("Failed to load cards. Please try again.");
      setSubmitting(false);
      return;
    }

    // 3. Bulk-create user_cards (all due immediately)
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

  // Group events by category
  const byCategory = events.reduce<Record<string, Event[]>>((acc, event) => {
    if (!acc[event.category]) acc[event.category] = [];
    acc[event.category].push(event);
    return acc;
  }, {});

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
            {selected.size} selected
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
            What are you competing in?
          </h1>
          <p className="text-gray-500">
            Pick the HOSA events you want to study for. You can change these
            later.
          </p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-8 pb-28">
          {Object.entries(byCategory).map(([category, categoryEvents]) => (
            <div key={category}>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
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
                          ? "border-blue-500 bg-blue-50 shadow-sm shadow-blue-100"
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
                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                          <Check size={13} className="text-white" strokeWidth={3} />
                        </div>
                      )}

                      <div className="pl-4">
                        {/* Icon + name */}
                        <div className="flex items-center gap-2 mb-1.5">
                          <DynamicIcon
                            name={event.icon}
                            size={16}
                            className={isSelected ? "text-blue-600" : "text-gray-400"}
                          />
                          <span
                            className={`font-semibold text-sm ${
                              isSelected ? "text-blue-700" : "text-gray-900"
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
          ))}
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
                <span className="font-semibold text-gray-900">
                  {selected.size}
                </span>{" "}
                event{selected.size !== 1 ? "s" : ""} selected
              </>
            )}
          </p>
          <button
            onClick={handleSubmit}
            disabled={selected.size === 0 || submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full gradient-btn text-white font-semibold text-sm shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
