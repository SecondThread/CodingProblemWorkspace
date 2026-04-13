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

function shuffle<T>(arr: T[], rng: () => number): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(rng, 0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

interface TestCase {
  readonly n: number;
  readonly edges: ReadonlyArray<[number, number]>;
  readonly c: readonly number[];
}

/**
 * Generate a random cactus graph with n nodes.
 * Strategy: build a random spanning tree, then add back-edges to create cycles,
 * ensuring no two cycles share an edge (cactus property).
 */
function generateCactus(
  rng: () => number,
  n: number,
  extraEdges: number
): { edges: [number, number][]; adj: number[][] } {
  const adj: number[][] = Array.from({ length: n }, () => []);
  const edges: [number, number][] = [];

  // Build a random spanning tree using random permutation
  const perm = Array.from({ length: n }, (_, i) => i);
  shuffle(perm, rng);

  // Each node (except first) connects to a random earlier node in perm order
  for (let i = 1; i < n; i++) {
    const parent = perm[randomInt(rng, 0, i - 1)];
    const child = perm[i];
    edges.push([Math.min(parent, child) + 1, Math.max(parent, child) + 1]);
    adj[parent].push(child);
    adj[child].push(parent);
  }

  // Track which edges are "on a cycle" to enforce cactus property
  // In a cactus, each edge is on at most one cycle.
  // When we add a back-edge (u,v), all tree edges on the path u->v become part of a cycle.
  // We need to ensure no tree edge is used in two different cycles.

  // Compute parent/depth arrays for the tree
  const parentArr = new Array(n).fill(-1);
  const depth = new Array(n).fill(0);
  const queue = [perm[0]];
  const visited = new Array(n).fill(false);
  visited[perm[0]] = true;

  let qi = 0;
  while (qi < queue.length) {
    const cur = queue[qi++];
    for (const nb of adj[cur]) {
      if (!visited[nb]) {
        visited[nb] = true;
        parentArr[nb] = cur;
        depth[nb] = depth[cur] + 1;
        queue.push(nb);
      }
    }
  }

  const onCycle = new Set<string>();
  const edgeSet = new Set<string>();
  for (const [u, v] of edges) {
    edgeSet.add(`${Math.min(u, v)},${Math.max(u, v)}`);
  }

  function edgeKey(a: number, b: number): string {
    return `${Math.min(a, b)},${Math.max(a, b)}`;
  }

  // Try to add extra edges
  let added = 0;
  let attempts = 0;
  const maxAttempts = extraEdges * 20;

  while (added < extraEdges && attempts < maxAttempts) {
    attempts++;
    const u = randomInt(rng, 0, n - 1);
    const v = randomInt(rng, 0, n - 1);
    if (u === v) continue;

    const ek = edgeKey(u + 1, v + 1);
    if (edgeSet.has(ek)) continue;

    // Find path from u to v in tree and check if any edge is already on a cycle
    let a = u;
    let b = v;
    const pathEdges: string[] = [];
    let valid = true;

    while (a !== b) {
      if (depth[a] > depth[b]) {
        const pe = edgeKey(a, parentArr[a]);
        if (onCycle.has(pe)) { valid = false; break; }
        pathEdges.push(pe);
        a = parentArr[a];
      } else {
        const pe = edgeKey(b, parentArr[b]);
        if (onCycle.has(pe)) { valid = false; break; }
        pathEdges.push(pe);
        b = parentArr[b];
      }
    }

    if (!valid) continue;

    // All edges on path are free, add this back-edge
    for (const pe of pathEdges) {
      onCycle.add(pe);
    }
    edgeSet.add(ek);
    edges.push([Math.min(u, v) + 1, Math.max(u, v) + 1]);
    adj[u].push(v);
    adj[v].push(u);
    added++;
  }

  return { edges, adj };
}

function generateRandomC(rng: () => number, n: number): number[] {
  return Array.from({ length: n }, () => randomInt(rng, 0, n - 1));
}

/** Generate a tree (no cycles) */
function generateTree(rng: () => number, n: number): TestCase {
  const { edges } = generateCactus(rng, n, 0);
  const c = generateRandomC(rng, n);
  return { n, edges, c };
}

/** Generate a single cycle of size n */
function generateSingleCycle(rng: () => number, n: number): TestCase {
  const edges: [number, number][] = [];
  const perm = Array.from({ length: n }, (_, i) => i);
  shuffle(perm, rng);

  for (let i = 0; i < n; i++) {
    const u = perm[i] + 1;
    const v = perm[(i + 1) % n] + 1;
    edges.push([Math.min(u, v), Math.max(u, v)]);
  }

  const c = generateRandomC(rng, n);
  return { n, edges, c };
}

/** Generate a chain of small cycles (like a caterpillar of cycles) */
function generateChainOfCycles(rng: () => number, n: number): TestCase {
  const adj: number[][] = Array.from({ length: n }, () => []);
  const edges: [number, number][] = [];
  const edgeSet = new Set<string>();

  function addEdge(u: number, v: number): void {
    const key = `${Math.min(u, v)},${Math.max(u, v)}`;
    if (edgeSet.has(key)) return;
    edgeSet.add(key);
    edges.push([Math.min(u, v) + 1, Math.max(u, v) + 1]);
    adj[u].push(v);
    adj[v].push(u);
  }

  let pos = 0;
  while (pos < n - 1) {
    const cycleSize = Math.min(randomInt(rng, 3, 6), n - pos);
    if (cycleSize < 3) {
      // Just add remaining as tree edge
      addEdge(pos, pos + 1);
      pos++;
      continue;
    }
    // Create cycle: pos, pos+1, ..., pos+cycleSize-1, back to pos
    for (let i = 0; i < cycleSize - 1; i++) {
      addEdge(pos + i, pos + i + 1);
    }
    addEdge(pos + cycleSize - 1, pos);
    pos += cycleSize - 1; // Overlap by one node
  }

  // Ensure connectivity
  const visited = new Array(n).fill(false);
  const queue = [0];
  visited[0] = true;
  let qi = 0;
  while (qi < queue.length) {
    const cur = queue[qi++];
    for (const nb of adj[cur]) {
      if (!visited[nb]) {
        visited[nb] = true;
        queue.push(nb);
      }
    }
  }
  for (let i = 0; i < n; i++) {
    if (!visited[i]) {
      // Connect isolated node to previous
      addEdge(i - 1, i);
    }
  }

  const c = generateRandomC(rng, n);
  return { n, edges, c };
}

function generateRandomCactus(rng: () => number, n: number): TestCase {
  const extraEdges = randomInt(rng, 0, Math.floor(n / 3));
  const { edges } = generateCactus(rng, n, extraEdges);
  const c = generateRandomC(rng, n);
  return { n, edges, c };
}

function formatCase(tc: TestCase): string {
  const lines: string[] = [];
  lines.push(`${String(tc.n)} ${String(tc.edges.length)}`);
  lines.push(tc.c.join(" "));
  for (const [u, v] of tc.edges) {
    lines.push(`${String(u)} ${String(v)}`);
  }
  return lines.join("\n");
}

const generator: ProblemGenerator = {
  async generate(): Promise<GeneratedCase> {
    const rng = seededRandom(77742);
    const cases: TestCase[] = [];

    // 4 sample cases (from problem statement)
    cases.push({
      n: 4,
      edges: [[1, 2], [2, 3], [3, 1], [4, 2]],
      c: [0, 1, 2, 0],
    });
    cases.push({
      n: 6,
      edges: [[1, 2], [1, 3], [2, 4], [3, 4], [4, 5], [5, 6], [6, 4]],
      c: [0, 1, 2, 4, 3, 1],
    });
    cases.push({
      n: 3,
      edges: [[1, 2], [2, 3]],
      c: [1, 0, 2],
    });
    cases.push({
      n: 6,
      edges: [[1, 2], [2, 3], [3, 4], [2, 4], [3, 5], [6, 4]],
      c: [0, 1, 2, 1, 0, 0],
    });

    // Small random cactus graphs (N=3..10)
    for (let i = 0; i < 15; i++) {
      const n = randomInt(rng, 3, 10);
      cases.push(generateRandomCactus(rng, n));
    }

    // Small trees
    for (let i = 0; i < 5; i++) {
      const n = randomInt(rng, 3, 10);
      cases.push(generateTree(rng, n));
    }

    // Small single cycles
    for (let i = 0; i < 5; i++) {
      const n = randomInt(rng, 3, 10);
      cases.push(generateSingleCycle(rng, n));
    }

    // Medium random cactus graphs (N=20..50)
    for (let i = 0; i < 15; i++) {
      const n = randomInt(rng, 20, 50);
      cases.push(generateRandomCactus(rng, n));
    }

    // Medium trees
    for (let i = 0; i < 5; i++) {
      const n = randomInt(rng, 20, 50);
      cases.push(generateTree(rng, n));
    }

    // Medium chain of cycles
    for (let i = 0; i < 5; i++) {
      const n = randomInt(rng, 20, 50);
      cases.push(generateChainOfCycles(rng, n));
    }

    // Large cactus graphs (N=80..100)
    for (let i = 0; i < 15; i++) {
      const n = randomInt(rng, 80, 100);
      cases.push(generateRandomCactus(rng, n));
    }

    // Large trees
    for (let i = 0; i < 5; i++) {
      const n = randomInt(rng, 80, 100);
      cases.push(generateTree(rng, n));
    }

    // Large single cycles
    for (let i = 0; i < 3; i++) {
      const n = randomInt(rng, 80, 100);
      cases.push(generateSingleCycle(rng, n));
    }

    // Large chain of cycles
    for (let i = 0; i < 5; i++) {
      const n = randomInt(rng, 80, 100);
      cases.push(generateChainOfCycles(rng, n));
    }

    // Edge case: all same C values
    cases.push({
      n: 5,
      edges: [[1, 2], [2, 3], [3, 4], [4, 5]],
      c: [0, 0, 0, 0, 0],
    });

    // Edge case: C values are a permutation
    cases.push({
      n: 5,
      edges: [[1, 2], [2, 3], [3, 4], [4, 5], [5, 1]],
      c: [0, 1, 2, 3, 4],
    });

    const inputLines: string[] = [String(cases.length)];
    for (const c of cases) {
      inputLines.push(formatCase(c));
    }

    const input = inputLines.join("\n") + "\n";
    const output = await Promise.resolve(solution(input));

    return { input, output };
  }
};

export default generator;
