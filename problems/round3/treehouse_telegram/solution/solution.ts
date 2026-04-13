import type { ProblemSolution } from "../../../../src/contracts/problem";

function solveCase(n: number, edges: readonly [number, number][]): string {
  // Build adjacency list
  const adj: number[][] = new Array(n + 1);
  for (let i = 0; i <= n; i += 1) adj[i] = [];
  for (const [u, v] of edges) {
    adj[u]!.push(v);
    adj[v]!.push(u);
  }

  // Euler tour + LCA via sparse table (RMQ)
  const euler: number[] = [];
  const depthEuler: number[] = [];
  const firstOcc: Int32Array = new Int32Array(n + 1);
  const tin: Int32Array = new Int32Array(n + 1);
  const tout: Int32Array = new Int32Array(n + 1);
  const depthArr: Int32Array = new Int32Array(n + 1);
  let timer = 0;

  // Iterative DFS for Euler tour
  {
    const stack: [number, number, number, number][] = [[1, 0, 0, 0]]; // [node, parent, depth, childIdx]
    while (stack.length > 0) {
      const top = stack[stack.length - 1]!;
      const u = top[0];
      const p = top[1];
      const d = top[2];
      let ci = top[3];

      if (ci === 0) {
        // First visit
        depthArr[u] = d;
        timer += 1;
        tin[u] = timer;
        firstOcc[u] = euler.length;
        euler.push(u);
        depthEuler.push(d);
      }

      const children = adj[u]!;
      // Find next child to process
      let foundChild = false;
      while (ci < children.length) {
        const v = children[ci]!;
        ci += 1;
        top[3] = ci;
        if (v !== p) {
          stack.push([v, u, d + 1, 0]);
          foundChild = true;
          break;
        }
      }

      if (!foundChild) {
        tout[u] = timer;
        stack.pop();
        // After returning from subtree, add parent back to euler
        if (stack.length > 0) {
          const parent = stack[stack.length - 1]!;
          euler.push(parent[0]);
          depthEuler.push(parent[2]);
        }
      }
    }
  }

  // Build sparse table for RMQ
  const m = euler.length;
  let logE = 1;
  while ((1 << logE) <= m) logE += 1;

  const stTable: Int32Array[] = new Array(logE);
  stTable[0] = new Int32Array(m);
  for (let i = 0; i < m; i += 1) stTable[0]![i] = i;
  for (let k = 1; k < logE; k += 1) {
    const len = 1 << k;
    const half = 1 << (k - 1);
    const prev = stTable[k - 1]!;
    const cur = new Int32Array(m);
    for (let i = 0; i + len <= m; i += 1) {
      const a = prev[i]!;
      const b = prev[i + half]!;
      cur[i] = depthEuler[a]! < depthEuler[b]! ? a : b;
    }
    stTable[k] = cur;
  }

  function rmqIndex(l: number, r: number): number {
    if (l > r) { const t = l; l = r; r = t; }
    const len = r - l + 1;
    const k = 31 - Math.clz32(len);
    const a = stTable[k]![l]!;
    const b = stTable[k]![r - (1 << k) + 1]!;
    return depthEuler[a]! < depthEuler[b]! ? a : b;
  }

  function lca(u: number, v: number): number {
    const fu = firstOcc[u]!;
    const fv = firstOcc[v]!;
    const idx = rmqIndex(fu, fv);
    return euler[idx]!;
  }

  // Mobius sieve
  const mu: Int8Array = new Int8Array(n + 1);
  mu[1] = 1;
  const mind: Int32Array = new Int32Array(n + 1);
  const primes: number[] = [];
  for (let i = 2; i <= n; i += 1) {
    if (mind[i] === 0) {
      mind[i] = i;
      primes.push(i);
      mu[i] = -1;
    }
    for (let j = 0; j < primes.length; j += 1) {
      const p = primes[j]!;
      const v = p * i;
      if (v > n) break;
      mind[v] = p;
      if (i % p === 0) {
        mu[v] = 0;
        break;
      } else {
        mu[v] = -mu[i]!;
      }
    }
  }

  // F[i] = sum of distances for pairs with gcd divisible by i
  const F: Float64Array = new Float64Array(n + 1);

  // Reusable arrays for virtual tree
  const marked: Uint8Array = new Uint8Array(n + 1);
  const vtChildren: number[][] = new Array(n + 1);
  for (let i = 0; i <= n; i += 1) vtChildren[i] = [];
  const parent: Int32Array = new Int32Array(n + 1);
  const cntMark: Int32Array = new Int32Array(n + 1);

  for (let i = 1; i <= n; i += 1) {
    // Collect multiples of i
    const nodes: number[] = [];
    for (let v = i; v <= n; v += i) nodes.push(v);
    if (nodes.length <= 1) continue;

    // Sort by tin order
    nodes.sort((a, b) => tin[a]! - tin[b]!);

    // Build vs = nodes + pairwise LCAs of adjacent nodes in tin order
    const vsSet = new Set<number>(nodes);
    for (let j = 1; j < nodes.length; j += 1) {
      vsSet.add(lca(nodes[j - 1]!, nodes[j]!));
    }
    const vs = Array.from(vsSet);
    vs.sort((a, b) => tin[a]! - tin[b]!);

    const used = vs;
    // Reset arrays for used nodes
    for (const v of used) {
      vtChildren[v]!.length = 0;
      marked[v] = 0;
      parent[v] = 0;
      cntMark[v] = 0;
    }

    // Mark original nodes
    for (const v of nodes) marked[v] = 1;
    const nodeCount = nodes.length;

    // Build virtual tree using stack
    const st: number[] = [];
    for (const v of vs) {
      while (st.length > 0 && !(tin[st[st.length - 1]!]! <= tin[v]! && tout[st[st.length - 1]!]! >= tout[v]!)) {
        st.pop();
      }
      if (st.length > 0) {
        vtChildren[st[st.length - 1]!]!.push(v);
      }
      st.push(v);
    }

    // Iterative DFS to compute order and parents
    const order: number[] = [];
    const dfsStack: number[] = [vs[0]!];
    while (dfsStack.length > 0) {
      const u = dfsStack.pop()!;
      order.push(u);
      const ch = vtChildren[u]!;
      for (let j = ch.length - 1; j >= 0; j -= 1) {
        parent[ch[j]!] = u;
        dfsStack.push(ch[j]!);
      }
    }

    // Process in reverse order
    for (let idx = order.length - 1; idx >= 0; idx -= 1) {
      const u = order[idx]!;
      let cnt = marked[u] ? 1 : 0;
      const ch = vtChildren[u]!;
      for (let j = 0; j < ch.length; j += 1) {
        cnt += cntMark[ch[j]!]!;
      }
      cntMark[u] = cnt;
      const p = parent[u]!;
      if (p !== 0) {
        const c = cnt;
        const other = nodeCount - c;
        const len = depthArr[u]! - depthArr[p]!;
        if (c > 0 && other > 0) {
          F[i] += c * other * len;
        }
      }
    }

    // Cleanup
    for (const v of used) {
      marked[v] = 0;
      vtChildren[v]!.length = 0;
    }
  }

  // Mobius inversion: G[i] = sum_{k>=1} mu[k] * F[i*k]
  const G: Float64Array = new Float64Array(n + 1);
  for (let i = 1; i <= n; i += 1) {
    let sum = 0;
    for (let k = 1; i * k <= n; k += 1) {
      const idx = i * k;
      const muK = mu[k]!;
      if (muK === 0) continue;
      if (muK === 1) sum += F[idx]!;
      else sum -= F[idx]!;
    }
    G[i] = sum;
  }

  // Output G[1..n]
  const parts: string[] = new Array(n);
  for (let i = 1; i <= n; i += 1) {
    parts[i - 1] = String(G[i]!);
  }
  return parts.join(" ");
}

const solution: ProblemSolution = (input: string): string => {
  const lines: readonly string[] = input.trim().split("\n");
  const t: number = Number(lines[0]!);
  const outputLines: string[] = [];
  let lineIndex = 1;

  for (let test = 1; test <= t; test += 1) {
    const n: number = Number(lines[lineIndex]!.trim());
    lineIndex += 1;
    const edges: [number, number][] = [];
    for (let e = 0; e < n - 1; e += 1) {
      const tokens = lines[lineIndex]!.trim().split(/\s+/);
      lineIndex += 1;
      edges.push([Number(tokens[0]!), Number(tokens[1]!)]);
    }
    const result = solveCase(n, edges);
    outputLines.push(`Case #${String(test)}: ${result}`);
  }

  return `${outputLines.join("\n")}\n`;
};

export default solution;
