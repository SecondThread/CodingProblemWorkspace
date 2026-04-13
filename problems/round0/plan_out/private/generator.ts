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

interface Edge {
  to: number;
  index: number;
  isVirtual: boolean;
}

class EulerianPath {
  adj: Edge[][];
  n: number;
  m: number;
  visited: boolean[];
  removed: boolean[];

  constructor(n: number, m: number) {
    this.n = n;
    this.m = m;
    this.adj = new Array(n + 1);
    for (let i = 0; i <= n; i++) this.adj[i] = [];
    this.visited = new Array(n + 1).fill(false);
    this.removed = new Array(n + m + 1).fill(false);
  }

  addEdge(u: number, v: number, idx: number): void {
    this.adj[u]!.push({ to: v, index: idx, isVirtual: false });
    this.adj[v]!.push({ to: u, index: idx, isVirtual: false });
  }

  findComponent(start: number): number[] {
    const component: number[] = [];
    const stack: number[] = [start];
    this.visited[start] = true;
    while (stack.length > 0) {
      const u = stack.pop()!;
      component.push(u);
      for (const edge of this.adj[u]!) {
        if (!this.visited[edge.to]) {
          this.visited[edge.to] = true;
          stack.push(edge.to);
        }
      }
    }
    return component;
  }

  findEulerCycle(start: number): Edge[] {
    const cycle: Edge[] = [];
    const s: Edge[] = [{ to: start, index: -1, isVirtual: true }];
    while (s.length > 0) {
      const curVertex = s[s.length - 1]!.to;
      const adjList = this.adj[curVertex]!;
      while (adjList.length > 0) {
        if (this.removed[adjList[adjList.length - 1]!.index]!) {
          adjList.pop();
        } else {
          break;
        }
      }
      if (adjList.length === 0) {
        cycle.push(s.pop()!);
      } else {
        const u = adjList[adjList.length - 1]!;
        this.removed[u.index] = true;
        s.push(u);
      }
    }
    return cycle;
  }

  getEulerianPaths(): number[][] {
    const allPaths: number[][] = [];
    for (let start = 1; start <= this.n; start++) {
      if (this.visited[start] || this.adj[start]!.length === 0) continue;
      const component = this.findComponent(start);
      const oddNodes: number[] = [];
      for (const u of component) {
        if (this.adj[u]!.length % 2 === 1) {
          oddNodes.push(u);
        }
      }
      for (let i = 0; i < oddNodes.length; i += 2) {
        if (i + 1 < oddNodes.length) {
          const u = oddNodes[i]!;
          const v = oddNodes[i + 1]!;
          this.m++;
          this.adj[u]!.push({ to: v, index: this.m, isVirtual: true });
          this.adj[v]!.push({ to: u, index: this.m, isVirtual: true });
          while (this.removed.length <= this.m) this.removed.push(false);
        }
      }
      const cycle = this.findEulerCycle(start);
      if (cycle.length === 0) continue;
      const paths: number[][] = [];
      let path: number[] = [];
      for (let i = 0; i + 1 < cycle.length; i++) {
        if (cycle[i]!.isVirtual) {
          paths.push(path);
          path = [];
        } else {
          path.push(cycle[i]!.index);
        }
      }
      if (paths.length === 0) {
        paths.push(path);
      } else {
        const firstPath = paths[0]!;
        for (const e of firstPath) {
          path.push(e);
        }
        paths[0] = path;
      }
      for (const p of paths) {
        allPaths.push(p);
      }
    }
    return allPaths;
  }
}

function solve(n: number, m: number, edges: [number, number][]): { cost: bigint; assignment: string } {
  const euler = new EulerianPath(n, m);
  for (let i = 1; i <= m; i++) {
    euler.addEdge(edges[i - 1]![0], edges[i - 1]![1], i);
  }

  const activities = new Array(m).fill("0");
  const paths = euler.getEulerianPaths();
  for (const path of paths) {
    let color = 1;
    for (const idx of path) {
      activities[idx - 1] = String(color);
      color = 3 - color;
    }
  }

  let cost = BigInt(0);
  const deg: [bigint, bigint][] = new Array(n + 1);
  for (let i = 0; i <= n; i++) deg[i] = [BigInt(0), BigInt(0)];

  for (let i = 0; i < m; i++) {
    const [u, v] = edges[i]!;
    if (activities[i] === "1") {
      deg[u]![0]++;
      deg[v]![0]++;
    } else {
      deg[u]![1]++;
      deg[v]![1]++;
    }
  }

  for (let j = 0; j <= 1; j++) {
    for (let i = 1; i <= n; i++) {
      cost += deg[i]![j]! * deg[i]![j]!;
    }
  }

  return { cost, assignment: activities.join("") };
}

function generateRandomGraph(
  rng: () => number,
  n: number,
  m: number
): [number, number][] {
  const edgeSet = new Set<string>();
  const edges: [number, number][] = [];
  while (edges.length < m) {
    const u = randomInt(rng, 1, n);
    const v = randomInt(rng, 1, n);
    if (u === v) continue;
    const lo = Math.min(u, v);
    const hi = Math.max(u, v);
    const key = `${lo},${hi}`;
    if (edgeSet.has(key)) continue;
    edgeSet.add(key);
    edges.push([u, v]);
  }
  return edges;
}

const generator: ProblemGenerator = {
  generate(): GeneratedCase {
    const rng = seededRandom(314159);
    const testCases: { n: number; m: number; edges: [number, number][] }[] = [];

    // Small cases (6 cases)
    for (let z = 0; z < 6; z++) {
      const n = randomInt(rng, 6, 20);
      const maxM = Math.min((n * (n - 1)) / 2, 100);
      const m = randomInt(rng, 6, maxM);
      testCases.push({ n, m, edges: generateRandomGraph(rng, n, m) });
    }

    // Medium cases (6 cases)
    for (let z = 0; z < 6; z++) {
      const n = randomInt(rng, 50, 200);
      const maxM = Math.min((n * (n - 1)) / 2, 1000);
      const m = randomInt(rng, 50, maxM);
      testCases.push({ n, m, edges: generateRandomGraph(rng, n, m) });
    }

    // Larger cases (6 cases)
    for (let z = 0; z < 6; z++) {
      const n = randomInt(rng, 200, 500);
      const maxM = Math.min((n * (n - 1)) / 2, 1000);
      const m = randomInt(rng, 200, maxM);
      testCases.push({ n, m, edges: generateRandomGraph(rng, n, m) });
    }

    // Dense small cases (5 cases)
    for (let z = 0; z < 5; z++) {
      const n = randomInt(rng, 20, 45);
      const m = (n * (n - 1)) / 2;
      testCases.push({ n, m, edges: generateRandomGraph(rng, n, m) });
    }

    // Complete graphs (5 cases)
    for (let z = 0; z < 5; z++) {
      const n = randomInt(rng, 30, 44);
      const m = (n * (n - 1)) / 2;
      const edges: [number, number][] = [];
      for (let u = 1; u <= n; u++) {
        for (let v = u + 1; v <= n; v++) {
          edges.push([u, v]);
        }
      }
      testCases.push({ n, m, edges });
    }

    // Sparse large cases (6 cases)
    for (let z = 0; z < 6; z++) {
      const n = randomInt(rng, 500, 1000);
      const m = randomInt(rng, 100, 300);
      testCases.push({ n, m, edges: generateRandomGraph(rng, n, m) });
    }

    // Medium dense (6 cases)
    for (let z = 0; z < 6; z++) {
      const n = randomInt(rng, 100, 300);
      const maxM = Math.min((n * (n - 1)) / 2, 1000);
      const m = randomInt(rng, Math.min(500, maxM), maxM);
      testCases.push({ n, m, edges: generateRandomGraph(rng, n, m) });
    }

    // Tiny edge cases (2 cases)
    // Minimum: 2 nodes, 1 edge
    testCases.push({ n: 2, m: 1, edges: [[1, 2]] });
    // Triangle
    testCases.push({ n: 3, m: 3, edges: [[1, 2], [2, 3], [1, 3]] });

    const T = testCases.length;
    const inputLines: string[] = [String(T)];
    const outputLines: string[] = [];

    for (let i = 0; i < T; i++) {
      const tc = testCases[i]!;
      inputLines.push(`${tc.n} ${tc.m}`);
      for (const [u, v] of tc.edges) {
        inputLines.push(`${u} ${v}`);
      }
      const result = solve(tc.n, tc.m, tc.edges);
      outputLines.push(`Case #${i + 1}: ${String(result.cost)} ${result.assignment}`);
    }

    return {
      input: `${inputLines.join("\n")}\n`,
      output: `${outputLines.join("\n")}\n`
    };
  }
};

export default generator;
