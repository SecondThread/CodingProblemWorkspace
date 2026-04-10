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

function check(groups: readonly number[], stock: readonly number[], k: number): boolean {
  let need = 0;
  for (let i = k; i < groups.length; i += 1) need += groups[i]!;
  let s: number = stock.length - 1;
  let deficit = 0;
  for (let i = k; i < groups.length; i += 1) {
    if (s < 0) return false;
    deficit = Math.max(0, need + deficit - stock[s]!);
    s -= 1;
    need -= groups[i]!;
  }
  while (s >= 0) {
    deficit -= stock[s]!;
    s -= 1;
  }
  return deficit <= 0;
}

function solve(n: number, scoreArr: number[], stockArr: number[]): number {
  scoreArr.sort((a, b) => a - b);
  stockArr.sort((a, b) => a - b);

  const groups: number[] = [];
  let last: number = scoreArr[0]!;
  let cnt = 0;
  for (let i = 0; i < n; i += 1) {
    if (scoreArr[i] === last) {
      cnt += 1;
    } else {
      groups.push(cnt);
      cnt = 1;
      last = scoreArr[i]!;
    }
  }
  groups.push(cnt);

  let l = 0;
  let r: number = groups.length;
  while (l < r) {
    const mid: number = l + Math.floor((r - l) / 2);
    if (check(groups, stockArr, mid)) {
      r = mid;
    } else {
      l = mid + 1;
    }
  }

  let res = 0;
  for (let i = l; i < groups.length; i += 1) res += groups[i]!;
  return res;
}

interface TestCase {
  readonly n: number;
  readonly m: number;
  readonly scores: number[];
  readonly stock: number[];
}

const generator: ProblemGenerator = {
  generate(): GeneratedCase {
    const rng = seededRandom(42424);
    const cases: TestCase[] = [];

    // Sample cases
    cases.push({ n: 5, m: 3, scores: [1, 2, 2, 3, 3], stock: [4, 1, 2] });
    cases.push({ n: 4, m: 2, scores: [1, 1, 1, 1], stock: [3, 5] });
    cases.push({ n: 3, m: 1, scores: [10, 20, 30], stock: [2] });

    // Edge: single competitor, single stock
    cases.push({ n: 1, m: 1, scores: [0], stock: [1] });
    cases.push({ n: 1, m: 1, scores: [5], stock: [0] });

    // Random small cases
    for (let r = 0; r < 15; r += 1) {
      const n: number = randomInt(rng, 1, 50);
      const m: number = randomInt(rng, 1, 50);
      const scores: number[] = [];
      const stock: number[] = [];
      for (let i = 0; i < n; i += 1) scores.push(randomInt(rng, 0, 20));
      for (let i = 0; i < m; i += 1) stock.push(randomInt(rng, 0, 100));
      cases.push({ n, m, scores, stock });
    }

    const inputLines: string[] = [String(cases.length)];
    const outputLines: string[] = [];

    for (let i = 0; i < cases.length; i += 1) {
      const c: TestCase = cases[i]!;
      inputLines.push(`${String(c.n)} ${String(c.m)}`);
      inputLines.push(c.scores.join(" "));
      inputLines.push(c.stock.join(" "));
      const ans: number = solve(c.n, [...c.scores], [...c.stock]);
      outputLines.push(`Case #${String(i + 1)}: ${String(ans)}`);
    }

    return {
      input: `${inputLines.join("\n")}\n`,
      output: `${outputLines.join("\n")}\n`
    };
  }
};

export default generator;
