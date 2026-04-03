import type { SupabaseClient } from "@supabase/supabase-js";

function toDateString(date: Date): string {
  // Use local date to avoid UTC day-boundary issues
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

type StreakProfile = {
  current_streak: number;
  longest_streak: number;
  streak_last_date: string | null;
};

type StreakResult = {
  current_streak: number;
  longest_streak: number;
  updated: boolean;
};

/**
 * Checks the user's streak against today's date and updates the DB if needed.
 * Call at the start of every study session.
 */
export async function checkAndUpdateStreak(
  supabase: SupabaseClient,
  userId: string,
  profile: StreakProfile
): Promise<StreakResult> {
  const today = toDateString(new Date());
  const yesterday = toDateString(new Date(Date.now() - 86_400_000));
  const lastDate = profile.streak_last_date;

  // Already counted today — no change needed
  if (lastDate === today) {
    return {
      current_streak: profile.current_streak,
      longest_streak: profile.longest_streak,
      updated: false,
    };
  }

  let newStreak: number;
  if (lastDate === yesterday) {
    // Continuing streak
    newStreak = profile.current_streak + 1;
  } else {
    // Streak broken (or first ever session)
    newStreak = 1;
  }

  const newLongest = Math.max(newStreak, profile.longest_streak);

  await supabase
    .from("profiles")
    .update({
      current_streak: newStreak,
      longest_streak: newLongest,
      streak_last_date: today,
    })
    .eq("id", userId);

  return {
    current_streak: newStreak,
    longest_streak: newLongest,
    updated: true,
  };
}
