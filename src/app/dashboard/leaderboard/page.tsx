import { redirect } from "next/navigation";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase-server";
import {
  getAllTimeLeaderboard,
  getWeeklyLeaderboard,
  getEventMasteryLeaderboard,
  getWeekStart,
  type LeaderboardEntry,
} from "@/lib/leaderboard";
import { getLeagueConfig, getLeagueProgress } from "@/lib/league";
import EventDropdown from "@/components/app/EventDropdown";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "alltime" | "weekly" | "byevent";

// ─── Medal config ─────────────────────────────────────────────────────────────

const MEDALS = [
  { bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-600", label: "🥇" },
  { bg: "bg-gray-50",   border: "border-gray-300",   text: "text-gray-500",   label: "🥈" },
  { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-500", label: "🥉" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Initials({ name, size = 9 }: { name: string | null; size?: number }) {
  const letters = (name ?? "?")
    .split(" ")
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
  const sizeClass = size === 9 ? "w-9 h-9 text-sm" : "w-11 h-11 text-base";
  return (
    <div
      className={`${sizeClass} rounded-full gradient-btn flex items-center justify-center text-white font-bold shrink-0`}
    >
      {letters || "?"}
    </div>
  );
}

function LeagueBadge({ league }: { league: string }) {
  const cfg = getLeagueConfig(league);
  return (
    <span
      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${cfg.bgClass} ${cfg.textClass} ${cfg.borderClass}`}
    >
      {cfg.emoji} {cfg.name}
    </span>
  );
}

function LevelBadge({ level }: { level: number }) {
  return (
    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100">
      Lv.{level}
    </span>
  );
}

// ─── Row component ────────────────────────────────────────────────────────────

function LeaderboardRow({
  rank,
  entry,
  isCurrentUser,
  metric,
}: {
  rank: number;
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
  metric: string;
}) {
  const medal = rank <= 3 ? MEDALS[rank - 1] : null;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
        isCurrentUser
          ? "bg-blue-50 border border-blue-100"
          : medal
          ? `${medal.bg} border ${medal.border}`
          : "bg-white border border-gray-50 hover:bg-gray-50"
      }`}
    >
      {/* Rank */}
      <div className="w-7 text-center shrink-0">
        {medal ? (
          <span className="text-xl leading-none">{medal.label}</span>
        ) : (
          <span className="text-sm font-bold text-gray-400">#{rank}</span>
        )}
      </div>

      {/* Avatar */}
      <Initials name={entry.display_name} />

      {/* Name + badges */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-semibold text-gray-900 truncate">
            {entry.display_name ?? "Anonymous"}
          </span>
          {isCurrentUser && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600">
              You
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <LevelBadge level={entry.level} />
          <LeagueBadge league={entry.league} />
        </div>
      </div>

      {/* Metric */}
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-gray-900">{metric}</p>
      </div>
    </div>
  );
}

// ─── Podium (top 3) ───────────────────────────────────────────────────────────

function Podium({
  top3,
  userId,
  metricFn,
}: {
  top3: LeaderboardEntry[];
  userId: string;
  metricFn: (e: LeaderboardEntry) => string;
}) {
  const order = [1, 0, 2]; // silver (2nd) left, gold (1st) center, bronze (3rd) right
  const heights = ["h-20", "h-28", "h-16"];
  const medalEmojis = ["🥇", "🥈", "🥉"];

  return (
    <div className="flex items-end justify-center gap-2 mb-6 px-4">
      {order.map((idx, col) => {
        const entry = top3[idx];
        if (!entry) return <div key={col} className="flex-1" />;
        const isCurrentUser = entry.user_id === userId;
        const isGold = idx === 0;

        return (
          <div key={col} className="flex-1 flex flex-col items-center gap-2 max-w-[120px]">
            {/* Avatar */}
            <div className={`relative ${isGold ? "scale-110" : ""}`}>
              <Initials name={entry.display_name} size={isGold ? 11 : 9} />
              <span className="absolute -top-2 -right-1 text-base leading-none">
                {medalEmojis[idx]}
              </span>
            </div>
            {/* Name */}
            <div className="text-center">
              <p className={`text-xs font-semibold truncate max-w-[90px] ${isCurrentUser ? "text-blue-600" : "text-gray-800"}`}>
                {entry.display_name ?? "Anonymous"}
                {isCurrentUser && " (you)"}
              </p>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                {metricFn(entry)}
              </p>
            </div>
            {/* Podium block */}
            <div
              className={`w-full rounded-t-xl flex items-center justify-center font-black text-white text-lg ${heights[col]} ${
                idx === 0
                  ? "bg-gradient-to-b from-yellow-400 to-amber-500"
                  : idx === 1
                  ? "bg-gradient-to-b from-gray-300 to-gray-400"
                  : "bg-gradient-to-b from-amber-600 to-amber-700"
              }`}
            >
              {idx + 1}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; eventId?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { tab: rawTab = "alltime", eventId } = await searchParams;
  const tab: Tab =
    rawTab === "weekly" || rawTab === "byevent" ? rawTab : "alltime";

  // Load current user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, total_xp, level, avatar_url, league")
    .eq("id", user.id)
    .single();

  // Load user's events (for By Event dropdown)
  const { data: userEventRows } = await supabase
    .from("user_events")
    .select("event_id, events(id, name)")
    .eq("user_id", user.id);

  type UserEventRow = { event_id: string; events: { id: string; name: string } };
  const userEvents = ((userEventRows ?? []) as unknown as UserEventRow[]).map(
    (r) => r.events
  );

  // ── Fetch leaderboard data ────────────────────────────────────────────────
  const weekStart = getWeekStart();

  let entries: LeaderboardEntry[] = [];
  if (tab === "alltime") {
    entries = await getAllTimeLeaderboard();
  } else if (tab === "weekly") {
    entries = await getWeeklyLeaderboard(weekStart.toISOString());
  } else if (tab === "byevent" && eventId) {
    entries = await getEventMasteryLeaderboard(eventId);
  }

  // ── Current user rank ────────────────────────────────────────────────────
  const userIdx = entries.findIndex((e) => e.user_id === user.id);
  const userInTopResults = userIdx !== -1;
  let userRank = userIdx + 1;
  let userEntry: LeaderboardEntry | null = null;

  if (!userInTopResults) {
    // Fetch user's entry and compute rank separately
    if (tab === "alltime") {
      const [{ count }, { data: profileRow }] = await Promise.all([
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gt("total_xp", profile?.total_xp ?? 0),
        supabase
          .from("profiles")
          .select("id, display_name, level, avatar_url, league, total_xp")
          .eq("id", user.id)
          .single(),
      ]);
      userRank = (count ?? 0) + 1;
      if (profileRow) {
        userEntry = {
          user_id: user.id,
          display_name: profileRow.display_name,
          level: profileRow.level,
          avatar_url: profileRow.avatar_url,
          league: profileRow.league ?? "Bronze",
          total_xp: profileRow.total_xp,
        };
      }
    } else if (tab === "weekly") {
      const { data: weeklyRows } = await supabase
        .from("xp_log")
        .select("amount")
        .eq("user_id", user.id)
        .gte("created_at", weekStart.toISOString());
      const userWeeklyXp = (weeklyRows ?? []).reduce(
        (s: number, r: { amount: number }) => s + r.amount,
        0
      );
      const userAbove = entries.filter(
        (e) => (e.weekly_xp ?? 0) > userWeeklyXp
      ).length;
      userRank = userAbove + 1;
      if (profile) {
        userEntry = {
          user_id: user.id,
          display_name: profile.display_name,
          level: profile.level,
          avatar_url: profile.avatar_url,
          league: profile.league ?? "Bronze",
          weekly_xp: userWeeklyXp,
        };
      }
    } else if (tab === "byevent" && eventId) {
      // User has no cards for this event or isn't ranked
      if (profile) {
        userEntry = {
          user_id: user.id,
          display_name: profile.display_name,
          level: profile.level,
          avatar_url: profile.avatar_url,
          league: profile.league ?? "Bronze",
          mastery_pct: 0,
        };
        userRank = entries.length + 1;
      }
    }
  }

  const displayEntries = entries.slice(0, 20);
  const top3 = entries.slice(0, 3);

  function metricFn(e: LeaderboardEntry): string {
    if (tab === "weekly") return `${e.weekly_xp ?? 0} XP`;
    if (tab === "byevent") return `${e.mastery_pct ?? 0}%`;
    return `${e.total_xp ?? 0} XP`;
  }

  // ── League banner data ───────────────────────────────────────────────────
  const leagueProgress = getLeagueProgress(profile?.total_xp ?? 0);

  // ── Tab href helpers ──────────────────────────────────────────────────────
  const tabHref = (t: Tab) =>
    t === "byevent" && eventId
      ? `/dashboard/leaderboard?tab=byevent&eventId=${eventId}`
      : `/dashboard/leaderboard?tab=${t}`;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center gap-2">
        <Trophy size={20} className="text-yellow-500" />
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Leaderboard
        </h1>
      </div>

      {/* ── League banner ── */}
      <div
        className={`rounded-2xl border p-4 ${leagueProgress.league.bgClass} ${leagueProgress.league.borderClass}`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl leading-none">
              {leagueProgress.league.emoji}
            </span>
            <div>
              <p className={`text-sm font-bold ${leagueProgress.league.textClass}`}>
                {leagueProgress.league.name} League
              </p>
              {leagueProgress.nextLeague ? (
                <p className="text-xs text-gray-500">
                  {leagueProgress.xpToNext?.toLocaleString()} XP to{" "}
                  {leagueProgress.nextLeague.emoji}{" "}
                  {leagueProgress.nextLeague.name}
                </p>
              ) : (
                <p className="text-xs text-gray-500">Max league reached!</p>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-400 mb-1">
              {leagueProgress.progress}% to next
            </p>
          </div>
        </div>
        {leagueProgress.nextLeague && (
          <div className="mt-3 h-2 bg-white/60 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${leagueProgress.league.gradientClass} transition-all duration-700`}
              style={{ width: `${leagueProgress.progress}%` }}
            />
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {(["alltime", "weekly", "byevent"] as const).map((t) => (
          <Link
            key={t}
            href={tabHref(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              tab === t
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "alltime" ? "All Time" : t === "weekly" ? "Weekly" : "By Event"}
          </Link>
        ))}
      </div>

      {/* ── By Event dropdown ── */}
      {tab === "byevent" && (
        <div>
          <EventDropdown events={userEvents} currentEventId={eventId} />
        </div>
      )}

      {/* ── Empty state for By Event with no event selected ── */}
      {tab === "byevent" && !eventId && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <p className="text-gray-400 text-sm">
            Select an event above to see the mastery leaderboard.
          </p>
        </div>
      )}

      {/* ── Leaderboard ── */}
      {(tab !== "byevent" || eventId) && (
        <>
          {/* Podium */}
          {top3.length >= 2 && (
            <Podium top3={top3} userId={user.id} metricFn={metricFn} />
          )}

          {/* Ranked list (#4 onwards) */}
          {displayEntries.length > 0 ? (
            <div className="space-y-2">
              {displayEntries.slice(3).map((entry, i) => (
                <LeaderboardRow
                  key={entry.user_id}
                  rank={i + 4}
                  entry={entry}
                  isCurrentUser={entry.user_id === user.id}
                  metric={metricFn(entry)}
                />
              ))}

              {/* Show user row if outside top 20 */}
              {!userInTopResults && userEntry && (
                <>
                  <div className="flex items-center gap-2 py-1 px-4">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400">•••</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                  <LeaderboardRow
                    rank={userRank}
                    entry={userEntry}
                    isCurrentUser
                    metric={metricFn(userEntry)}
                  />
                </>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <p className="text-gray-400 text-sm">
                {tab === "weekly"
                  ? "No XP earned this week yet. Start studying!"
                  : "No data available yet."}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
