"use client";

import { useRouter } from "next/navigation";

type Event = { id: string; name: string };

export default function EventDropdown({
  events,
  currentEventId,
}: {
  events: Event[];
  currentEventId: string | undefined;
}) {
  const router = useRouter();

  return (
    <select
      value={currentEventId ?? ""}
      onChange={(e) => {
        const id = e.target.value;
        if (id) {
          router.push(`/dashboard/leaderboard?tab=byevent&eventId=${id}`);
        }
      }}
      className="w-full sm:w-72 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
    >
      <option value="">Select an event…</option>
      {events.map((ev) => (
        <option key={ev.id} value={ev.id}>
          {ev.name}
        </option>
      ))}
    </select>
  );
}
