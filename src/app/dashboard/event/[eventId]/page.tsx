import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Layers,
  ClipboardCheck,
  Puzzle,
  Keyboard,
  ChevronLeft,
} from "lucide-react";
import { createClient } from "@/lib/supabase-server";

type MasteryBucket = "new" | "learning" | "reviewing" | "mastered";

function getMasteryBucket(repetitions: number, intervalDays: number): MasteryBucket {
  if (repetitions === 0) return "new";
  if (repetitions <= 1) return "learning";
  if (intervalDays < 21) return "reviewing";
  return "mastered";
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: event }, { data: userEventRow }] = await Promise.all([
    supabase.from("events").select("*").eq("id", eventId).single(),
    supabase
      .from("user_events")
      .select("id")
      .eq("user_id", user.id)
      .eq("event_id", eventId)
      .maybeSingle(),
  ]);

  if (!event) notFound();
  if (!userEventRow) redirect("/dashboard");

  // Fetch all user_cards for this event
  const { data: cardRows } = await supabase
    .from("cards")
    .select("id")
    .eq("event_id", eventId);

  const cardIds = (cardRows ?? []).map((r: { id: string }) => r.id);

  const now = new Date().toISOString();

  const [{ data: userCards }, { count: dueCount }] = await Promise.all([
    supabase
      .from("user_cards")
      .select("repetitions, interval_days, ease_factor")
      .eq("user_id", user.id)
      .in("card_id", cardIds),
    supabase
      .from("user_cards")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .in("card_id", cardIds)
      .lte("next_review", now),
  ]);

  const totalCards = cardIds.length;
  const userCardList = userCards ?? [];

  const buckets = { new: 0, learning: 0, reviewing: 0, mastered: 0 };
  let easeSum = 0;

  for (const uc of userCardList) {
    const bucket = getMasteryBucket(uc.repetitions, uc.interval_days);
    buckets[bucket]++;
    easeSum += uc.ease_factor;
  }

  // Cards never touched are "new" even if not in user_cards yet
  const untouched = totalCards - userCardList.length;
  buckets.new += untouched;

  const avgEase = userCardList.length > 0 ? easeSum / userCardList.length : 2.5;
  const masteredPct =
    totalCards > 0 ? Math.round((buckets.mastered / totalCards) * 100) : 0;

  const BUCKET_CONFIG = [
    { key: "new" as const, label: "New", color: "bg-gray-300" },
    { key: "learning" as const, label: "Learning", color: "bg-blue-400" },
    { key: "reviewing" as const, label: "Reviewing", color: "bg-yellow-400" },
    { key: "mastered" as const, label: "Mastered", color: "bg-green-500" },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Back + header */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-3 transition-colors"
        >
          <ChevronLeft size={15} />
          Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
            style={{ background: event.color + "20", border: `1.5px solid ${event.color}40` }}
          >
            {event.icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {event.name}
            </h1>
            <p className="text-sm text-gray-500">{event.category}</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Cards", value: totalCards },
          { label: "Mastery", value: `${masteredPct}%` },
          { label: "Due Now", value: dueCount ?? 0 },
          { label: "Avg Ease", value: avgEase.toFixed(2) },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-gray-100 p-3 text-center shadow-sm"
          >
            <div className="text-xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Mastery breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Mastery Breakdown</h2>
        {/* Bar chart */}
        <div className="flex h-4 rounded-full overflow-hidden gap-0.5 mb-4">
          {BUCKET_CONFIG.map(({ key, color }) => {
            const pct = totalCards > 0 ? (buckets[key] / totalCards) * 100 : 0;
            if (pct === 0) return null;
            return (
              <div
                key={key}
                className={`${color} transition-all`}
                style={{ width: `${pct}%` }}
              />
            );
          })}
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {BUCKET_CONFIG.map(({ key, label, color }) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-sm ${color}`} />
              <span className="text-xs text-gray-500">
                {label}{" "}
                <span className="font-semibold text-gray-700">{buckets[key]}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href={`/dashboard/event/${eventId}/study`}
          className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
            <BookOpen size={18} className="text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Study Due</div>
            <div className="text-xs text-gray-400">{dueCount ?? 0} cards ready</div>
          </div>
        </Link>

        <Link
          href={`/dashboard/event/${eventId}/study?mode=all`}
          className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-all shadow-sm group"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
            <Layers size={18} className="text-purple-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Study All</div>
            <div className="text-xs text-gray-400">{totalCards} cards total</div>
          </div>
        </Link>

        <Link
          href={`/dashboard/practice-test?eventId=${eventId}`}
          className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:border-green-200 hover:bg-green-50 transition-all shadow-sm group"
        >
          <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
            <ClipboardCheck size={18} className="text-green-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Practice Test</div>
            <div className="text-xs text-gray-400">Multiple choice</div>
          </div>
        </Link>

        <Link
          href={`/dashboard/event/${eventId}/cards`}
          className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all shadow-sm group"
        >
          <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
            <Layers size={18} className="text-orange-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Browse Cards</div>
            <div className="text-xs text-gray-400">Search & filter</div>
          </div>
        </Link>

        <Link
          href={`/dashboard/event/${eventId}/matching`}
          className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:border-pink-200 hover:bg-pink-50 transition-all shadow-sm group"
        >
          <div className="w-9 h-9 rounded-xl bg-pink-100 flex items-center justify-center group-hover:bg-pink-200 transition-colors">
            <Puzzle size={18} className="text-pink-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Matching</div>
            <div className="text-xs text-gray-400">Match terms +30 XP</div>
          </div>
        </Link>

        <Link
          href={`/dashboard/event/${eventId}/type-answer`}
          className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:border-teal-200 hover:bg-teal-50 transition-all shadow-sm group"
        >
          <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center group-hover:bg-teal-200 transition-colors">
            <Keyboard size={18} className="text-teal-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Type Answer</div>
            <div className="text-xs text-gray-400">XP per correct card</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
