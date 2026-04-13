import type { GeneratedCase, ProblemGenerator } from "../../../../src/contracts/problem";
import solution from "../solution/solution";

function seededRandom(seed: number): () => number {
  let state: number = seed;
  return (): number => {
    state = (state * 1664525 + 1013904223) & 0xffffffff;
    return (state >>> 0) / 0x100000000;
  };
}

function randomBigInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

interface TestCase {
  readonly n: number;
  readonly m: number;
  readonly a: readonly number[];
}

function generateRandom(
  rng: () => number,
  n: number,
  m: number,
  minVal: number,
  maxVal: number,
  sorted: boolean
): TestCase {
  const a: number[] = Array.from({ length: n }, () => randomBigInt(rng, minVal, maxVal));
  if (sorted) a.sort((x, y) => x - y);
  return { n, m, a };
}

function generateFormula(
  rng: () => number,
  n: number,
  m: number,
  baseMin: number,
  baseMax: number,
  step: number,
  sorted: boolean
): TestCase {
  const a: number[] = Array.from({ length: n }, (_, i) =>
    randomBigInt(rng, baseMin, baseMax + (i + 1) * step)
  );
  if (sorted) a.sort((x, y) => x - y);
  return { n, m, a };
}

function generateBatch(
  rng: () => number,
  count: number,
  nMin: number,
  nMax: number,
  sMin: number,
  sMax: number,
  configs: readonly {
    count: number;
    type: "random" | "formula";
    minVal?: number;
    maxVal?: number | "s+n";
    baseMin?: number;
    baseMax?: number;
    step?: number;
    sorted?: boolean;
  }[]
): TestCase[] {
  const cases: TestCase[] = [];
  for (let t = 0; t < count; t++) {
    const n = randomBigInt(rng, nMin, nMax);
    const s = randomBigInt(rng, sMin, sMax);

    let configIdx = 0;
    let accumulated = 0;
    for (const cfg of configs) {
      accumulated += cfg.count;
      if (t < accumulated) {
        configIdx = configs.indexOf(cfg);
        break;
      }
    }
    const cfg = configs[configIdx]!;

    if (cfg.type === "random") {
      const maxVal = cfg.maxVal === "s+n" ? Math.min(1e12, s + n) : (cfg.maxVal ?? 1e12);
      cases.push(generateRandom(rng, n, s, cfg.minVal ?? 1, maxVal, cfg.sorted ?? false));
    } else {
      cases.push(generateFormula(rng, n, s, cfg.baseMin ?? 1, cfg.baseMax ?? 1, cfg.step ?? 1, cfg.sorted ?? false));
    }
  }
  return cases;
}

/** Special case from genSpecial.cpp: crafted to make O(n^2) DP state space */
function generateSpecialCase(n: number): TestCase {
  const s = (n - 1) * (n - 1) * 1e6;
  const a: number[] = new Array(n);
  for (let i = 0; i < n; i++) {
    if (i < n - 2) {
      a[i] = i + 1;
    } else if (i === n - 2) {
      a[i] = (n - 1) * 1e6 - ((n - 2) * (n - 1)) / 2;
    } else {
      a[i] = 1e6;
    }
  }
  return { n, m: s, a };
}

function formatCase(c: TestCase): string {
  return `${String(c.n)} ${String(c.m)}\n${c.a.join(" ")}`;
}

const generator: ProblemGenerator = {
  async generate(): Promise<GeneratedCase> {
    const rng = seededRandom(98765);
    const cases: TestCase[] = [];

    // Sample/validation cases (hardcoded)
    cases.push({ n: 3, m: 27, a: [3, 5, 1] });
    cases.push({ n: 3, m: 18, a: [1, 9, 6] });
    cases.push({ n: 3, m: 28, a: [3, 5, 1] });
    cases.push({ n: 5, m: 100, a: [7, 6, 16, 9, 3] });
    cases.push({ n: 10, m: 45, a: [1, 2, 4, 8, 1, 2, 60, 3, 5, 7] });
    cases.push({ n: 8, m: 230, a: [5, 11, 12, 15, 13, 7, 23, 7] });

    // Batch 1: small n, small s
    cases.push(...generateBatch(rng, 10, 1, 50, 1, 1000, [
      { count: 1, type: "random", maxVal: "s+n" },
      { count: 1, type: "random", maxVal: "s+n", sorted: true },
      { count: 3, type: "formula", baseMin: 10, baseMax: 10, step: 3 },
      { count: 3, type: "formula", baseMin: 100, baseMax: 100, step: 3 },
      { count: 2, type: "formula", baseMin: 1, baseMax: 1, step: 2 },
    ]));

    // Batch 2: small n, medium s
    cases.push(...generateBatch(rng, 10, 1, 70, 1e4, 1e8, [
      { count: 1, type: "random", maxVal: "s+n" },
      { count: 1, type: "random", maxVal: "s+n", sorted: true },
      { count: 3, type: "formula", baseMin: 100, baseMax: 100, step: 10 },
      { count: 3, type: "formula", baseMin: 1000, baseMax: 1000, step: 50 },
      { count: 2, type: "formula", baseMin: 1, baseMax: 1, step: 3 },
    ]));

    // Batch 3: small n, large s
    cases.push(...generateBatch(rng, 10, 10, 70, 1e9, 1e12, [
      { count: 1, type: "random", maxVal: "s+n" },
      { count: 1, type: "random", maxVal: "s+n", sorted: true },
      { count: 3, type: "formula", baseMin: 10000, baseMax: 10000, step: 1000 },
      { count: 3, type: "formula", baseMin: 1e7, baseMax: 1e7, step: 10000 },
      { count: 2, type: "formula", baseMin: 1, baseMax: 1, step: 10 },
    ]));

    // Batch 4: medium n, small s
    cases.push(...generateBatch(rng, 10, 80, 200, 1, 1000, [
      { count: 1, type: "random", maxVal: "s+n" },
      { count: 1, type: "random", maxVal: "s+n", sorted: true },
      { count: 3, type: "formula", baseMin: 10, baseMax: 10, step: 3 },
      { count: 3, type: "formula", baseMin: 100, baseMax: 100, step: 3 },
      { count: 2, type: "formula", baseMin: 1, baseMax: 1, step: 2 },
    ]));

    // Batch 5: medium n, medium s
    cases.push(...generateBatch(rng, 10, 80, 200, 1e4, 1e8, [
      { count: 2, type: "random", maxVal: "s+n", sorted: true },
      { count: 3, type: "formula", baseMin: 100, baseMax: 100, step: 10 },
      { count: 3, type: "formula", baseMin: 1000, baseMax: 1000, step: 50 },
      { count: 2, type: "formula", baseMin: 1, baseMax: 1, step: 3 },
    ]));

    // Batch 6: medium n, large s
    cases.push(...generateBatch(rng, 10, 80, 200, 1e9, 1e12, [
      { count: 1, type: "random", maxVal: "s+n" },
      { count: 1, type: "random", maxVal: "s+n", sorted: true },
      { count: 3, type: "formula", baseMin: 10000, baseMax: 10000, step: 1000 },
      { count: 3, type: "formula", baseMin: 1e7, baseMax: 1e7, step: 10000 },
      { count: 2, type: "formula", baseMin: 1, baseMax: 1, step: 10 },
    ]));

    // Batch 7: large n, medium s
    cases.push(...generateBatch(rng, 10, 300, 500, 1e3, 1e7, [
      { count: 1, type: "random", maxVal: "s+n" },
      { count: 1, type: "random", maxVal: "s+n", sorted: true },
      { count: 3, type: "formula", baseMin: 100, baseMax: 100, step: 10 },
      { count: 3, type: "formula", baseMin: 1000, baseMax: 1000, step: 50 },
      { count: 2, type: "formula", baseMin: 1, baseMax: 1, step: 3 },
    ]));

    // Batch 8: large n, large s
    cases.push(...generateBatch(rng, 10, 300, 500, 1e9, 1e12, [
      { count: 1, type: "random", maxVal: "s+n" },
      { count: 1, type: "random", maxVal: "s+n", sorted: true },
      { count: 3, type: "formula", baseMin: 10000, baseMax: 10000, step: 1000 },
      { count: 3, type: "formula", baseMin: 1e7, baseMax: 1e7, step: 10000 },
      { count: 2, type: "formula", baseMin: 1, baseMax: 1, step: 10 },
    ]));

    // Batch 9: mixed n, large s
    cases.push(...generateBatch(rng, 20, 50, 500, 1e7, 1e12, [
      { count: 4, type: "random", maxVal: "s+n" },
      { count: 6, type: "formula", baseMin: 10000, baseMax: 10000, step: 1000 },
      { count: 6, type: "formula", baseMin: 1e5, baseMax: 1e5, step: 10000 },
      { count: 4, type: "formula", baseMin: 1, baseMax: 1, step: 10 },
    ]));

    // Special cases: crafted for O(n^2) DP state
    for (const n of [300, 350, 400, 450, 500, 500]) {
      cases.push(generateSpecialCase(n));
    }

    const inputLines: string[] = [String(cases.length)];
    for (const c of cases) inputLines.push(formatCase(c));

    const input = inputLines.join("\n") + "\n";
    const output = await Promise.resolve(solution(input));

    return { input, output };
  }
};

export default generator;
