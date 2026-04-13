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

/**
 * wnext(rng, lo, hi, x): generate min/max of |x|+1 random values in [lo,hi].
 * x > 0 => take max (biased high), x < 0 => take min (biased low), x = 0 => uniform.
 */
function wnext(rng: () => number, lo: number, hi: number, x: number): number {
  if (x === 0) return randomInt(rng, lo, hi);
  const cnt = Math.abs(x) + 1;
  let result = randomInt(rng, lo, hi);
  for (let i = 1; i < cnt; i += 1) {
    const v = randomInt(rng, lo, hi);
    if (x > 0) {
      if (v > result) result = v;
    } else {
      if (v < result) result = v;
    }
  }
  return result;
}

interface TreeCase {
  readonly n: number;
  readonly edges: readonly [number, number][];
}

function generateTree(rng: () => number, n: number, x: number): TreeCase {
  if (n === 1) return { n, edges: [] };

  // Generate parent array using wnext
  const par: number[] = new Array(n);
  par[0] = -1;
  for (let i = 1; i < n; i += 1) {
    par[i] = wnext(rng, 0, i - 1, x);
  }

  // Shuffle edges and relabel nodes
  const edgePairs: [number, number][] = [];
  for (let i = 1; i < n; i += 1) {
    edgePairs.push([par[i]!, i]);
  }

  // Fisher-Yates shuffle edges
  for (let i = edgePairs.length - 1; i > 0; i -= 1) {
    const j = randomInt(rng, 0, i);
    const tmp = edgePairs[i]!;
    edgePairs[i] = edgePairs[j]!;
    edgePairs[j] = tmp;
  }

  // Random permutation for node labels (1-indexed)
  const perm: number[] = new Array(n);
  for (let i = 0; i < n; i += 1) perm[i] = i + 1;
  for (let i = n - 1; i > 0; i -= 1) {
    const j = randomInt(rng, 0, i);
    const tmp = perm[i]!;
    perm[i] = perm[j]!;
    perm[j] = tmp;
  }

  const edges: [number, number][] = edgePairs.map(([a, b]) => [perm[a]!, perm[b]!]);
  return { n, edges };
}

const generator: ProblemGenerator = {
  generate(): GeneratedCase {
    const rng: () => number = seededRandom(98765);
    const cases: TreeCase[] = [];

    // Sample cases (from sample-input.txt)
    cases.push({
      n: 6,
      edges: [[1, 2], [1, 3], [2, 4], [2, 5], [3, 6]]
    });
    cases.push({
      n: 5,
      edges: [[1, 2], [1, 3], [1, 4], [1, 5]]
    });
    cases.push({
      n: 2,
      edges: [[1, 2]]
    });
    cases.push({
      n: 10,
      edges: [[1, 5], [5, 2], [6, 7], [9, 7], [3, 4], [2, 4], [2, 8], [10, 3], [7, 2]]
    });

    // Edge case: N=1
    cases.push({ n: 1, edges: [] });

    // Small cases with specific structures
    // Path graph N=3
    cases.push({ n: 3, edges: [[1, 2], [2, 3]] });
    // Star graph N=4
    cases.push({ n: 4, edges: [[1, 2], [1, 3], [1, 4]] });
    // Path graph N=7
    cases.push({ n: 7, edges: [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]] });

    // Small random cases
    for (let i = 0; i < 5; i += 1) {
      const n = randomInt(rng, 3, 15);
      cases.push(generateTree(rng, n, 0));
    }

    // Medium random cases with different tree shapes
    for (let i = 0; i < 5; i += 1) {
      const n = randomInt(rng, 50, 200);
      cases.push(generateTree(rng, n, 0)); // bushy
    }
    for (let i = 0; i < 3; i += 1) {
      const n = randomInt(rng, 50, 200);
      cases.push(generateTree(rng, n, 2)); // chain-like
    }
    for (let i = 0; i < 3; i += 1) {
      const n = randomInt(rng, 50, 200);
      cases.push(generateTree(rng, n, -2)); // star-like
    }

    // Larger cases
    for (let i = 0; i < 3; i += 1) {
      const n = randomInt(rng, 500, 2000);
      cases.push(generateTree(rng, n, 0));
    }
    for (let i = 0; i < 2; i += 1) {
      const n = randomInt(rng, 500, 2000);
      cases.push(generateTree(rng, n, 3)); // very chain-like
    }
    for (let i = 0; i < 2; i += 1) {
      const n = randomInt(rng, 500, 2000);
      cases.push(generateTree(rng, n, -3)); // very star-like
    }

    // Large cases
    for (let i = 0; i < 2; i += 1) {
      const n = randomInt(rng, 5000, 10000);
      cases.push(generateTree(rng, n, 0));
    }
    for (let i = 0; i < 2; i += 1) {
      const n = randomInt(rng, 5000, 10000);
      cases.push(generateTree(rng, n, 2));
    }

    // A few stress cases
    cases.push(generateTree(rng, 50000, 0));
    cases.push(generateTree(rng, 50000, 2));
    cases.push(generateTree(rng, 100000, 0));

    // Build input
    const inputLines: string[] = [String(cases.length)];
    for (const c of cases) {
      inputLines.push(String(c.n));
      for (const [u, v] of c.edges) {
        inputLines.push(`${String(u)} ${String(v)}`);
      }
    }

    const input: string = `${inputLines.join("\n")}\n`;
    const output: string = solution(input) as string;

    return { input, output };
  }
};

export default generator;
