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

class DisjointSet {
  private readonly parent: number[];
  private readonly rank: number[];
  public componentCount: number;

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array<number>(n).fill(0);
    this.componentCount = n;
  }

  find(x: number): number {
    if (this.parent[x]! !== x) this.parent[x] = this.find(this.parent[x]!);
    return this.parent[x]!;
  }

  union(a: number, b: number): boolean {
    let ra: number = this.find(a);
    let rb: number = this.find(b);
    if (ra === rb) return false;
    if (this.rank[ra]! < this.rank[rb]!) { const tmp = ra; ra = rb; rb = tmp; }
    this.parent[rb] = ra;
    if (this.rank[ra]! === this.rank[rb]!) this.rank[ra]! += 1;
    this.componentCount -= 1;
    return true;
  }
}

function solve(a: readonly number[]): number {
  const n: number = a.length;
  const events: { a: number; b: number; time: number }[] = [];
  for (let i = 0; i < n; i += 1) events.push({ a: i + 1, b: 0, time: a[i]! });
  for (let i = 1; i < n; i += 1) events.push({ a: i, b: i + 1, time: Math.abs(a[i]! - a[i - 1]!) });
  events.sort((x, y) => x.time - y.time);
  const ds = new DisjointSet(n + 1);
  let ans = 0;
  let idx = 0;
  while (ds.componentCount > 1) { const e = events[idx]!; idx++; ds.union(e.a, e.b); ans = e.time; }
  return ans;
}

function printCase(a: readonly number[]): string {
  return `${String(a.length)}\n${a.join(" ")}`;
}

const generator: ProblemGenerator = {
  generate(): GeneratedCase {
    const rng = seededRandom(54321);
    const cases: (readonly number[])[] = [];

    cases.push([2, 4, 5, 1, 4]);
    cases.push([13, 10, 11]);
    cases.push([1, 3, 3, 7]);
    cases.push([42]);
    cases.push([5, 50, 42]);
    cases.push([4, 2, 5, 6, 4, 2, 1]);
    cases.push(Array.from({ length: 50000 }, (_, i) => i + 1));
    cases.push(Array.from({ length: 50000 }, (_, i) => (i % 2) + 3));

    for (let r = 0; r < 20; r += 1) {
      const n = randomInt(rng, 1, 9);
      cases.push(Array.from({ length: n }, () => randomInt(rng, 1, 1000000000)));
    }

    for (let r = 0; r < 20; r += 1) {
      const n = randomInt(rng, 1, 100);
      cases.push(Array.from({ length: n }, () => randomInt(rng, 1, 100)));
    }

    const inputLines: string[] = [String(cases.length)];
    for (const c of cases) inputLines.push(printCase(c));

    const outputLines: string[] = cases.map((c, i) => `Case #${String(i + 1)}: ${String(solve(c))}`);

    return {
      input: `${inputLines.join("\n")}\n`,
      output: `${outputLines.join("\n")}\n`
    };
  }
};

export default generator;
