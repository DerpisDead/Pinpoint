"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type EventRow = {
  id: string;
  name: string;
  color: string;
  icon: string;
};

type Props = {
  events: EventRow[];
  mode: "matching" | "type-answer";
  title: string;
  description: string;
  icon: string;
};

export default function EventModeSelector({ events, mode, title, description, icon }: Props) {
  const router = useRouter();

  function handleSelect(eventId: string) {
    router.push(`/dashboard/event/${eventId}/${mode}`);
  }

  return (
    <div className="max-w-lg space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/study"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-3 transition-colors"
        >
          <ChevronLeft size={15} />
          Study
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
      </div>

      {/* Event grid */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          Choose an event
        </p>
        {events.map((event) => (
          <button
            key={event.id}
            onClick={() => handleSelect(event.id)}
            className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-sm transition-all text-left group"
            style={
              {
                "--event-color": event.color,
              } as React.CSSProperties
            }
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = event.color + "60";
              (e.currentTarget as HTMLButtonElement).style.background = event.color + "08";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "";
              (e.currentTarget as HTMLButtonElement).style.background = "";
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: event.color + "20" }}
            >
              {event.icon}
            </div>
            <span className="text-sm font-semibold text-gray-900">{event.name}</span>
            <span className="ml-auto text-gray-300 group-hover:text-gray-400 transition-colors">
              →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
