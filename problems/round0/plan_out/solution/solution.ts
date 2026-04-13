import type { ProblemSolution } from "../../../../src/contracts/problem";

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
          // Extend removed array if needed
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

const solution: ProblemSolution = (input: string): string => {
  const lines: readonly string[] = input.trim().split("\n");
  const t: number = Number(lines[0]!);
  const outputLines: string[] = [];
  let lineIndex: number = 1;

  for (let test = 1; test <= t; test++) {
    const parts = lines[lineIndex]!.trim().split(/\s+/);
    const n = Number(parts[0]!);
    const m = Number(parts[1]!);
    lineIndex++;

    const euler = new EulerianPath(n, m);
    const edges: [number, number][] = [];

    for (let i = 1; i <= m; i++) {
      const edgeParts = lines[lineIndex]!.trim().split(/\s+/);
      const u = Number(edgeParts[0]!);
      const v = Number(edgeParts[1]!);
      edges.push([u, v]);
      euler.addEdge(u, v, i);
      lineIndex++;
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

    outputLines.push(`Case #${String(test)}: ${String(cost)} ${activities.join("")}`);
  }

  return `${outputLines.join("\n")}\n`;
};

export default solution;
