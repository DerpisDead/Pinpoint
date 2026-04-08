import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import {
  Flame,
  Clock,
  Zap,
  Target,
  BookOpen,
  ClipboardCheck,
  ArrowRight,
  Search,
  Plus,
} from "lucide-react";
import DynamicIcon from "@/components/app/DynamicIcon";
import { formatDate, timeAgo } from "@/lib/time";
import { getLevel } from "@/lib/xp";
import { getLeagueProgress } from "@/lib/league";
import AppHeader from "@/components/app/AppHeader";

// ─── Types for joined queries ────────────────────────────────────────────────

type UserEventWithEvent = {
  id: string;
  event_id: string;
  events: {
    id: string;
    name: string;
    category: string;
    color: string;
    icon: string;
  };
};

type ReviewWithCard = {
  id: string;
  quality: number;
  reviewed_at: string;
  cards: {
    front: string;
    events: { name: string; color: string };
  };
};

type TestWithEvent = {
  id: string;
  score: number;
  total_questions: number;
  completed_at: string;
  events: { name: string; color: string };
};

type UserCardLight = {
  ease_factor: number;
  next_review: string;
  cards: { event_id: string };
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function computeMastery(cards: UserCardLight[]) {
  if (!cards.length) return 0;
  const mastered = cards.filter((c) => c.ease_factor >= 3.0).length;
  return Math.round((mastered / cards.length) * 100);
}

function computeEventStats(cards: UserCardLight[]) {
  const now = new Date();
  const byEvent: Record<string, { total: number; mastered: number; due: number }> = {};

  cards.forEach((uc) => {
    const eid = uc.cards?.event_id;
    if (!eid) return;
    if (!byEvent[eid]) byEvent[eid] = { total: 0, mastered: 0, due: 0 };
    byEvent[eid].total++;
    if (uc.ease_factor >= 3.0) byEvent[eid].mastered++;
    if (new Date(uc.next_review) <= now) byEvent[eid].due++;
  });

  return byEvent;
}

function qualityLabel(q: number) {
  if (q >= 4) return "Got it";
  if (q >= 2) return "Almost";
  return "Missed it";
}

function qualityColor(q: number) {
  if (q >= 4) return "text-emerald-600 bg-emerald-50";
  if (q >= 2) return "text-yellow-600 bg-yellow-50";
  return "text-red-600 bg-red-50";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // ── Parallel data fetching ──────────────────────────────────────────────────
  const [
    { data: profile },
    { data: rawUserEvents },
    { data: rawUserCards },
    { data: rawReviews },
    { data: rawTests },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),

    supabase
      .from("user_events")
      .select("id, event_id, events(id, name, category, color, icon)")
      .eq("user_id", user.id),

    supabase
      .from("user_cards")
      .select("ease_factor, next_review, cards(event_id)")
      .eq("user_id", user.id),

    supabase
      .from("reviews")
      .select("id, quality, reviewed_at, cards(front, events(name, color))")
      .eq("user_id", user.id)
      .order("reviewed_at", { ascending: false })
      .limit(5),

    supabase
      .from("practice_tests")
      .select("id, score, total_questions, completed_at, events(name, color)")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false })
      .limit(5),
  ]);

  // Redirect to onboarding if no events selected yet
  if (!rawUserEvents || rawUserEvents.length === 0) {
    redirect("/onboarding");
  }

  const userEvents = rawUserEvents as unknown as UserEventWithEvent[];
  const userCards = (rawUserCards ?? []) as unknown as UserCardLight[];
  const recentReviews = (rawReviews ?? []) as unknown as ReviewWithCard[];
  const recentTests = (rawTests ?? []) as unknown as TestWithEvent[];

  // ── Derived stats ───────────────────────────────────────────────────────────
  const now = new Date();
  const dueCount = userCards.filter(
    (uc) => new Date(uc.next_review) <= now
  ).length;
  const overallMastery = computeMastery(userCards);
  const eventStats = computeEventStats(userCards);

  // Build recent activity — merge reviews + tests, sorted by date, take 5
  type ActivityItem =
    | { kind: "review"; id: string; label: string; sub: string; time: string; quality: number; eventColor: string }
    | { kind: "test"; id: string; label: string; sub: string; time: string; pct: number; eventColor: string };

  const activities: ActivityItem[] = [
    ...recentReviews.map((r) => ({
      kind: "review" as const,
      id: r.id,
      label: r.cards?.front ?? "Flashcard",
      sub: r.cards?.events?.name ?? "HOSA Event",
      time: r.reviewed_at,
      quality: r.quality,
      eventColor: r.cards?.events?.color ?? "#1C3F6E",
    })),
    ...recentTests.map((t) => ({
      kind: "test" as const,
      id: t.id,
      label: t.events?.name ?? "Practice Test",
      sub: `${t.score}/${t.total_questions} correct`,
      time: t.completed_at,
      pct: Math.round((t.score / (t.total_questions || 1)) * 100),
      eventColor: t.events?.color ?? "#8B1A2D",
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 5);

  const displayName = profile?.display_name ?? user.email?.split("@")[0] ?? "there";
  const levelInfo = getLevel(profile?.total_xp ?? 0);
  const leagueProgress = getLeagueProgress(profile?.total_xp ?? 0);

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* ── Top header ── */}
      <AppHeader profile={profile} />

      {/* ── Welcome ── */}
      <section>
        <p className="text-sm text-gray-400 mb-0.5">{formatDate()}</p>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {displayName} 👋
        </h1>
      </section>

      {/* ── Stats row ── */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={<Flame size={18} className="text-orange-500 flame-pulse" />}
            iconBg="bg-orange-50"
            value={profile?.current_streak ?? 0}
            label="Day Streak"
            sub={
              profile?.longest_streak
                ? `Best: ${profile.longest_streak}`
                : "Keep it going!"
            }
          />
          <StatCard
            icon={<Clock size={18} className="text-gray-400" />}
            iconBg="bg-gray-50"
            value={dueCount}
            label="Cards Due"
            sub={dueCount === 0 ? "All caught up!" : "Ready to review"}
            highlight={dueCount > 0}
          />
          <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
                <Zap size={18} className="text-gray-400" />
              </div>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${leagueProgress.league.bgClass} ${leagueProgress.league.textClass} ${leagueProgress.league.borderClass}`}
              >
                {leagueProgress.league.emoji} {leagueProgress.league.name}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{profile?.total_xp ?? 0}</p>
              <p className="text-xs font-medium text-gray-500 mt-0.5">Total XP</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Level {levelInfo.level}</p>
              <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full progress-animated"
                  style={{
                    width: `${levelInfo.progress}%`,
                    background: "linear-gradient(90deg, #1C3F6E, #8B1A2D)",
                  }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                {levelInfo.currentLevelXp} / {levelInfo.xpForNextLevel} XP
              </p>
            </div>
          </div>
          <StatCard
            icon={<Target size={18} className="text-gray-400" />}
            iconBg="bg-gray-50"
            value={`${overallMastery}%`}
            label="Mastery"
            sub={`${userCards.length} cards total`}
          />
        </div>
      </section>

      {/* ── Your Events ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">
            Your Events
          </h2>
          <Link
            href="/onboarding"
            className="flex items-center gap-1 text-xs text-[#1C3F6E] hover:text-[#0D1B3E] font-medium transition-colors"
          >
            <Plus size={13} />
            Add Events
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
          {userEvents.map(({ event_id, events: ev }) => {
            const stats = eventStats[event_id] ?? { total: 0, mastered: 0, due: 0 };
            const mastery = stats.total
              ? Math.round((stats.mastered / stats.total) * 100)
              : 0;
            return (
              <Link
                key={event_id}
                href={`/dashboard/event/${event_id}`}
                className="snap-start shrink-0 w-52 bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
              >
                {/* Color bar top */}
                <div
                  className="h-1.5 w-full rounded-full mb-3 opacity-80"
                  style={{ backgroundColor: ev.color }}
                />

                <div className="flex items-center gap-2 mb-1">
                  <DynamicIcon
                    name={ev.icon}
                    size={15}
                    className="text-gray-400"
                  />
                  <span className="text-sm font-semibold text-gray-800 truncate">
                    {ev.name}
                  </span>
                </div>

                <p className="text-xs text-gray-400 mb-3 truncate">{ev.category}</p>

                {/* Progress bar */}
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full progress-animated"
                    style={{
                      width: `${mastery}%`,
                      backgroundColor: ev.color,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{mastery}% mastered</span>
                  {stats.due > 0 && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#EFF3F9] text-[#1C3F6E]">
                      {stats.due} due
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Quick Actions ── */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/dashboard/study"
            className="group flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                <BookOpen size={20} className="text-gray-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Study Now</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {dueCount > 0
                    ? `${dueCount} card${dueCount !== 1 ? "s" : ""} due for review`
                    : "No cards due — review ahead!"}
                </p>
              </div>
            </div>
            <ArrowRight size={18} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
          </Link>

          <Link
            href="/dashboard/practice-test"
            className="group flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                <ClipboardCheck size={20} className="text-gray-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Practice Test</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Timed, competition-style test
                </p>
              </div>
            </div>
            <ArrowRight size={18} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
          </Link>
        </div>
      </section>

      {/* ── Recent Activity ── */}
      {activities.length > 0 && (
        <section className="pb-4">
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            Recent Activity
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
            {activities.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                {/* Icon */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${item.eventColor}18` }}
                >
                  {item.kind === "review" ? (
                    <BookOpen size={14} style={{ color: item.eventColor }} />
                  ) : (
                    <ClipboardCheck size={14} style={{ color: item.eventColor }} />
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate font-medium">
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{item.sub}</p>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2 shrink-0">
                  {item.kind === "review" && (
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${qualityColor(item.quality)}`}
                    >
                      {qualityLabel(item.quality)}
                    </span>
                  )}
                  {item.kind === "test" && (
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        item.pct >= 90
                          ? "text-emerald-600 bg-emerald-50"
                          : item.pct >= 70
                          ? "text-yellow-600 bg-yellow-50"
                          : "text-red-600 bg-red-50"
                      }`}
                    >
                      {item.pct}%
                    </span>
                  )}
                  <span className="text-xs text-gray-400">{timeAgo(item.time)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── StatCard subcomponent ────────────────────────────────────────────────────

function StatCard({
  icon,
  iconBg,
  value,
  label,
  sub,
  highlight = false,
}: {
  icon: React.ReactNode;
  iconBg: string;
  value: number | string;
  label: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-2xl border p-4 flex flex-col gap-3 ${
        highlight ? "border-[#1C3F6E]/30 shadow-sm shadow-[#1C3F6E]/5" : "border-gray-100"
      }`}
    >
      <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs font-medium text-gray-500 mt-0.5">{label}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}
