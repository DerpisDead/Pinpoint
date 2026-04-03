export type LevelInfo = {
  level: number;
  currentLevelXp: number;
  xpForNextLevel: number;
  progress: number;
};

function xpAtLevelStart(level: number): number {
  return ((level - 1) * level) / 2 * 100;
}

export function getLevel(totalXp: number): LevelInfo {
  if (totalXp < 0) totalXp = 0;
  let level = 1;
  while (totalXp >= xpAtLevelStart(level + 1)) level++;
  const levelStart = xpAtLevelStart(level);
  const xpForNextLevel = level * 100;
  const currentLevelXp = totalXp - levelStart;
  const progress = Math.min(100, Math.round((currentLevelXp / xpForNextLevel) * 100));
  return { level, currentLevelXp, xpForNextLevel, progress };
}

export function didLevelUp(oldXp: number, newXp: number): boolean {
  return getLevel(newXp).level > getLevel(oldXp).level;
}
