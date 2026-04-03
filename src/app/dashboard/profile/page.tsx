import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, ClipboardCheck, Flame, Target, Users, Award } from "lucide-react";
import { createClient } from "@/lib/supabase-server";
import { calcCardXp, calcTestXp } from "@/lib/xp-rules";
import { timeAgo } from "@/lib/time";
import ProfileHeader from "@/components/app/ProfileHeader";
import ActivityHeatmap from "@/components/app/ActivityHeatmap";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BADGE_EMOJI: Record<string, string> = {
  Footprints: "👣", Flame: "🔥", Hash: "#", Star: "⭐",
  Trophy: "🏆", Zap: "⚡", Award: "🏅",
};

function badgeEmoji(icon: string | null) {
  return BADGE_EMOJI[icon ?? "Award"] ?? "🏅";
}

type ReviewRow  = { quality: number; reviewed_at: string; cards: { front: string; events: { name: string; color: string } } | null };
type TestRow    = { score: number; total_questions: number; completed_at: string; events: { name: string; color: string } | null };
type BadgeRow   = { id: string; name: string; icon: string | null };
type EarnedRow  = { badge_id: string; earned_at: string };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const twelveWeeksAgo = new Date();
  twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);
  const twelveWeeksAgoIso = twelveWeeksAgo.toISOString();

  // ── Parallel data fetches ──────────────────────────────────────────────────
  const [
    { data: profile },
    { count: totalReviewCount },
    { data: heatmapReviews },
    { data: heatmapTests },
    { data: allTests },
    { count: eventCount },
    { count: earnedCount },
    { count: totalBadgeCount },
    { data: earnedRows },
    { data: allBadges },
    { data: recentReviewsRaw },
    { data: recentTestsRaw },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("reviews").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("reviews").select("reviewed_at").eq("user_id", user.id).gte("reviewed_at", twelveWeeksAgoIso),
    supabase.from("practice_tests").select("completed_at").eq("user_id", user.id).gte("completed_at", twelveWeeksAgoIso),
    supabase.from("practice_tests").select("score, total_questions").eq("user_id", user.id),
    supabase.from("user_events").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("user_badges").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("badges").select("*", { count: "exact", head: true }),
    supabase.from("user_badges").select("badge_id, earned_at").eq("user_id", user.id).order("earned_at", { ascending: false }).limit(8),
    supabase.from("badges").select("id, name, icon"),
    supabase.from("reviews").select("quality, reviewed_at, cards(front, events(name, color))").eq("user_id", user.id).order("reviewed_at", { ascending: false }).limit(10),
    supabase.from("practice_tests").select("score, total_questions, completed_at, events(name, color)").eq("user_id", user.id).order("completed_at", { ascending: false }).limit(10),
  ]);

  if (!profile) redirect("/login");

  // ── Derived stats ──────────────────────────────────────────────────────────
  const tests = (allTests ?? []) as { score: number; total_questions: number }[];
  const avgScore = tests.length
    ? Math.round(tests.reduce((s, t) => s + t.score / (t.total_questions || 1), 0) / tests.length * 100)
    : 0;

  // ── Activity heatmap data ─────────────────────────────────────────────────
  const activityByDate: Record<string, number> = {};
  for (const r of heatmapReviews ?? []) {
    const d = (r as { reviewed_at: string }).reviewed_at.slice(0, 10);
    activityByDate[d] = (activityByDate[d] ?? 0) + 1;
  }
  for (const t of heatmapTests ?? []) {
    const d = (t as { completed_at: string }).completed_at.slice(0, 10);
    activityByDate[d] = (activityByDate[d] ?? 0) + 1;
  }

  // ── Badge showcase ─────────────────────────────────────────────────────────
  const badgeMap = new Map((allBadges ?? []).map((b: BadgeRow) => [b.id, b]));
  const earnedBadgeList = (earnedRows ?? []).map((e: EarnedRow) => ({
    ...(badgeMap.get(e.badge_id) ?? { id: e.badge_id, name: "Badge", icon: null }),
    earned_at: e.earned_at,
  }));

  // ── Recent activity feed ───────────────────────────────────────────────────
  type ActivityItem =
    | { kind: "review"; label: string; sub: string; time: string; xp: number; color: string }
    | { kind: "test"; label: string; sub: string; time: string; xp: number; color: string };

  const recentReviews = (recentReviewsRaw ?? []) as unknown as ReviewRow[];
  const recentTests   = (recentTestsRaw  ?? []) as unknown as TestRow[];

  const activity: ActivityItem[] = [
    ...recentReviews.map((r) => ({
      kind: "review" as const,
      label: r.cards?.front?.slice(0, 60) ?? "Flashcard",
      sub: r.cards?.events?.name ?? "HOSA Event",
      time: r.reviewed_at,
      xp: calcCardXp(r.quality),
      color: r.cards?.events?.color ?? "#3B82F6",
    })),
    ...recentTests.map((t) => ({
      kind: "test" as const,
      label: t.events?.name ?? "Practice Test",
      sub: `${t.score}/${t.total_questions} correct (${Math.round(t.score / (t.total_questions || 1) * 100)}%)`,
      time: t.completed_at,
      xp: calcTestXp(t.score, t.total_questions),
      color: t.events?.color ?? "#8B5CF6",
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 pb-6">
      {/* ── Profile header ── */}
      <ProfileHeader
        userId={user.id}
        displayName={profile.display_name}
        avatarUrl={profile.avatar_url}
        totalXp={profile.total_xp}
        level={profile.level}
        league={profile.league ?? "Bronze"}
        memberSince={profile.created_at}
      />

      {/* ── Stats grid ── */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Stats</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <StatCard icon={<BookOpen size={16} className="text-blue-500" />} bg="bg-blue-50"
            value={(totalReviewCount ?? 0).toLocaleString()} label="Cards Reviewed" />
          <StatCard icon={<ClipboardCheck size={16} className="text-purple-500" />} bg="bg-purple-50"
            value={tests.length.toLocaleString()} label="Tests Completed" />
          <StatCard icon={<Flame size={16} className="text-orange-500" />} bg="bg-orange-50"
            value={`${profile.current_streak}d`} label="Current Streak"
            sub={`Best: ${profile.longest_streak}d`} />
          <StatCard icon={<Target size={16} className="text-emerald-500" />} bg="bg-emerald-50"
            value={`${avgScore}%`} label="Avg Test Score"
            sub={tests.length === 0 ? "No tests yet" : `${tests.length} total`} />
          <StatCard icon={<Users size={16} className="text-cyan-500" />} bg="bg-cyan-50"
            value={(eventCount ?? 0).toString()} label="Events Studying" />
          <StatCard icon={<Award size={16} className="text-yellow-500" />} bg="bg-yellow-50"
            value={`${earnedCount ?? 0} / ${totalBadgeCount ?? 0}`} label="Badges Earned" />
        </div>
      </section>

      {/* ── Activity heatmap ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">Study Activity</h2>
          <span className="text-xs text-gray-400">Past 12 weeks</span>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <ActivityHeatmap activityByDate={activityByDate} />
        </div>
      </section>

      {/* ── Badges showcase ── */}
      {earnedBadgeList.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">Earned Badges</h2>
            <Link href="/dashboard/badges" className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors">
              View All →
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {earnedBadgeList.map((b) => (
              <div key={b.id} className="shrink-0 flex flex-col items-center gap-1.5 bg-white rounded-2xl border border-yellow-100 p-3 min-w-[72px] shadow-sm">
                <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center text-2xl">
                  {badgeEmoji(b.icon)}
                </div>
                <span className="text-[10px] text-gray-600 font-medium text-center leading-tight max-w-[64px]">{b.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Recent activity ── */}
      {activity.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">Recent Activity</h2>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
            {activity.map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${item.color}18` }}>
                  {item.kind === "review"
                    ? <BookOpen size={14} style={{ color: item.color }} />
                    : <ClipboardCheck size={14} style={{ color: item.color }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.label}</p>
                  <p className="text-xs text-gray-400 truncate">{item.sub}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-medium text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full">
                    +{item.xp} XP
                  </span>
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

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ icon, bg, value, label, sub }: {
  icon: React.ReactNode; bg: string; value: string; label: string; sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
        {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}
