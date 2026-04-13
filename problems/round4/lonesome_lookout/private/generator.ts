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

function shuffle<T>(rng: () => number, arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
}

interface TestCase {
  readonly R: number;
  readonly C: number;
  readonly guards: readonly [number, number][];
}

function generateRandom(rng: () => number, R: number, C: number, N: number): TestCase {
  const guards: [number, number][] = [];
  const seen = new Set<string>();
  for (let i = 0; i < N; i++) {
    let x: number, y: number;
    do {
      x = randomInt(rng, 1, R);
      y = randomInt(rng, 1, C);
    } while (seen.has(`${x},${y}`));
    seen.add(`${x},${y}`);
    guards.push([x, y]);
  }
  return { R, C, guards };
}

function generateDiagonal(rng: () => number, R: number, C: number, count: number): TestCase {
  const k = Math.min(R, C);
  const len = Math.min(count, k);
  const guards: [number, number][] = [];
  for (let i = 1; i <= len; i++) {
    guards.push([i, i]);
  }
  shuffle(rng, guards);
  return { R, C, guards };
}

function generateFullRow(rng: () => number, R: number, C: number): TestCase {
  const row = randomInt(rng, 1, R);
  const guards: [number, number][] = [];
  for (let y = 1; y <= C; y++) {
    guards.push([row, y]);
  }
  shuffle(rng, guards);
  return { R, C, guards };
}

function generateFullCol(rng: () => number, R: number, C: number): TestCase {
  const col = randomInt(rng, 1, C);
  const guards: [number, number][] = [];
  for (let x = 1; x <= R; x++) {
    guards.push([x, col]);
  }
  shuffle(rng, guards);
  return { R, C, guards };
}

function generateDefensivePlusNonDef(
  rng: () => number, R: number, C: number, numDef: number, numNonDefExtra: number
): TestCase {
  // Place numDef defensive rooks on diagonal, then a block of non-defensive rooks
  const guards: [number, number][] = [];
  const usedRows = new Set<number>();
  const usedCols = new Set<number>();

  // Defensive rooks: unique row and column each
  const rowsPerm: number[] = [];
  const colsPerm: number[] = [];
  for (let i = 1; i <= Math.min(R, numDef + numNonDefExtra + 10); i++) rowsPerm.push(i);
  for (let i = 1; i <= Math.min(C, numDef + numNonDefExtra + 10); i++) colsPerm.push(i);
  shuffle(rng, rowsPerm);
  shuffle(rng, colsPerm);

  for (let i = 0; i < numDef; i++) {
    guards.push([rowsPerm[i]!, colsPerm[i]!]);
    usedRows.add(rowsPerm[i]!);
    usedCols.add(colsPerm[i]!);
  }

  // Non-defensive: put multiple rooks in same row
  const ndRow = rowsPerm[numDef]!;
  usedRows.add(ndRow);
  for (let i = 0; i < numNonDefExtra; i++) {
    const col = colsPerm[numDef + i]!;
    guards.push([ndRow, col]);
  }

  shuffle(rng, guards);
  return { R, C, guards };
}

const generator: ProblemGenerator = {
  generate(): GeneratedCase {
    const rng = seededRandom(20250412);
    const cases: TestCase[] = [];

    // Sample cases from problem statement
    cases.push({ R: 2, C: 3, guards: [[1, 1], [2, 2], [1, 3]] });
    cases.push({ R: 3, C: 3, guards: [[2, 1]] });
    cases.push({ R: 5, C: 5, guards: [] });
    cases.push({ R: 2, C: 3, guards: [[1, 1], [2, 2]] });
    cases.push({ R: 3, C: 3, guards: [[2, 3], [3, 3]] });

    // Edge: 1x1 grid
    cases.push({ R: 1, C: 1, guards: [] });
    cases.push({ R: 1, C: 1, guards: [[1, 1]] });

    // Edge: 1xC and Rx1
    cases.push({ R: 1, C: 5, guards: [] });
    cases.push({ R: 1, C: 5, guards: [[1, 3]] });
    cases.push({ R: 5, C: 1, guards: [] });
    cases.push({ R: 5, C: 1, guards: [[3, 1]] });

    // Small random cases
    for (let t = 0; t < 10; t++) {
      const R = randomInt(rng, 1, 10);
      const C = randomInt(rng, 1, 10);
      const N = randomInt(rng, 0, R * C);
      cases.push(generateRandom(rng, R, C, N));
    }

    // Medium random cases
    for (let t = 0; t < 8; t++) {
      const R = randomInt(rng, 50, 500);
      const C = randomInt(rng, 50, 500);
      const maxN = Math.min(R * C, 1000);
      const N = randomInt(rng, 0, maxN);
      cases.push(generateRandom(rng, R, C, N));
    }

    // Diagonal rooks
    cases.push(generateDiagonal(rng, 100, 200, 50));
    cases.push(generateDiagonal(rng, 500, 500, 500));

    // Full row / full column
    cases.push(generateFullRow(rng, 100, 200));
    cases.push(generateFullCol(rng, 200, 100));

    // Defensive + non-defensive mix
    cases.push(generateDefensivePlusNonDef(rng, 100, 100, 10, 5));
    cases.push(generateDefensivePlusNonDef(rng, 500, 500, 50, 20));

    // No guards, larger grid
    cases.push({ R: 1000, C: 1000, guards: [] });
    cases.push({ R: 500, C: 1000, guards: [] });

    // Large R, small C (so min(R,C) = C is small, FFT is fast)
    cases.push(generateRandom(rng, 1000000, 10, 10));
    cases.push(generateRandom(rng, 1000000, 100, 100));
    cases.push(generateRandom(rng, 10, 1000000, 10));

    // Moderate min(R,C) with various guard counts
    for (let t = 0; t < 4; t++) {
      const R = randomInt(rng, 1000, 5000);
      const C = randomInt(rng, 1000, 5000);
      const N = randomInt(rng, 0, Math.min(R * C, 10000));
      cases.push(generateRandom(rng, R, C, N));
    }

    // Larger min(R,C) cases
    cases.push(generateRandom(rng, 10000, 10000, 5000));
    cases.push(generateRandom(rng, 50000, 50000, 1000));

    // Near-max with diagonal (defensive) rooks
    cases.push(generateDiagonal(rng, 100000, 200000, 1000));

    // Large with zero guards
    cases.push({ R: 100000, C: 100000, guards: [] });

    // Full row in large grid
    cases.push(generateFullRow(rng, 100000, 5000));
    cases.push(generateFullCol(rng, 5000, 100000));

    // Build input
    const inputLines: string[] = [String(cases.length)];
    for (const c of cases) {
      inputLines.push(`${String(c.R)} ${String(c.C)} ${String(c.guards.length)}`);
      for (const [x, y] of c.guards) {
        inputLines.push(`${String(x)} ${String(y)}`);
      }
    }

    const input: string = `${inputLines.join("\n")}\n`;
    const output: string = solution(input);

    return { input, output };
  }
};

export default generator;
