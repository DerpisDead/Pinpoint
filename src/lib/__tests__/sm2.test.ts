import { describe, it, expect } from "vitest";
import { sm2 } from "../sm2";

describe("SM-2 Algorithm", () => {
  // ── Quality 5: perfect response on a fresh card ──────────────────────────
  it("quality 5 on fresh card: interval=1, repetitions=1, easeFactor increases", () => {
    const result = sm2(5, 0, 2.5, 0);
    expect(result.interval).toBe(1);
    expect(result.repetitions).toBe(1);
    // EF = 2.5 + (0.1 - 0 * (0.08 + 0 * 0.02)) = 2.5 + 0.1 = 2.6
    expect(result.easeFactor).toBeCloseTo(2.6, 2);
  });

  // ── Quality 5: second repetition ─────────────────────────────────────────
  it("quality 5 on second repetition: interval=6", () => {
    const result = sm2(5, 1, 2.6, 1);
    expect(result.interval).toBe(6);
    expect(result.repetitions).toBe(2);
    expect(result.easeFactor).toBeCloseTo(2.7, 2);
  });

  // ── Quality 5: third repetition uses EF multiplier ───────────────────────
  it("quality 5 on third repetition: interval = ceil(6 * 2.7)", () => {
    const result = sm2(5, 2, 2.7, 6);
    expect(result.interval).toBe(Math.ceil(6 * 2.7)); // 17
    expect(result.repetitions).toBe(3);
    expect(result.easeFactor).toBeCloseTo(2.8, 2);
  });

  // ── Quality 4: "Good" response ───────────────────────────────────────────
  it("quality 4 on fresh card: interval=1, repetitions=1", () => {
    const result = sm2(4, 0, 2.5, 0);
    expect(result.interval).toBe(1);
    expect(result.repetitions).toBe(1);
    // EF = 2.5 + (0.1 - 1*(0.08 + 1*0.02)) = 2.5 + (0.1 - 0.1) = 2.5
    expect(result.easeFactor).toBeCloseTo(2.5, 2);
  });

  // ── Quality 3: "Hard" — correct but struggled ────────────────────────────
  it("quality 3: correct, repetitions increments, EF decreases", () => {
    const result = sm2(3, 0, 2.5, 0);
    expect(result.interval).toBe(1);
    expect(result.repetitions).toBe(1);
    // EF = 2.5 + (0.1 - 2*(0.08 + 2*0.02)) = 2.5 + (0.1 - 0.24) = 2.36
    expect(result.easeFactor).toBeCloseTo(2.36, 2);
  });

  // ── Quality 0: complete blackout — resets card ───────────────────────────
  it("quality 0: resets repetitions to 0 and interval to 1", () => {
    // Card that had been well-learned before
    const result = sm2(0, 5, 2.8, 60);
    expect(result.interval).toBe(1);
    expect(result.repetitions).toBe(0);
    // EF = 2.8 + (0.1 - 5*(0.08 + 5*0.02)) = 2.8 + (0.1 - 0.9) = 2.0
    expect(result.easeFactor).toBeCloseTo(2.0, 2);
  });

  // ── Ease factor floor at 1.3 ─────────────────────────────────────────────
  it("ease factor is clamped to minimum 1.3", () => {
    // After many quality-0 responses, EF should not drop below 1.3
    let ef = 1.4;
    let reps = 0;
    let interval = 1;
    for (let i = 0; i < 10; i++) {
      const r = sm2(0, reps, ef, interval);
      ef = r.easeFactor;
      reps = r.repetitions;
      interval = r.interval;
    }
    expect(ef).toBeGreaterThanOrEqual(1.3);
  });

  it("ease factor clamps to 1.3 in a single step if it would go below", () => {
    // EF of 1.31 with quality 0: 1.31 + (0.1 - 0.9) = 0.51 → clamped to 1.3
    const result = sm2(0, 0, 1.31, 1);
    expect(result.easeFactor).toBe(1.3);
  });

  // ── Multiple consecutive correct reviews ─────────────────────────────────
  it("four consecutive quality-5 reviews produces increasing intervals", () => {
    let { interval, repetitions, easeFactor } = sm2(5, 0, 2.5, 0);
    expect(interval).toBe(1);

    ({ interval, repetitions, easeFactor } = sm2(5, repetitions, easeFactor, interval));
    expect(interval).toBe(6);

    ({ interval, repetitions, easeFactor } = sm2(5, repetitions, easeFactor, interval));
    expect(interval).toBeGreaterThan(6); // 6 * ~2.7

    const prevInterval = interval;
    ({ interval, repetitions, easeFactor } = sm2(5, repetitions, easeFactor, interval));
    expect(interval).toBeGreaterThan(prevInterval);
  });

  // ── Quality 2: incorrect, EF still adjusts ───────────────────────────────
  it("quality 2 is treated as incorrect (resets), but EF still adjusts", () => {
    const result = sm2(2, 3, 2.5, 15);
    expect(result.interval).toBe(1);
    expect(result.repetitions).toBe(0);
    // EF = 2.5 + (0.1 - 3*(0.08 + 3*0.02)) = 2.5 + (0.1 - 0.42) = 2.18
    expect(result.easeFactor).toBeCloseTo(2.18, 2);
  });
});
