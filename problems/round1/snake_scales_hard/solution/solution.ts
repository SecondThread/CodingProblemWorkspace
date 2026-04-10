import type { ProblemSolution } from "../../../../src/contracts/problem";

class DisjointSet {
  private readonly parent: Int32Array;
  private readonly rank: Int32Array;
  public componentCount: number;

  constructor(n: number) {
    this.parent = new Int32Array(n);
    this.rank = new Int32Array(n);
    this.componentCount = n;
    for (let i = 0; i < n; i += 1) {
      this.parent[i] = i;
    }
  }

  find(x: number): number {
    let root: number = x;
    while (this.parent[root]! !== root) {
      root = this.parent[root]!;
    }
    let current: number = x;
    while (current !== root) {
      const next: number = this.parent[current]!;
      this.parent[current] = root;
      current = next;
    }
    return root;
  }

  union(a: number, b: number): boolean {
    let ra: number = this.find(a);
    let rb: number = this.find(b);
    if (ra === rb) return false;
    if (this.rank[ra]! < this.rank[rb]!) {
      const tmp: number = ra;
      ra = rb;
      rb = tmp;
    }
    this.parent[rb] = ra;
    if (this.rank[ra]! === this.rank[rb]!) {
      this.rank[ra]! += 1;
    }
    this.componentCount -= 1;
    return true;
  }
}

const solution: ProblemSolution = (input: string): string => {
  const lines: readonly string[] = input.trim().split("\n");
  const t: number = Number(lines[0]!);
  const outputLines: string[] = [];
  let lineIndex: number = 1;

  for (let test = 1; test <= t; test += 1) {
    const n: number = Number(lines[lineIndex]!);
    lineIndex += 1;
    const a: readonly number[] = lines[lineIndex]!.split(" ").map(Number);
    lineIndex += 1;

    const events: { a: number; b: number; time: number }[] = [];

    for (let i = 0; i < n; i += 1) {
      events.push({ a: i + 1, b: 0, time: a[i]! });
    }
    for (let i = 1; i < n; i += 1) {
      events.push({ a: i, b: i + 1, time: Math.abs(a[i]! - a[i - 1]!) });
    }

    events.sort((x, y) => x.time - y.time);

    const ds: DisjointSet = new DisjointSet(n + 1);
    let ans: number = 0;
    let nextEvent: number = 0;

    while (ds.componentCount > 1) {
      const event = events[nextEvent]!;
      nextEvent += 1;
      ds.union(event.a, event.b);
      ans = event.time;
    }

    outputLines.push(`Case #${String(test)}: ${String(ans)}`);
  }

  return `${outputLines.join("\n")}\n`;
};

export default solution;
