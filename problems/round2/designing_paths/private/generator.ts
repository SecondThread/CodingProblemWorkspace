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

/** Fisher-Yates shuffle of array in place */
function shuffle(rng: () => number, arr: number[]): void {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j: number = Math.floor(rng() * (i + 1));
    const tmp: number = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
}

/** Pick k distinct elements from 1..n */
function pickDistinct(rng: () => number, n: number, k: number): number[] {
  if (k > n) {
    throw new Error("k > n in pickDistinct");
  }
  if (k <= n / 2) {
    const chosen: Set<number> = new Set<number>();
    while (chosen.size < k) {
      chosen.add(randomInt(rng, 1, n));
    }
    const result: number[] = Array.from(chosen);
    shuffle(rng, result);
    return result;
  }
  // For large k relative to n, shuffle range
  const arr: number[] = [];
  for (let i = 1; i <= n; i += 1) {
    arr.push(i);
  }
  shuffle(rng, arr);
  return arr.slice(0, k);
}

interface TestCase {
  readonly N: number;
  readonly K: number;
  readonly routes: readonly number[][];
}

function formatCase(tc: TestCase): string[] {
  const lines: string[] = [];
  lines.push(`${String(tc.N)} ${String(tc.K)} ${String(tc.routes.length)}`);
  for (const route of tc.routes) {
    lines.push(`${String(route.length)} ${route.join(" ")}`);
  }
  return lines;
}

/**
 * Generate random routes for N courts, M routes, with sum of lengths <= maxSumL.
 * Each route has length between 2 and maxRouteLen. Court 1 included in at least
 * one route if includeOne is true.
 */
function generateRandomRoutes(
  rng: () => number,
  N: number,
  M: number,
  maxSumL: number,
  minRouteLen: number,
  maxRouteLen: number,
  includeOne: boolean
): number[][] {
  const routes: number[][] = [];
  let sumL: number = 0;
  const effectiveMaxRouteLen: number = Math.min(maxRouteLen, N);
  const effectiveMinRouteLen: number = Math.min(minRouteLen, effectiveMaxRouteLen);

  for (let i = 0; i < M; i += 1) {
    const remaining: number = maxSumL - sumL;
    const routesLeft: number = M - i;
    // Reserve at least effectiveMinRouteLen per remaining route
    const budgetForThis: number = remaining - (routesLeft - 1) * effectiveMinRouteLen;
    const maxL: number = Math.min(effectiveMaxRouteLen, budgetForThis);
    if (maxL < effectiveMinRouteLen) {
      break; // Can't fit more routes
    }
    const L: number = randomInt(rng, effectiveMinRouteLen, maxL);
    const route: number[] = pickDistinct(rng, N, L);
    // Ensure court 1 is in the first route
    if (includeOne && i === 0 && !route.includes(1)) {
      route[0] = 1;
    }
    routes.push(route);
    sumL += L;
  }
  return routes;
}

const generator: ProblemGenerator = {
  generate(): GeneratedCase {
    const rng: () => number = seededRandom(98765);
    const allCases: TestCase[] = [];

    // ===== SAMPLE CASES (5) =====

    // Sample case 1: N=7 K=2 M=2
    allCases.push({ N: 7, K: 2, routes: [[1, 5, 7, 2], [2, 3, 4]] });

    // Sample case 2: N=5 K=1 M=2
    allCases.push({ N: 5, K: 1, routes: [[1, 2, 3], [1, 4, 5]] });

    // Sample case 3: N=5 K=1 M=1
    allCases.push({ N: 5, K: 1, routes: [[1, 2, 3, 4, 5]] });

    // Sample case 4: N=5 K=4 M=1
    allCases.push({ N: 5, K: 4, routes: [[1, 2, 3, 4, 5]] });

    // Sample case 5: N=5 K=1 M=1
    allCases.push({ N: 5, K: 1, routes: [[3, 4, 5, 1, 2]] });

    // ===== EDGE CASES =====

    // N=2, M=1, K=1, single route [1,2]
    allCases.push({ N: 2, K: 1, routes: [[1, 2]] });

    // N=2, M=1, K=1, single route [2,1]
    allCases.push({ N: 2, K: 1, routes: [[2, 1]] });

    // All courts on one long route, K=1 (many rides needed)
    {
      const N: number = 20;
      const route: number[] = [];
      for (let i = 1; i <= N; i += 1) {
        route.push(i);
      }
      allCases.push({ N, K: 1, routes: [route] });
    }

    // All courts on one long route, K=N-1 (one ride reaches everything)
    {
      const N: number = 20;
      const route: number[] = [];
      for (let i = 1; i <= N; i += 1) {
        route.push(i);
      }
      allCases.push({ N, K: N - 1, routes: [route] });
    }

    // Court 1 disconnected from others (D(x)=-1 for all x>1)
    {
      const N: number = 10;
      // Routes that don't include court 1
      allCases.push({ N, K: 2, routes: [[2, 3, 4], [5, 6, 7]] });
    }

    // Star topology: many short routes from court 1
    {
      const N: number = 15;
      const routes: number[][] = [];
      for (let i = 2; i <= N; i += 1) {
        routes.push([1, i]);
      }
      allCases.push({ N, K: 1, routes });
    }

    // ===== ADVERSARIAL PATTERNS =====

    // Chain: route [1,2,...,N] with small K
    {
      const N: number = 100;
      const route: number[] = [];
      for (let i = 1; i <= N; i += 1) {
        route.push(i);
      }
      allCases.push({ N, K: 2, routes: [route] });
    }

    // Chain with K=1
    {
      const N: number = 50;
      const route: number[] = [];
      for (let i = 1; i <= N; i += 1) {
        route.push(i);
      }
      allCases.push({ N, K: 1, routes: [route] });
    }

    // Many overlapping short routes
    {
      const N: number = 30;
      const routes: number[][] = [];
      for (let i = 1; i <= N - 1; i += 1) {
        routes.push([i, ((i % N) + 1)]);
      }
      allCases.push({ N, K: 1, routes });
    }

    // Routes that don't include court 1 at all
    {
      const N: number = 20;
      const routes: number[][] = [
        [3, 4, 5, 6],
        [7, 8, 9, 10],
        [11, 12, 13],
      ];
      allCases.push({ N, K: 2, routes });
    }

    // Two disconnected components, court 1 only in one
    {
      const N: number = 20;
      const routes: number[][] = [
        [1, 2, 3, 4, 5],
        [5, 6, 7, 8],
        [11, 12, 13, 14, 15],
      ];
      allCases.push({ N, K: 2, routes });
    }

    // Court 1 at the end of a long route
    {
      const N: number = 30;
      const route: number[] = [];
      for (let i = 2; i <= N; i += 1) {
        route.push(i);
      }
      route.push(1);
      allCases.push({ N, K: 3, routes: [route] });
    }

    // ===== SMALL RANDOM CASES (N=3..20) =====
    for (let i = 0; i < 12; i += 1) {
      const N: number = randomInt(rng, 3, 20);
      const K: number = randomInt(rng, 1, N - 1);
      const maxM: number = Math.min(20, Math.floor(100 / 2)); // keep routes small
      const M: number = randomInt(rng, 1, Math.min(maxM, N * (N - 1) / 2));
      const routes: number[][] = generateRandomRoutes(rng, N, M, 1000, 2, N, true);
      if (routes.length > 0) {
        allCases.push({ N, K, routes });
      }
    }

    // ===== MEDIUM CASES (N=100..1000) =====

    // Sparse (few routes)
    for (let i = 0; i < 5; i += 1) {
      const N: number = randomInt(rng, 100, 1000);
      const K: number = randomInt(rng, 1, N - 1);
      const M: number = randomInt(rng, 1, 5);
      const routes: number[][] = generateRandomRoutes(rng, N, M, 10000, 2, Math.min(N, 500), true);
      if (routes.length > 0) {
        allCases.push({ N, K, routes });
      }
    }

    // Dense (many routes)
    for (let i = 0; i < 5; i += 1) {
      const N: number = randomInt(rng, 100, 500);
      const K: number = randomInt(rng, 1, N - 1);
      const M: number = randomInt(rng, 20, 100);
      const routes: number[][] = generateRandomRoutes(rng, N, M, 50000, 2, Math.min(N, 50), true);
      if (routes.length > 0) {
        allCases.push({ N, K, routes });
      }
    }

    // Medium with K=1 (hardest)
    for (let i = 0; i < 3; i += 1) {
      const N: number = randomInt(rng, 200, 1000);
      const M: number = randomInt(rng, 5, 30);
      const routes: number[][] = generateRandomRoutes(rng, N, M, 20000, 2, Math.min(N, 200), true);
      if (routes.length > 0) {
        allCases.push({ N, K: 1, routes });
      }
    }

    // Medium with large K
    for (let i = 0; i < 3; i += 1) {
      const N: number = randomInt(rng, 200, 1000);
      const K: number = N - 1;
      const M: number = randomInt(rng, 3, 15);
      const routes: number[][] = generateRandomRoutes(rng, N, M, 20000, 2, Math.min(N, 300), true);
      if (routes.length > 0) {
        allCases.push({ N, K, routes });
      }
    }

    // ===== LARGE CASES =====

    // Large case 1: N=100000, sum L_i near 1000000, moderate K
    {
      const N: number = 100000;
      const K: number = 50;
      const targetSumL: number = 900000;
      const routeLen: number = 500;
      const M: number = Math.floor(targetSumL / routeLen);
      const routes: number[][] = generateRandomRoutes(rng, N, M, targetSumL, routeLen, routeLen, true);
      allCases.push({ N, K, routes });
    }

    // Large case 2: Large N with K=1 (hardest for BFS)
    {
      const N: number = 50000;
      const K: number = 1;
      const targetSumL: number = 500000;
      const routeLen: number = 200;
      const M: number = Math.floor(targetSumL / routeLen);
      const routes: number[][] = generateRandomRoutes(rng, N, M, targetSumL, routeLen, routeLen, true);
      allCases.push({ N, K, routes });
    }

    // Large case 3: Large N with large K (fewer hops needed)
    {
      const N: number = 80000;
      const K: number = 10000;
      const targetSumL: number = 800000;
      const routeLen: number = 400;
      const M: number = Math.floor(targetSumL / routeLen);
      const routes: number[][] = generateRandomRoutes(rng, N, M, targetSumL, routeLen, routeLen, true);
      allCases.push({ N, K, routes });
    }

    // ===== BUILD INPUT AND SOLVE =====

    const inputLines: string[] = [String(allCases.length)];
    for (const tc of allCases) {
      const caseLines: string[] = formatCase(tc);
      for (const line of caseLines) {
        inputLines.push(line);
      }
    }

    const input: string = `${inputLines.join("\n")}\n`;
    const output: string = solution(input) as string;

    return { input, output };
  }
};

export default generator;
