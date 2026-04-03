/**
 * SM-2 Spaced Repetition Algorithm
 * Based on the original SuperMemo SM-2 algorithm.
 *
 * quality: 0-5 rating
 *   0 = complete blackout
 *   1 = incorrect, but remembered on seeing answer
 *   2 = incorrect, but easy to recall
 *   3 = correct, but required significant difficulty
 *   4 = correct, after a hesitation
 *   5 = perfect response
 */

export type Sm2Result = {
  interval: number;      // days until next review
  repetitions: number;   // consecutive correct repetitions
  easeFactor: number;    // difficulty factor (min 1.3)
};

export function sm2(
  quality: number,
  repetitions: number,
  easeFactor: number,
  interval: number
): Sm2Result {
  let newInterval = interval;
  let newRepetitions = repetitions;

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.ceil(interval * easeFactor);
    }
    newRepetitions = repetitions + 1;
  } else {
    // Incorrect response — reset
    newRepetitions = 0;
    newInterval = 1;
  }

  // Ease factor adjustment (applies regardless of correctness)
  const newEaseFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Clamp ease factor to minimum 1.3
  const clampedEaseFactor = Math.max(1.3, newEaseFactor);

  return {
    interval: newInterval,
    repetitions: newRepetitions,
    easeFactor: Math.round(clampedEaseFactor * 1000) / 1000, // 3 decimal places
  };
}

/** Format an interval in days to a human-readable string: "1d", "6d", "2w", "1mo" */
export function formatInterval(days: number): string {
  if (days <= 0) return "<1d";
  if (days === 1) return "1d";
  if (days < 14) return `${days}d`;
  if (days < 60) return `${Math.round(days / 7)}w`;
  return `${Math.round(days / 30)}mo`;
}
