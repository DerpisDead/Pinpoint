import { redirect } from "next/navigation";
import { Lock, Award } from "lucide-react";
import { createClient } from "@/lib/supabase-server";
import { gatherStats, getBadgeProgress, getBadgeProgressLabel } from "@/lib/badges";
import { timeAgo } from "@/lib/time";

const LUCIDE_EMOJI: Record<string, string> = {
  Footprints: "👣", Flame: "🔥", Hash: "#", Star: "⭐",
  Trophy: "🏆", Zap: "⚡", Award: "🏅",
};

function BadgeEmoji({ icon }: { icon: string | null }) {
  const emoji = LUCIDE_EMOJI[icon ?? "Award"] ?? "🏅";
  return <span className="text-3xl leading-none">{emoji}</span>;
}

export default async function BadgesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: allBadges }, { data: earnedRows }, stats] = await Promise.all([
    supabase.from("badges").select("*").order("requirement_value"),
    supabase.from("user_badges").select("badge_id, earned_at").eq("user_id", user.id),
    gatherStats(supabase, user.id),
  ]);

  const earnedMap = new Map(
    (earnedRows ?? []).map((r: { badge_id: string; earned_at: string }) => [r.badge_id, r.earned_at])
  );

  const badges = (allBadges ?? []) as {
    id: string; name: string; description: string | null;
    icon: string | null; requirement_type: string; requirement_value: number;
  }[];

  const earnedCount = badges.filter((b) => earnedMap.has(b.id)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Award size={20} className="text-yellow-500" />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Badges</h1>
        </div>
        <p className="text-gray-500 text-sm">
          {earnedCount} of {badges.length} earned
        </p>
        {/* Overall progress bar */}
        <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden max-w-xs">
          <div
            className="h-full rounded-full gradient-btn transition-all duration-700"
            style={{ width: `${badges.length ? (earnedCount / badges.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Badges grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge) => {
          const isEarned = earnedMap.has(badge.id);
          const earnedAt = earnedMap.get(badge.id);
          const progress = getBadgeProgress(badge, stats);
          const progressLabel = getBadgeProgressLabel(badge, stats);

          return (
            <div
              key={badge.id}
              className={`relative rounded-2xl border p-5 transition-all duration-200 ${
                isEarned
                  ? "bg-white border-yellow-200 shadow-sm badge-earned"
                  : "bg-gray-50 border-gray-100"
              }`}
            >
              {/* Gold shimmer overlay for earned badges */}
              {isEarned && (
                <div className="absolute inset-0 rounded-2xl badge-shimmer pointer-events-none" />
              )}

              {/* Lock icon overlay for unearned */}
              {!isEarned && (
                <div className="absolute top-3 right-3">
                  <Lock size={13} className="text-gray-300" />
                </div>
              )}

              <div className="relative z-10">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                  isEarned ? "bg-yellow-50 border border-yellow-100" : "bg-gray-100"
                }`}>
                  <span className={isEarned ? "" : "grayscale opacity-40"}>
                    <BadgeEmoji icon={badge.icon} />
                  </span>
                </div>

                {/* Name & description */}
                <h3 className={`font-semibold text-sm mb-1 ${isEarned ? "text-gray-900" : "text-gray-400"}`}>
                  {badge.name}
                </h3>
                <p className={`text-xs leading-relaxed mb-3 ${isEarned ? "text-gray-500" : "text-gray-400"}`}>
                  {badge.description}
                </p>

                {/* Progress bar */}
                {!isEarned && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-gray-400">{progressLabel}</span>
                      <span className="text-[10px] font-semibold text-gray-400">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#1C3F6E] transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Earned date */}
                {isEarned && earnedAt && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] font-semibold text-yellow-600 uppercase tracking-wide">
                      ✓ Earned
                    </span>
                    <span className="text-[10px] text-gray-400">{timeAgo(earnedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
