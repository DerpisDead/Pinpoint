export const XP_CARD_BASE = 5;
export const XP_CARD_CORRECT_BONUS = 5;
export const XP_CARD_PERFECT_BONUS = 5;
export const XP_CARD_RECOVERY_BONUS = 10;
export const XP_SESSION_COMPLETE_BONUS = 25;
export const XP_TEST_BASE = 50;
export const XP_TEST_GOOD_BONUS = 25;
export const XP_TEST_PERFECT_BONUS = 50;
export const XP_STREAK_7_DAYS = 100;
export const XP_STREAK_30_DAYS = 500;
export const XP_PER_BADGE = 50;

export function calcCardXp(quality: number, wasFailedBefore = false): number {
  let xp = XP_CARD_BASE;
  if (quality >= 3) xp += XP_CARD_CORRECT_BONUS;
  if (quality === 5) xp += XP_CARD_PERFECT_BONUS;
  if (quality >= 3 && wasFailedBefore) xp += XP_CARD_RECOVERY_BONUS;
  return xp;
}

export function calcTestXp(score: number, total: number): number {
  const pct = total > 0 ? score / total : 0;
  let xp = XP_TEST_BASE;
  if (pct >= 0.8) xp += XP_TEST_GOOD_BONUS;
  if (score === total) xp += XP_TEST_PERFECT_BONUS;
  return xp;
}
