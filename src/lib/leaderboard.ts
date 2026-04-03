import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";

// Use a cookie-free client so these functions can be safely wrapped
// in unstable_cache (cookie-based clients can't be serialized).
// The RPCs use SECURITY DEFINER, so they bypass RLS server-side.
function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export type LeaderboardEntry = {
  user_id: string;
  display_name: string | null;
  level: number;
  avatar_url: string | null;
  league: string;
  total_xp?: number;
  weekly_xp?: number;
  mastery_pct?: number;
  mastered_cards?: number;
  total_cards?: number;
};

// Returns Monday 00:00:00 UTC of the current week
export function getWeekStart(): Date {
  const now = new Date();
  const day = now.getUTCDay(); // 0 = Sunday
  const daysToMonday = (day + 6) % 7;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - daysToMonday);
  monday.setUTCHours(0, 0, 0, 0);
  return monday;
}

export const getAllTimeLeaderboard = unstable_cache(
  async (): Promise<LeaderboardEntry[]> => {
    const supabase = getClient();
    const { data, error } = await supabase.rpc("get_alltime_leaderboard");
    if (error) {
      console.error("getAllTimeLeaderboard error:", error.message);
      return [];
    }
    return (data ?? []) as LeaderboardEntry[];
  },
  ["leaderboard-alltime"],
  { revalidate: 300, tags: ["leaderboard", "leaderboard-alltime"] }
);

export const getWeeklyLeaderboard = unstable_cache(
  async (weekStartIso: string): Promise<LeaderboardEntry[]> => {
    const supabase = getClient();
    const { data, error } = await supabase.rpc("get_weekly_leaderboard", {
      week_start: weekStartIso,
    });
    if (error) {
      console.error("getWeeklyLeaderboard error:", error.message);
      return [];
    }
    return (data ?? []) as LeaderboardEntry[];
  },
  ["leaderboard-weekly"],
  { revalidate: 300, tags: ["leaderboard", "leaderboard-weekly"] }
);

export const getEventMasteryLeaderboard = unstable_cache(
  async (eventId: string): Promise<LeaderboardEntry[]> => {
    const supabase = getClient();
    const { data, error } = await supabase.rpc(
      "get_event_mastery_leaderboard",
      { p_event_id: eventId }
    );
    if (error) {
      console.error("getEventMasteryLeaderboard error:", error.message);
      return [];
    }
    return (data ?? []) as LeaderboardEntry[];
  },
  ["leaderboard-event"],
  { revalidate: 300, tags: ["leaderboard", "leaderboard-event"] }
);
