import type { SupabaseClient } from "@supabase/supabase-js";
import { XP_PER_BADGE } from "./xp-rules";

export type AwardedBadge = {
  id: string;
  name: string;
  icon: string;
  description: string;
};

type BadgeRow = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  requirement_type: string;
  requirement_value: number;
};

export type UserStats = {
  totalReviews: number;
  currentStreak: number;
  totalXp: number;
  hasPerfectTest: boolean;
  maxEventMasteryPct: number;
  eventsAt90PctCount: number;
};

export async function gatherStats(
  supabase: SupabaseClient,
  userId: string
): Promise<UserStats> {
  const [
    { count: reviewCount },
    { data: profile },
    { data: perfectTests },
    { data: userCards },
    { data: userEventRows },
  ] = await Promise.all([
    supabase.from("reviews").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("profiles").select("current_streak, total_xp").eq("id", userId).single(),
    supabase.from("practice_tests").select("score, total_questions").eq("user_id", userId),
    supabase.from("user_cards").select("ease_factor, cards(event_id)").eq("user_id", userId),
    supabase.from("user_events").select("event_id").eq("user_id", userId),
  ]);

  const hasPerfectTest = (perfectTests ?? []).some(
    (t: { score: number; total_questions: number }) => t.score === t.total_questions
  );

  const eventIds = (userEventRows ?? []).map((r: { event_id: string }) => r.event_id);
  const byEvent: Record<string, { total: number; mastered: number }> = {};
  for (const eid of eventIds) byEvent[eid] = { total: 0, mastered: 0 };

  for (const uc of userCards ?? []) {
    const eid = (uc.cards as unknown as { event_id: string } | null)?.event_id;
    if (!eid || !byEvent[eid]) continue;
    byEvent[eid].total++;
    if (uc.ease_factor >= 3.0) byEvent[eid].mastered++;
  }

  const masteryPcts = Object.values(byEvent).map(({ total, mastered }) =>
    total > 0 ? (mastered / total) * 100 : 0
  );

  return {
    totalReviews: reviewCount ?? 0,
    currentStreak: profile?.current_streak ?? 0,
    totalXp: profile?.total_xp ?? 0,
    hasPerfectTest,
    maxEventMasteryPct: masteryPcts.length ? Math.max(...masteryPcts) : 0,
    eventsAt90PctCount: masteryPcts.filter((p) => p >= 90).length,
  };
}

function qualifies(badge: BadgeRow, stats: UserStats): boolean {
  switch (badge.requirement_type) {
    case "cards": return stats.totalReviews >= badge.requirement_value;
    case "streak": return stats.currentStreak >= badge.requirement_value;
    case "xp": return stats.totalXp >= badge.requirement_value;
    case "tests": return badge.requirement_value === 100 ? stats.hasPerfectTest : false;
    case "mastery":
      return badge.requirement_value <= 10
        ? stats.eventsAt90PctCount >= badge.requirement_value
        : stats.maxEventMasteryPct >= badge.requirement_value;
    default: return false;
  }
}

export async function checkAndAwardBadges(
  supabase: SupabaseClient,
  userId: string
): Promise<AwardedBadge[]> {
  const [{ data: allBadges }, { data: earnedRows }] = await Promise.all([
    supabase.from("badges").select("*"),
    supabase.from("user_badges").select("badge_id").eq("user_id", userId),
  ]);

  if (!allBadges) return [];

  const earnedIds = new Set((earnedRows ?? []).map((r: { badge_id: string }) => r.badge_id));
  const unearned = (allBadges as BadgeRow[]).filter((b) => !earnedIds.has(b.id));
  if (!unearned.length) return [];

  const stats = await gatherStats(supabase, userId);
  const newlyEarned = unearned.filter((b) => qualifies(b, stats));
  if (!newlyEarned.length) return [];

  const totalBonusXp = newlyEarned.length * XP_PER_BADGE;
  await Promise.all([
    supabase.from("user_badges").insert(newlyEarned.map((b) => ({ user_id: userId, badge_id: b.id }))),
    supabase.from("profiles").update({ total_xp: stats.totalXp + totalBonusXp }).eq("id", userId),
    supabase.from("xp_log").insert(
      newlyEarned.map((b) => ({
        user_id: userId,
        amount: XP_PER_BADGE,
        source: "badge_earned" as const,
        details: { badge_id: b.id, badge_name: b.name },
      }))
    ),
  ]).catch(console.error);

  return newlyEarned.map((b) => ({
    id: b.id,
    name: b.name,
    icon: b.icon ?? "Award",
    description: b.description ?? "",
  }));
}

export function getBadgeProgress(badge: BadgeRow, stats: UserStats): number {
  switch (badge.requirement_type) {
    case "cards": return Math.min(100, Math.round((stats.totalReviews / badge.requirement_value) * 100));
    case "streak": return Math.min(100, Math.round((stats.currentStreak / badge.requirement_value) * 100));
    case "xp": return Math.min(100, Math.round((stats.totalXp / badge.requirement_value) * 100));
    case "tests": return stats.hasPerfectTest ? 100 : 0;
    case "mastery":
      return badge.requirement_value <= 10
        ? Math.min(100, Math.round((stats.eventsAt90PctCount / badge.requirement_value) * 100))
        : Math.min(100, Math.round((stats.maxEventMasteryPct / badge.requirement_value) * 100));
    default: return 0;
  }
}

export function getBadgeProgressLabel(badge: BadgeRow, stats: UserStats): string {
  switch (badge.requirement_type) {
    case "cards": return `${Math.min(stats.totalReviews, badge.requirement_value)} / ${badge.requirement_value} cards reviewed`;
    case "streak": return `${Math.min(stats.currentStreak, badge.requirement_value)} / ${badge.requirement_value} day streak`;
    case "xp": return `${Math.min(stats.totalXp, badge.requirement_value)} / ${badge.requirement_value} XP`;
    case "tests": return stats.hasPerfectTest ? "Achieved!" : "Score 100% on any practice test";
    case "mastery":
      return badge.requirement_value <= 10
        ? `${stats.eventsAt90PctCount} / ${badge.requirement_value} events mastered`
        : `${Math.round(stats.maxEventMasteryPct)}% / ${badge.requirement_value}% max mastery`;
    default: return "";
  }
}
