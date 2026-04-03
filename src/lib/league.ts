export type League = "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";

export type LeagueConfig = {
  name: League;
  min: number;
  max: number | null;
  emoji: string;
  color: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
  gradientClass: string;
};

export const LEAGUE_CONFIG: readonly LeagueConfig[] = [
  {
    name: "Bronze",
    min: 0,
    max: 999,
    emoji: "🥉",
    color: "#CD7F32",
    textClass: "text-amber-700",
    bgClass: "bg-amber-50",
    borderClass: "border-amber-300",
    gradientClass: "from-amber-700 to-amber-500",
  },
  {
    name: "Silver",
    min: 1000,
    max: 4999,
    emoji: "🥈",
    color: "#9CA3AF",
    textClass: "text-gray-500",
    bgClass: "bg-gray-50",
    borderClass: "border-gray-300",
    gradientClass: "from-gray-400 to-gray-300",
  },
  {
    name: "Gold",
    min: 5000,
    max: 14999,
    emoji: "🥇",
    color: "#F59E0B",
    textClass: "text-amber-500",
    bgClass: "bg-amber-50",
    borderClass: "border-amber-300",
    gradientClass: "from-yellow-500 to-amber-400",
  },
  {
    name: "Platinum",
    min: 15000,
    max: 49999,
    emoji: "💎",
    color: "#06B6D4",
    textClass: "text-cyan-500",
    bgClass: "bg-cyan-50",
    borderClass: "border-cyan-300",
    gradientClass: "from-cyan-500 to-teal-400",
  },
  {
    name: "Diamond",
    min: 50000,
    max: null,
    emoji: "💠",
    color: "#6366F1",
    textClass: "text-indigo-500",
    bgClass: "bg-indigo-50",
    borderClass: "border-indigo-300",
    gradientClass: "from-indigo-500 to-blue-400",
  },
] as const;

export function getLeagueConfig(league: string): LeagueConfig {
  return LEAGUE_CONFIG.find((l) => l.name === league) ?? LEAGUE_CONFIG[0];
}

export function getLeagueFromXp(totalXp: number): LeagueConfig {
  for (let i = LEAGUE_CONFIG.length - 1; i >= 0; i--) {
    if (totalXp >= LEAGUE_CONFIG[i].min) return LEAGUE_CONFIG[i];
  }
  return LEAGUE_CONFIG[0];
}

export type LeagueProgress = {
  league: LeagueConfig;
  nextLeague: LeagueConfig | null;
  progress: number;
  xpToNext: number | null;
};

export function getLeagueProgress(totalXp: number): LeagueProgress {
  const league = getLeagueFromXp(totalXp);
  const idx = LEAGUE_CONFIG.findIndex((l) => l.name === league.name);
  const nextLeague =
    idx < LEAGUE_CONFIG.length - 1 ? LEAGUE_CONFIG[idx + 1] : null;

  if (!nextLeague) {
    return { league, nextLeague: null, progress: 100, xpToNext: null };
  }

  const rangeSize = nextLeague.min - league.min;
  const progress = Math.min(
    100,
    Math.round(((totalXp - league.min) / rangeSize) * 100)
  );
  const xpToNext = nextLeague.min - totalXp;

  return { league, nextLeague, progress, xpToNext };
}
