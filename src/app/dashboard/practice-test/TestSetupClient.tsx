"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ClipboardCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import DynamicIcon from "@/components/app/DynamicIcon";
import type { Event } from "@/types/database";

type Props = {
  events: Event[];
};

const COUNT_OPTIONS = [10, 25, 50] as const;
type Count = (typeof COUNT_OPTIONS)[number];

export default function TestSetupClient({ events }: Props) {
  const router = useRouter();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    events.length === 1 ? events[0].id : null
  );
  const [questionCount, setQuestionCount] = useState<Count>(25);
  const [timedMode, setTimedMode] = useState(true);

  function handleStart() {
    if (!selectedEventId) return;
    const url = `/dashboard/practice-test/${selectedEventId}?count=${questionCount}&timed=${timedMode}`;
    router.push(url);
  }

  const canStart = !!selectedEventId;

  // Group by category
  const byCategory = events.reduce<Record<string, Event[]>>((acc, ev) => {
    if (!acc[ev.category]) acc[ev.category] = [];
    acc[ev.category].push(ev);
    return acc;
  }, {});

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ClipboardCheck size={20} className="text-[#8B1A2D]" />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Practice Test
          </h1>
        </div>
        <p className="text-gray-500 text-sm">
          Choose an event, set your options, and test your knowledge in
          competition format.
        </p>
      </div>

      {/* Event selection */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          1. Select an event
        </h2>
        <div className="space-y-6">
          {Object.entries(byCategory).map(([category, catEvents]) => (
            <div key={category}>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
                {category}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {catEvents.map((ev) => {
                  const isSelected = selectedEventId === ev.id;
                  return (
                    <button
                      key={ev.id}
                      onClick={() => setSelectedEventId(ev.id)}
                      className={`relative text-left rounded-xl border-2 px-4 py-3 transition-all duration-150 ${
                        isSelected
                          ? "border-[#1C3F6E] bg-[#EFF3F9]"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      {/* Colored left bar */}
                      <div
                        className="absolute left-0 top-3 bottom-3 w-1 rounded-full"
                        style={{ backgroundColor: ev.color }}
                      />
                      <div className="pl-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <DynamicIcon
                            name={ev.icon}
                            size={15}
                            className={isSelected ? "text-[#1C3F6E]" : "text-gray-400"}
                          />
                          <span
                            className={`font-semibold text-sm truncate ${
                              isSelected ? "text-[#1C3F6E]" : "text-gray-800"
                            }`}
                          >
                            {ev.name}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#1C3F6E] flex items-center justify-center shrink-0">
                            <Check size={11} className="text-white" strokeWidth={3} />
                          </div>
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

      {/* Question count */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          2. Number of questions
        </h2>
        <div className="flex gap-2">
          {COUNT_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => setQuestionCount(n)}
              className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all duration-150 ${
                questionCount === n
                  ? "border-[#1C3F6E] bg-[#EFF3F9] text-[#1C3F6E]"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          If the event has fewer cards than selected, all available cards will
          be used.
        </p>
      </div>

      {/* Timed mode */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          3. Options
        </h2>
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3.5">
          <div>
            <p className="text-sm font-medium text-gray-800">Timed Mode</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Track how long the test takes
            </p>
          </div>
          <Switch
            checked={timedMode}
            onCheckedChange={setTimedMode}
            aria-label="Toggle timed mode"
          />
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={handleStart}
        disabled={!canStart}
        className="w-full py-3.5 rounded-full gradient-btn text-white font-semibold text-base shadow-lg shadow-[#8B1A2D]/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all"
      >
        Start Test →
      </button>
    </div>
  );
}
