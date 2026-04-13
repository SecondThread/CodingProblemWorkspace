import type { GeneratedCase, ProblemGenerator } from "../../../../src/contracts/problem";
import solution from "../solution/solution";

function seededRandom(seed: number): () => number {
  let state = seed;
  return (): number => {
    state = (state * 1664525 + 1013904223) & 0xffffffff;
    return (state >>> 0) / 0x100000000;
  };
}

function randomInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

interface TestCase {
  readonly n: number;
  readonly adjRows: readonly string[];
}

function generateAdjacency(rng: () => number, n: number, density: number): string[] {
  const rows: string[] = [];
  for (let row = 1; row < n; row++) {
    const vals: number[] = [];
    for (let col = 0; col < row; col++) {
      vals.push(rng() < density ? 1 : 0);
    }
    rows.push(vals.join(" "));
  }
  return rows;
}

function generateFullAdjacency(n: number): string[] {
  const rows: string[] = [];
  for (let row = 1; row < n; row++) {
    rows.push(Array.from({ length: row }, () => "1").join(" "));
  }
  return rows;
}

function generateNoAdjacency(n: number): string[] {
  const rows: string[] = [];
  for (let row = 1; row < n; row++) {
    rows.push(Array.from({ length: row }, () => "0").join(" "));
  }
  return rows;
}

const generator: ProblemGenerator = {
  generate(): GeneratedCase {
    const rng = seededRandom(98765);
    const cases: TestCase[] = [];

    // Sample cases from the problem statement
    // Case 1: N=1
    cases.push({ n: 1, adjRows: [] });

    // Case 2: N=3, all adjacent
    cases.push({ n: 3, adjRows: ["1", "1 1"] });

    // Case 3: N=5, all adjacent
    cases.push({ n: 5, adjRows: ["1", "1 1", "1 1 1", "1 1 1 1"] });

    // Edge case: N=1
    cases.push({ n: 1, adjRows: [] });

    // Edge case: N=2 with adjacency
    cases.push({ n: 2, adjRows: ["1"] });

    // Edge case: N=2 without adjacency
    cases.push({ n: 2, adjRows: ["0"] });

    // Small N cases with random adjacency
    for (const n of [3, 4, 5, 6, 7, 8, 9, 10]) {
      cases.push({ n, adjRows: generateAdjacency(rng, n, 0.5) });
    }

    // Medium N with sparse adjacency
    for (const n of [20, 30, 40, 50]) {
      cases.push({ n, adjRows: generateAdjacency(rng, n, 0.1) });
    }

    // Medium N with dense adjacency
    for (const n of [20, 30, 40, 50]) {
      cases.push({ n, adjRows: generateAdjacency(rng, n, 0.8) });
    }

    // Large N with various densities
    cases.push({ n: 80, adjRows: generateAdjacency(rng, 80, 0.3) });
    cases.push({ n: 85, adjRows: generateAdjacency(rng, 85, 0.5) });
    cases.push({ n: 90, adjRows: generateAdjacency(rng, 90, 0.2) });
    cases.push({ n: 94, adjRows: generateAdjacency(rng, 94, 0.5) });

    // Large N edge: all adjacent
    cases.push({ n: 94, adjRows: generateFullAdjacency(94) });

    // Large N edge: no adjacency
    cases.push({ n: 94, adjRows: generateNoAdjacency(94) });

    // A few more random large cases
    cases.push({ n: 70, adjRows: generateAdjacency(rng, 70, 0.4) });
    cases.push({ n: 60, adjRows: generateAdjacency(rng, 60, 0.6) });

    // Build input
    const inputLines: string[] = [String(cases.length)];

    for (const c of cases) {
      inputLines.push(String(c.n));
      for (const row of c.adjRows) {
        inputLines.push(row);
      }
    }

    const input = inputLines.join("\n") + "\n";
    const output = solution(input);

    return { input, output };
  }
};

export default generator;
