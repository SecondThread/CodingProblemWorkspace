import type { GeneratedCase, ProblemGenerator } from "../../../../src/contracts/problem";

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

function lowerBound(arr: readonly number[], val: number): number {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (arr[mid]! < val) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function upperBound(arr: readonly number[], val: number): number {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (arr[mid]! <= val) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function insertSorted(arr: number[], val: number): void {
  const pos = lowerBound(arr, val);
  arr.splice(pos, 0, val);
}

function solve(N: number, Q: number, L: number, cowPos: number[], queries: number[][]): number {
  const posCow = new Map<number, number>();
  for (let i = 0; i < N; i++) posCow.set(cowPos[i]!, i + 1);

  const walls: number[] = [1, L];
  const queryCow: number[][] = [];
  for (let i = 0; i < N; i++) queryCow.push([]);
  const queryLeft: number[] = new Array(Q);
  const queryRight: number[] = new Array(Q);
  const queryTime: number[] = new Array(Q);
  const queryAns: number[] = new Array(Q).fill(-1);

  for (let i = 0; i < Q; i++) {
    const q = queries[i]!;
    if (q[0] === 1) {
      insertSorted(walls, q[1]!);
    }
    if (q[0] === 2) {
      const c = q[1]! - 1;
      const t = q[2]!;
      const it = lowerBound(walls, cowPos[c]!);
      queryLeft[i] = walls[it - 1]!;
      queryRight[i] = walls[it]!;
      queryTime[i] = t;
      queryCow[c]!.push(i);
    }
  }

  const cows: number[] = [];
  for (let cow = N - 1; cow >= 0; cow--) {
    for (const query of queryCow[cow]!) {
      let t = queryTime[query]!;
      const gap = queryRight[query]! - queryLeft[query]!;
      const left = queryLeft[query]!;
      const right = queryRight[query]!;
      const cp = cowPos[cow]!;

      if (t >= gap) {
        const it = lowerBound(cows, right);
        if (it > 0 && cows[it - 1]! > left) {
          queryAns[query] = posCow.get(cows[it - 1]!)!;
        } else {
          queryAns[query] = 0;
        }
      } else {
        queryAns[query] = 0;
      }

      t = t % gap;
      if (t <= cp - left) {
        const threshold = 2 * t - cp + 2 * left;
        const it = upperBound(cows, threshold);
        if (it > 0 && cows[it - 1]! > left) {
          queryAns[query] = posCow.get(cows[it - 1]!)!;
        }
      } else {
        const it = lowerBound(cows, cp);
        if (it > 0 && cows[it - 1]! > left) {
          queryAns[query] = posCow.get(cows[it - 1]!)!;
        }
        const tRem = t - (cp - left);
        const bound = Math.min(cp + 2 * tRem, right);
        const it2 = upperBound(cows, bound);
        if (it2 > 0 && cows[it2 - 1]! > cp) {
          queryAns[query] = posCow.get(cows[it2 - 1]!)!;
        }
      }
    }
    insertSorted(cows, cowPos[cow]!);
  }

  let ans = 0;
  for (let i = 0; i < Q; i++) {
    if (queryAns[i]! !== -1) ans += queryAns[i]!;
  }
  return ans;
}

function pickDistinct(rng: () => number, min: number, max: number, count: number): number[] {
  const set = new Set<number>();
  while (set.size < count) {
    set.add(randomInt(rng, min, max));
  }
  return Array.from(set);
}

const generator: ProblemGenerator = {
  generate(): GeneratedCase {
    const rng = seededRandom(77431);

    interface TestCase {
      N: number;
      Q: number;
      L: number;
      positions: number[];
      queries: number[][];
    }

    const cases: TestCase[] = [];

    function generateCase(nMin: number, nMax: number, qMin: number, qMax: number, lMin: number, lMax: number): void {
      const L = randomInt(rng, lMin, lMax);
      const maxN = Math.min(nMax, L - 2);
      if (maxN < 1) return;
      const N = randomInt(rng, Math.min(nMin, maxN), maxN);
      const Q = randomInt(rng, qMin, qMax);
      const positions = pickDistinct(rng, 2, L - 1, N);
      const queries: number[][] = [];
      for (let i = 0; i < Q; i++) {
        const type = randomInt(rng, 1, 2);
        if (type === 1) {
          const x = randomInt(rng, 2, L - 1);
          queries.push([1, x]);
        } else {
          const r = randomInt(rng, 1, N);
          const s = randomInt(rng, 1, L * 3);
          queries.push([2, r, s]);
        }
      }
      cases.push({ N, Q, L, positions, queries });
    }

    // Small cases
    for (let i = 0; i < 20; i++) {
      generateCase(1, 8, 1, 10, 5, 30);
    }

    // Medium cases
    for (let i = 0; i < 25; i++) {
      generateCase(10, 50, 10, 50, 50, 200);
    }

    // Larger cases
    for (let i = 0; i < 10; i++) {
      generateCase(100, 500, 100, 500, 500, 10000);
    }

    const inputLines: string[] = [String(cases.length)];
    const outputLines: string[] = [];

    for (let i = 0; i < cases.length; i++) {
      const tc = cases[i]!;
      inputLines.push(`${String(tc.N)} ${String(tc.Q)} ${String(tc.L)}`);
      inputLines.push(tc.positions.join(" "));
      for (const q of tc.queries) {
        inputLines.push(q.join(" "));
      }
      const ans = solve(tc.N, tc.Q, tc.L, tc.positions, tc.queries);
      outputLines.push(`Case #${String(i + 1)}: ${String(ans)}`);
    }

    return {
      input: `${inputLines.join("\n")}\n`,
      output: `${outputLines.join("\n")}\n`
    };
  }
};

export default generator;
