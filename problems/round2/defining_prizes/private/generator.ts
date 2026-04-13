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

function randomArray(rng: () => number, len: number, min: number, max: number): number[] {
  const arr: number[] = [];
  for (let i = 0; i < len; i++) arr.push(randomInt(rng, min, max));
  return arr;
}

function filledArray(len: number, val: number): number[] {
  const arr: number[] = [];
  for (let i = 0; i < len; i++) arr.push(val);
  return arr;
}

interface TestCase {
  readonly n: number;
  readonly m: number;
  readonly scores: number[];
  readonly stock: number[];
}

const generator: ProblemGenerator = {
  async generate(): Promise<GeneratedCase> {
    const rng = seededRandom(77331);
    const cases: TestCase[] = [];

    // ===================== SAMPLE CASES (5) =====================
    cases.push({ n: 3, m: 2, scores: [1, 2, 3], stock: [1, 2] });
    cases.push({ n: 3, m: 1, scores: [1, 1, 1], stock: [2] });
    cases.push({ n: 3, m: 1, scores: [1, 1, 1], stock: [3] });
    cases.push({ n: 5, m: 5, scores: [5, 4, 3, 2, 1], stock: [1, 2, 3, 4, 5] });
    cases.push({ n: 5, m: 4, scores: [0, 0, 1, 1, 2], stock: [1, 1, 1, 1] });

    // ===================== EDGE CASES =====================

    // Single competitor, single merch, stock available
    cases.push({ n: 1, m: 1, scores: [0], stock: [1] });
    // Single competitor, single merch, no stock
    cases.push({ n: 1, m: 1, scores: [5], stock: [0] });
    // Single competitor, many merch types
    cases.push({ n: 1, m: 10, scores: [999999], stock: randomArray(rng, 10, 0, 100) });
    // Single competitor, stock all zero
    cases.push({ n: 1, m: 5, scores: [42], stock: filledArray(5, 0) });

    // All same scores -- everyone must get equal or nothing
    cases.push({ n: 5, m: 3, scores: filledArray(5, 10), stock: [5, 5, 5] });
    cases.push({ n: 5, m: 3, scores: filledArray(5, 10), stock: [4, 5, 5] });
    cases.push({ n: 5, m: 3, scores: filledArray(5, 10), stock: [0, 0, 0] });
    cases.push({ n: 10, m: 1, scores: filledArray(10, 7), stock: [10] });
    cases.push({ n: 10, m: 1, scores: filledArray(10, 7), stock: [9] });

    // All different scores (strict ordering)
    cases.push({ n: 5, m: 5, scores: [1, 2, 3, 4, 5], stock: [1, 1, 1, 1, 1] });
    cases.push({ n: 5, m: 5, scores: [1, 2, 3, 4, 5], stock: [5, 5, 5, 5, 5] });
    cases.push({ n: 5, m: 2, scores: [1, 2, 3, 4, 5], stock: [3, 3] });

    // All stock = 0 (no prizes possible)
    cases.push({ n: 5, m: 5, scores: [1, 2, 3, 4, 5], stock: filledArray(5, 0) });
    cases.push({ n: 3, m: 3, scores: [0, 0, 0], stock: filledArray(3, 0) });

    // N=2 boundary
    cases.push({ n: 2, m: 1, scores: [1, 2], stock: [2] });
    cases.push({ n: 2, m: 1, scores: [1, 2], stock: [1] });
    cases.push({ n: 2, m: 1, scores: [1, 1], stock: [1] });

    // ===================== ADVERSARIAL PATTERNS =====================

    // Many competitors all same score, tight stock
    cases.push({ n: 100, m: 1, scores: filledArray(100, 5), stock: [100] });
    cases.push({ n: 100, m: 1, scores: filledArray(100, 5), stock: [99] });

    // One high scorer, many ties at bottom: [0,0,...,0,1]
    {
      const sc = filledArray(99, 0);
      sc.push(1);
      cases.push({ n: 100, m: 5, scores: sc, stock: [99, 99, 99, 99, 99] });
    }
    {
      const sc = filledArray(99, 0);
      sc.push(1);
      cases.push({ n: 100, m: 2, scores: sc, stock: [50, 50] });
    }
    {
      const sc = filledArray(99, 0);
      sc.push(1);
      cases.push({ n: 100, m: 2, scores: sc, stock: [1, 1] });
    }

    // Stock values all equal
    cases.push({ n: 50, m: 50, scores: randomArray(rng, 50, 0, 10), stock: filledArray(50, 10) });
    cases.push({ n: 50, m: 50, scores: randomArray(rng, 50, 0, 10), stock: filledArray(50, 1) });

    // Stock: one huge pile, rest zero
    {
      const st = filledArray(10, 0);
      st.push(1000000);
      cases.push({ n: 50, m: 11, scores: randomArray(rng, 50, 0, 100), stock: st });
    }

    // Descending scores with tight stock
    {
      const sc: number[] = [];
      for (let i = 100; i >= 1; i--) sc.push(i);
      cases.push({ n: 100, m: 10, scores: sc, stock: randomArray(rng, 10, 1, 50) });
    }
    {
      const sc: number[] = [];
      for (let i = 100; i >= 1; i--) sc.push(i);
      cases.push({ n: 100, m: 3, scores: sc, stock: [100, 100, 100] });
    }

    // Many groups of equal scores (groups of 10)
    {
      const sc: number[] = [];
      for (let g = 0; g < 10; g++) {
        for (let i = 0; i < 10; i++) sc.push(g * 100);
      }
      cases.push({ n: 100, m: 20, scores: sc, stock: randomArray(rng, 20, 0, 50) });
    }

    // Two large groups
    {
      const sc = [...filledArray(50, 0), ...filledArray(50, 1)];
      cases.push({ n: 100, m: 10, scores: sc, stock: randomArray(rng, 10, 0, 50) });
    }

    // Max score values
    cases.push({ n: 5, m: 5, scores: filledArray(5, 1000000), stock: filledArray(5, 1000000) });
    cases.push({ n: 5, m: 5, scores: [0, 250000, 500000, 750000, 1000000], stock: filledArray(5, 1000000) });

    // ===================== MEDIUM RANDOM CASES =====================
    for (let r = 0; r < 15; r++) {
      const n = randomInt(rng, 1, 500);
      const m = randomInt(rng, 1, 500);
      const maxScore = randomInt(rng, 1, 1000000);
      const maxStock = randomInt(rng, 0, 1000000);
      cases.push({ n, m, scores: randomArray(rng, n, 0, maxScore), stock: randomArray(rng, m, 0, maxStock) });
    }

    // Medium cases with skewed distributions
    for (let r = 0; r < 5; r++) {
      const n = randomInt(rng, 100, 1000);
      const m = randomInt(rng, 1, 5);
      cases.push({ n, m, scores: randomArray(rng, n, 0, 10), stock: randomArray(rng, m, 0, n) });
    }
    for (let r = 0; r < 5; r++) {
      const n = randomInt(rng, 1, 5);
      const m = randomInt(rng, 100, 1000);
      cases.push({ n, m, scores: randomArray(rng, n, 0, 100), stock: randomArray(rng, m, 0, 100) });
    }

    // ===================== LARGE CASES =====================

    // Large: N=1000, M=1000 varied
    cases.push({
      n: 1000, m: 1000,
      scores: randomArray(rng, 1000, 0, 1000000),
      stock: randomArray(rng, 1000, 0, 1000000),
    });
    // Large: N=1000, M=1000, few distinct scores
    cases.push({
      n: 1000, m: 1000,
      scores: randomArray(rng, 1000, 0, 5),
      stock: randomArray(rng, 1000, 0, 1000),
    });
    // Large: N=1000, M=1000, all same score
    cases.push({
      n: 1000, m: 1000,
      scores: filledArray(1000, 42),
      stock: randomArray(rng, 1000, 0, 1000),
    });

    // Large: N=100000, M=100000
    cases.push({
      n: 100000, m: 100000,
      scores: randomArray(rng, 100000, 0, 1000000),
      stock: randomArray(rng, 100000, 0, 1000000),
    });
    // Large: N=100000, M=100000, few distinct scores
    cases.push({
      n: 100000, m: 100000,
      scores: randomArray(rng, 100000, 0, 10),
      stock: randomArray(rng, 100000, 0, 100000),
    });

    // Extreme ratio: N=1000000, M=1
    cases.push({
      n: 1000000, m: 1,
      scores: randomArray(rng, 1000000, 0, 1000000),
      stock: [1000000],
    });

    // Extreme ratio: N=1, M=1000000
    cases.push({
      n: 1, m: 1000000,
      scores: [500000],
      stock: randomArray(rng, 1000000, 0, 1000000),
    });

    // Large: N=500000, M=500000
    cases.push({
      n: 500000, m: 500000,
      scores: randomArray(rng, 500000, 0, 1000000),
      stock: randomArray(rng, 500000, 0, 1000000),
    });

    // Large: all same score, large N
    cases.push({
      n: 500000, m: 10,
      scores: filledArray(500000, 0),
      stock: randomArray(rng, 10, 0, 500000),
    });

    // Large: all distinct scores (sequential)
    {
      const sc: number[] = [];
      for (let i = 0; i < 100000; i++) sc.push(i);
      cases.push({
        n: 100000, m: 100000,
        scores: sc,
        stock: randomArray(rng, 100000, 0, 100000),
      });
    }

    // ===================== RANDOM FILLER =====================
    // Fill to get around 85 total cases
    const remaining = 85 - cases.length;
    for (let r = 0; r < remaining; r++) {
      const n = randomInt(rng, 1, 10000);
      const m = randomInt(rng, 1, 10000);
      const maxScore = randomInt(rng, 0, 1000000);
      const maxStock = randomInt(rng, 0, 1000000);
      cases.push({ n, m, scores: randomArray(rng, n, 0, maxScore), stock: randomArray(rng, m, 0, maxStock) });
    }

    // ===================== BUILD INPUT & SOLVE =====================
    const inputLines: string[] = [String(cases.length)];
    for (const c of cases) {
      inputLines.push(`${String(c.n)} ${String(c.m)}`);
      inputLines.push(c.scores.join(" "));
      inputLines.push(c.stock.join(" "));
    }

    const input = inputLines.join("\n") + "\n";
    const output = await Promise.resolve(solution(input));

    return { input, output };
  },
};

export default generator;
