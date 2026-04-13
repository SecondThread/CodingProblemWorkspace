import type { GeneratedCase, ProblemGenerator } from "../../../../src/contracts/problem";
import solution from "../solution/solution";

function seededRandom(seed: number): () => number {
  let state: number = seed;
  return (): number => {
    state = (state * 1664525 + 1013904223) & 0xffffffff;
    return (state >>> 0) / 0x100000000;
  };
}

function randomInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/** Generate a random number string with exactly `k` digits. */
function genKDigitNumber(rng: () => number, k: number): string {
  if (k === 1) return String(randomInt(rng, 1, 9));
  const digits: string[] = [];
  digits.push(String(randomInt(rng, 1, 9)));
  for (let i = 1; i < k; i++) {
    digits.push(String(randomInt(rng, 0, 9)));
  }
  return digits.join("");
}

/** Compare two non-negative integer strings numerically. */
function compareStringNumbers(a: string, b: string): number {
  if (a.length !== b.length) return a.length - b.length;
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/** Add 1 to a numeric string. */
function stringAdd1(s: string): string {
  const digits = s.split("");
  let carry = 1;
  for (let i = digits.length - 1; i >= 0 && carry > 0; i--) {
    const d = Number(digits[i]!) + carry;
    digits[i] = String(d % 10);
    carry = Math.floor(d / 10);
  }
  if (carry > 0) digits.unshift(String(carry));
  return digits.join("");
}

/**
 * Generate a random numeric string in [low, high] inclusive.
 * Both low and high are numeric strings.
 */
function randomStringInRange(rng: () => number, low: string, high: string): string {
  // Simple approach: pick a random digit length, then generate a number in range
  const minLen = low.length;
  const maxLen = high.length;
  const len = randomInt(rng, minLen, maxLen);

  if (len > minLen && len < maxLen) {
    // Any number with this many digits is in range
    return genKDigitNumber(rng, len);
  }

  if (minLen === maxLen) {
    // Same length: generate digit by digit respecting bounds
    return randomStringBetween(rng, low, high);
  }

  if (len === minLen) {
    // Must be >= low, and any number with this length is <= high
    const nines = "9".repeat(len);
    return randomStringBetween(rng, low, nines);
  }

  // len === maxLen: must be <= high, any number with this length is >= low
  const lowerBound = "1" + "0".repeat(len - 1);
  return randomStringBetween(rng, lowerBound, high);
}

/**
 * Generate random numeric string in [low, high] where both have the same length.
 * Uses digit-by-digit generation.
 */
function randomStringBetween(rng: () => number, low: string, high: string): string {
  const n = low.length;
  const digits: string[] = [];
  let constrainedLow = true;
  let constrainedHigh = true;

  for (let i = 0; i < n; i++) {
    const lo = constrainedLow ? Number(low[i]!) : 0;
    const hi = constrainedHigh ? Number(high[i]!) : 9;
    const d = randomInt(rng, lo, hi);
    digits.push(String(d));
    if (d > lo) constrainedLow = false;
    if (d < hi) constrainedHigh = false;
  }

  return digits.join("");
}

/** "10" followed by (k-1) zeros, i.e. 10^k as a string */
function pow10String(k: number): string {
  return "1" + "0".repeat(k);
}

interface TestCase {
  readonly l: string;
  readonly r: string;
  readonly k: number;
}

const MAX_K = 20;

const generator: ProblemGenerator = {
  async generate(): Promise<GeneratedCase> {
    const rng = seededRandom(228);
    const cases: TestCase[] = [];

    // --- Sample cases ---
    cases.push({ l: "1", r: "3", k: 2 });
    cases.push({ l: "129", r: "135", k: 5 });
    cases.push({ l: "98", r: "3669", k: 11 });
    cases.push({ l: "12345678", r: "87654321", k: 20 });

    // --- Validation cases ---
    cases.push({
      l: genKDigitNumber(rng, 13),
      r: genKDigitNumber(rng, 17),
      k: MAX_K,
    });
    cases.push({
      l: genKDigitNumber(rng, 1),
      r: genKDigitNumber(rng, 3),
      k: 3,
    });
    cases.push({
      l: genKDigitNumber(rng, 16),
      r: genKDigitNumber(rng, 2024),
      k: MAX_K,
    });
    cases.push({
      l: genKDigitNumber(rng, 2023),
      r: genKDigitNumber(rng, 2024),
      k: MAX_K,
    });
    cases.push({
      l: genKDigitNumber(rng, 6),
      r: genKDigitNumber(rng, 2024),
      k: MAX_K - 1,
    });

    // --- Full test cases ---
    // Edge: L=1, R=10^2025
    cases.push({ l: "1", r: pow10String(2025), k: MAX_K });
    // Large L, R=max
    cases.push({
      l: genKDigitNumber(rng, 18),
      r: pow10String(2025),
      k: MAX_K - 2,
    });
    // Small L, R=max
    cases.push({
      l: genKDigitNumber(rng, 2),
      r: pow10String(2025),
      k: 13,
    });
    // Large L and R close together
    cases.push({
      l: genKDigitNumber(rng, 2000),
      r: genKDigitNumber(rng, 2024),
      k: MAX_K,
    });
    cases.push({
      l: genKDigitNumber(rng, Math.min(24, MAX_K)),
      r: genKDigitNumber(rng, 2024),
      k: MAX_K,
    });
    cases.push({
      l: genKDigitNumber(rng, Math.min(24, MAX_K)),
      r: pow10String(2025),
      k: MAX_K,
    });
    cases.push({
      l: genKDigitNumber(rng, 23),
      r: genKDigitNumber(rng, 2022),
      k: MAX_K,
    });
    // L = R
    cases.push({ l: "1237", r: "1237", k: MAX_K - 1 });
    cases.push({
      l: genKDigitNumber(rng, 23),
      r: genKDigitNumber(rng, 1029),
      k: MAX_K - 1,
    });
    cases.push({
      l: genKDigitNumber(rng, 7),
      r: genKDigitNumber(rng, 999),
      k: MAX_K - 1,
    });
    cases.push({
      l: genKDigitNumber(rng, 2000),
      r: genKDigitNumber(rng, 2002),
      k: MAX_K - 1,
    });

    // Batches with K=MAX_K, varying digit lengths
    for (let i = 0; i < 5; i++) {
      cases.push({
        l: genKDigitNumber(rng, randomInt(rng, 1, MAX_K)),
        r: genKDigitNumber(rng, 2024 - randomInt(rng, 0, 1025)),
        k: MAX_K,
      });
    }
    for (let i = 0; i < 5; i++) {
      cases.push({
        l: genKDigitNumber(rng, randomInt(rng, 1, MAX_K - 2)),
        r: genKDigitNumber(rng, Math.min(24, MAX_K)),
        k: MAX_K,
      });
    }
    for (let i = 0; i < 5; i++) {
      cases.push({
        l: genKDigitNumber(rng, randomInt(rng, 1, MAX_K - 3)),
        r: genKDigitNumber(rng, MAX_K - 1),
        k: MAX_K,
      });
    }
    for (let i = 0; i < 5; i++) {
      cases.push({
        l: genKDigitNumber(rng, MAX_K - 1),
        r: genKDigitNumber(rng, Math.min(24, MAX_K)),
        k: MAX_K,
      });
    }

    // Large random batch with varied K
    for (let i = 0; i < 65; i++) {
      const l = genKDigitNumber(rng, randomInt(rng, 1, Math.min(24, MAX_K)));
      const r = randomStringInRange(rng, stringAdd1(l), "9".repeat(24));
      cases.push({ l, r, k: MAX_K });
    }

    // Ensure L <= R for all cases, swap if needed
    const fixedCases: TestCase[] = cases.map((c) => {
      if (compareStringNumbers(c.l, c.r) > 0) {
        return { l: c.r, r: c.l, k: c.k };
      }
      return c;
    });

    const inputLines: string[] = [String(fixedCases.length)];
    for (const c of fixedCases) {
      inputLines.push(`${c.l} ${c.r} ${String(c.k)}`);
    }

    const input = inputLines.join("\n") + "\n";
    const output = await Promise.resolve(solution(input));

    return { input, output };
  },
};

export default generator;
