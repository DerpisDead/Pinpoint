import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ eventId: string }>;
}): Promise<Metadata> {
  const { eventId } = await params;
  const { createClient } = await import("@/lib/supabase-server");
  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("name, category, description")
    .eq("id", eventId)
    .single();

  if (!event) return { title: "Event — PinPoint" };
  return {
    title: `${event.name} — PinPoint`,
    description:
      event.description ??
      `Study ${event.name} (${event.category}) with spaced repetition flashcards on PinPoint.`,
  };
}

// Convert hex color to rgba string
function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
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

  const untouched = totalCards - userCardList.length;
  buckets.new += untouched;

  const avgEase = userCardList.length > 0 ? easeSum / userCardList.length : 2.5;
  const masteredPct =
    totalCards > 0 ? Math.round((buckets.mastered / totalCards) * 100) : 0;

  // Use event color at different opacities for buckets
  const color = event.color ?? "#6366f1";
  const BUCKET_CONFIG = [
    { key: "new" as const,      label: "New",       alpha: 0.15 },
    { key: "learning" as const, label: "Learning",   alpha: 0.40 },
    { key: "reviewing" as const,label: "Reviewing",  alpha: 0.70 },
    { key: "mastered" as const, label: "Mastered",   alpha: 1.00 },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        <ChevronLeft size={15} />
        Dashboard
      </Link>

      {/* Event header */}
      <div
        className="rounded-3xl p-5 flex items-start gap-4"
        style={{ background: hexToRgba(color, 0.08), border: `1.5px solid ${hexToRgba(color, 0.2)}` }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-sm"
          style={{ background: hexToRgba(color, 0.15) }}
        >
          {event.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {event.name}
            </h1>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: hexToRgba(color, 0.15), color }}
            >
              {event.category}
            </span>
          </div>
          {event.description && (
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">{event.description}</p>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Cards", value: totalCards },
          { label: "Mastery",     value: `${masteredPct}%` },
          { label: "Due Now",     value: dueCount ?? 0 },
          { label: "Avg Ease",    value: avgEase.toFixed(2) },
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

        {/* Stacked bar */}
        <div className="flex h-4 rounded-full overflow-hidden gap-px mb-4">
          {BUCKET_CONFIG.map(({ key, alpha }) => {
            const pct = totalCards > 0 ? (buckets[key] / totalCards) * 100 : 0;
            if (pct === 0) return null;
            return (
              <div
                key={key}
                className="transition-all"
                style={{ width: `${pct}%`, background: hexToRgba(color, alpha) }}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-5 gap-y-1.5">
          {BUCKET_CONFIG.map(({ key, label, alpha }) => (
            <div key={key} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-sm"
                style={{ background: hexToRgba(color, alpha) }}
              />
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
        {[
          {
            href: `/dashboard/event/${eventId}/study`,
            icon: BookOpen,
            label: "Study Due Cards",
            sub: `${dueCount ?? 0} cards ready`,
            hoverBg: "hover:bg-[#EFF3F9]",
            hoverBorder: "hover:border-[#1C3F6E]/20",
            iconBg: "bg-[#EFF3F9] group-hover:bg-[#D6E4F3]",
            iconColor: "text-[#1C3F6E]",
          },
          {
            href: `/dashboard/event/${eventId}/study?mode=all`,
            icon: Layers,
            label: "Study All Cards",
            sub: `${totalCards} cards total`,
            hoverBg: "hover:bg-[#F5EEF0]",
            hoverBorder: "hover:border-[#8B1A2D]/20",
            iconBg: "bg-purple-100 group-hover:bg-purple-200",
            iconColor: "text-[#8B1A2D]",
          },
          {
            href: `/dashboard/practice-test?eventId=${eventId}`,
            icon: ClipboardCheck,
            label: "Practice Test",
            sub: "Multiple choice",
            hoverBg: "hover:bg-green-50",
            hoverBorder: "hover:border-green-200",
            iconBg: "bg-green-100 group-hover:bg-green-200",
            iconColor: "text-green-600",
          },
          {
            href: `/dashboard/event/${eventId}/cards`,
            icon: Layers,
            label: "Browse Cards",
            sub: "Search & filter",
            hoverBg: "hover:bg-orange-50",
            hoverBorder: "hover:border-orange-200",
            iconBg: "bg-orange-100 group-hover:bg-orange-200",
            iconColor: "text-orange-600",
          },
          {
            href: `/dashboard/event/${eventId}/matching`,
            icon: Puzzle,
            label: "Matching",
            sub: "Match terms · +30 XP",
            hoverBg: "hover:bg-pink-50",
            hoverBorder: "hover:border-pink-200",
            iconBg: "bg-pink-100 group-hover:bg-pink-200",
            iconColor: "text-pink-600",
          },
          {
            href: `/dashboard/event/${eventId}/type-answer`,
            icon: Keyboard,
            label: "Type Answer",
            sub: "XP per correct card",
            hoverBg: "hover:bg-teal-50",
            hoverBorder: "hover:border-teal-200",
            iconBg: "bg-teal-100 group-hover:bg-teal-200",
            iconColor: "text-teal-600",
          },
        ].map(({ href, icon: Icon, label, sub, hoverBg, hoverBorder, iconBg, iconColor }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 ${hoverBorder} ${hoverBg} transition-all shadow-sm group`}
          >
            <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center transition-colors shrink-0`}>
              <Icon size={18} className={iconColor} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900">{label}</div>
              <div className="text-xs text-gray-400">{sub}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
