import type { ProblemSolution } from "../../../../src/contracts/problem";

const INVALID_MASK: bigint = -1n;

function getBit(bit: number): bigint {
  return 1n << BigInt(bit);
}

function isPow2(x: bigint): boolean {
  return x !== 0n && (x & (x - 1n)) === 0n;
}

function bitcount3(x: bigint): number {
  let res = 0;
  let v = x;
  if (v !== 0n) {
    res++;
    v &= v - 1n;
    if (v !== 0n) {
      res++;
      v &= v - 1n;
      if (v !== 0n) {
        res++;
      }
    }
  }
  return res;
}

function getMinBitMask(x: bigint): bigint {
  return x ^ (x & (x - 1n));
}

function getMaxBit(mask: bigint): number {
  if (mask === 0n) return -1;
  let l = 0;
  let r = 99;
  let res = 100;
  while (l <= r) {
    const mid = (l + r) >> 1;
    const cur = getBit(mid + 1) - 1n;
    if ((mask & cur) === mask) {
      res = mid;
      r = mid - 1;
    } else {
      l = mid + 1;
    }
  }
  return res;
}

function getMex(st: number, mask: bigint): number {
  let res = st;
  let m = mask >> BigInt(st);
  while (true) {
    // Find lowest 0 bit in lower bits of m
    for (let i = 0; i <= 100; i++) {
      if ((m & (1n << BigInt(i))) === 0n) {
        return res + i;
      }
    }
    return res + 101;
  }
}

function tryKuhn(
  x: number,
  used: { val: bigint },
  mt: number[],
  g: number[][]
): boolean {
  if ((used.val & getBit(x)) !== 0n) return false;
  used.val |= getBit(x);
  for (const y of g[x]) {
    if (mt[y] === -1 || tryKuhn(mt[y], used, mt, g)) {
      mt[y] = x;
      return true;
    }
  }
  return false;
}

function findMatching(
  g: number[][],
  mask: bigint,
  k: number,
  n: number
): number {
  const mt: number[] = new Array(k).fill(-1);
  let st = 0;
  while (true) {
    const used = { val: 0n };
    const x = getMex(st, mask);
    if (x >= n) return x;
    if (tryKuhn(x, used, mt, g)) {
      st = x + 1;
      continue;
    }
    return x;
  }
}

interface MaskPair {
  first: bigint;
  second: bigint;
}

function recBfFast(
  x: number,
  order: Array<{ minBit: bigint; ind: number }>,
  mask: bigint,
  g: number[][],
  cmasks: MaskPair[],
  n: number,
  maxMexRef: { val: number }
): void {
  if (x === order.length) {
    const k = cmasks.length;
    const res = findMatching(g, mask, k, n);
    if (res > maxMexRef.val) maxMexRef.val = res;
    return;
  }

  const minBitMask = order[x].minBit;
  const ind = order[x].ind;
  const cur: MaskPair = { first: cmasks[ind].first, second: cmasks[ind].second };

  if (cur.second === INVALID_MASK) {
    recBfFast(x + 1, order, mask | cur.first, g, cmasks, n, maxMexRef);
    return;
  }

  cur.first &= ~mask;
  cur.second &= ~mask;

  const common = cur.first & cur.second;
  mask |= common;
  cur.first ^= common;
  cur.second ^= common;

  if ((cur.first | cur.second) === (cur.first > cur.second ? cur.first : cur.second)) {
    recBfFast(x + 1, order, mask | cur.first | cur.second, g, cmasks, n, maxMexRef);
    return;
  }

  if (
    minBitMask !== 0n &&
    (mask & minBitMask) === 0n &&
    (x + 1 === order.length || order[x + 1].minBit !== order[x].minBit)
  ) {
    const mbit = getMaxBit(minBitMask);
    if (g[mbit].length === 0) {
      if ((cur.first & minBitMask) !== 0n) {
        recBfFast(x + 1, order, mask | cur.first, g, cmasks, n, maxMexRef);
        return;
      }
      if ((cur.second & minBitMask) !== 0n) {
        recBfFast(x + 1, order, mask | cur.second, g, cmasks, n, maxMexRef);
        return;
      }
    }
  }

  if (cur.first !== 0n && cur.second !== 0n && isPow2(cur.first) && isPow2(cur.second)) {
    const b1 = getMaxBit(cur.first);
    const b2 = getMaxBit(cur.second);
    g[b1].push(ind);
    g[b2].push(ind);
    recBfFast(x + 1, order, mask, g, cmasks, n, maxMexRef);
    g[b1].pop();
    g[b2].pop();
    return;
  }

  if (cur.first !== 0n && (cur.first & mask) !== cur.first) {
    recBfFast(x + 1, order, mask | cur.first, g, cmasks, n, maxMexRef);
  }

  if (cur.second !== 0n && (cur.second & mask) !== cur.second) {
    recBfFast(x + 1, order, mask | cur.second, g, cmasks, n, maxMexRef);
  }
}

function getMaxMexFast(cmasks: MaskPair[], n: number): number {
  const g: number[][] = Array.from({ length: n }, () => []);
  const k = cmasks.length;
  const maxMexRef = { val: 0 };
  const order: Array<{ minBit: bigint; ind: number }> = new Array(k);
  let stMask = 0n;

  for (let i = 0; i < k; i++) {
    order[i] = { minBit: 0n, ind: i };
    const cur: MaskPair = { first: cmasks[i].first, second: cmasks[i].second };

    if (cur.second === INVALID_MASK) {
      stMask |= cur.first;
      order[i].minBit = getBit(n);
      continue;
    }

    const common = cur.first & cur.second;
    let f = cur.first ^ common;
    let s = cur.second ^ common;
    stMask |= common;

    let bc1 = bitcount3(f);
    let bc2 = bitcount3(s);
    if (bc1 > bc2) {
      [bc1, bc2] = [bc2, bc1];
      [f, s] = [s, f];
    }

    if (bc1 === 0) {
      stMask |= s;
      order[i].minBit = getBit(n);
      continue;
    }

    if (bc1 !== 1 || bc2 > 2) {
      order[i].minBit = 0n;
      continue;
    }

    const a = getMinBitMask(f);
    const b = getMinBitMask(s);
    order[i].minBit = a < b ? a : b;
  }

  order.sort((a, b) => {
    if (a.minBit < b.minBit) return -1;
    if (a.minBit > b.minBit) return 1;
    return 0;
  });

  const nBit = getBit(n);
  while (order.length > 0 && order[order.length - 1].minBit === nBit) {
    order.pop();
  }

  recBfFast(0, order, stMask, g, cmasks, n, maxMexRef);
  return maxMexRef.val;
}

function predfs(
  x: number,
  p: number,
  par: number[],
  ttRef: { val: number },
  tin: number[],
  adj: number[][]
): void {
  // Iterative DFS to avoid stack overflow
  const stack: Array<{ node: number; parent: number; childIdx: number }> = [];
  stack.push({ node: x, parent: p, childIdx: 0 });
  par[x] = p;
  tin[x] = ttRef.val++;

  while (stack.length > 0) {
    const top = stack[stack.length - 1];
    if (top.childIdx >= adj[top.node].length) {
      stack.pop();
      continue;
    }
    const y = adj[top.node][top.childIdx];
    top.childIdx++;
    if (par[y] !== -1) continue;
    par[y] = top.node;
    tin[y] = ttRef.val++;
    stack.push({ node: y, parent: top.node, childIdx: 0 });
  }
}

function prebuild(root: number, n: number, adj: number[][]): number[] {
  const par1 = new Array(n).fill(-1);
  const tin1 = new Array(n).fill(-1);
  const ttRef = { val: 0 };
  predfs(root, root, par1, ttRef, tin1, adj);

  // Reverse adjacency lists
  for (let i = 0; i < n; i++) adj[i].reverse();
  const par2 = new Array(n).fill(-1);
  const tin2 = new Array(n).fill(-1);
  predfs(root, root, par2, ttRef, tin2, adj);
  // Reverse back
  for (let i = 0; i < n; i++) adj[i].reverse();

  const par = new Array(n).fill(-1);
  for (let i = 0; i < n; i++) {
    let p = par1[i];
    if (tin1[p] > tin1[par2[i]]) {
      p = par2[i];
    }
    if (tin1[p] < tin1[i] && tin2[p] < tin2[i]) {
      par[i] = p;
    }
  }
  return par;
}

function dfs(
  startX: number,
  startP: number,
  startMask: bigint,
  vmasks: MaskPair[],
  was: Set<string>,
  par: number[],
  adj: number[][],
  a: number[]
): void {
  // Iterative DFS
  const stack: Array<{
    x: number;
    p: number;
    mask: bigint;
    childIdx: number;
  }> = [];

  const edgeKey = (x: number, p: number): string => `${x},${p}`;

  if (was.has(edgeKey(startX, startP))) return;
  was.add(edgeKey(startX, startP));

  let mask = startMask | getBit(a[startX]);
  if (vmasks[startX].first === INVALID_MASK) {
    vmasks[startX].first = mask;
  } else {
    vmasks[startX].second = mask;
  }

  stack.push({ x: startX, p: startP, mask, childIdx: 0 });

  while (stack.length > 0) {
    const top = stack[stack.length - 1];
    if (top.childIdx >= adj[top.x].length) {
      stack.pop();
      continue;
    }

    const y = adj[top.x][top.childIdx];
    top.childIdx++;

    if (y === top.p || y === par[top.x]) continue;

    const ek = edgeKey(y, top.x);
    if (was.has(ek)) continue;
    was.add(ek);

    const nmask = top.x === par[y] ? 0n : top.mask;
    const ymask = nmask | getBit(a[y]);

    if (vmasks[y].first === INVALID_MASK) {
      vmasks[y].first = ymask;
    } else {
      vmasks[y].second = ymask;
    }

    stack.push({ x: y, p: top.x, mask: ymask, childIdx: 0 });
  }
}

function dfsRecFast(
  root: number,
  adj: number[][],
  vmasks: MaskPair[],
  par: number[],
  n: number
): number {
  let res = 0;
  const wasArr = new Array(n).fill(0);
  const cmasks: MaskPair[] = [];

  // Iterative DFS
  const stack: Array<{
    x: number;
    childIdx: number;
    pushed: boolean;
  }> = [];

  wasArr[root] = 1;
  stack.push({ x: root, childIdx: 0, pushed: false });

  while (stack.length > 0) {
    const top = stack[stack.length - 1];

    // On first visit of node (after entering), compute f if x > root
    if (!top.pushed) {
      top.pushed = true;
      if (top.x > root) {
        cmasks.push({ first: vmasks[top.x].first, second: vmasks[top.x].second });
        res += getMaxMexFast(cmasks, n);
        cmasks.pop();
      }
    }

    if (top.childIdx >= adj[top.x].length) {
      stack.pop();
      // On pop, if the parent pushed cmask for this edge, pop it
      continue;
    }

    const y = adj[top.x][top.childIdx];
    top.childIdx++;

    if (wasArr[y]) continue;
    wasArr[y] = 1;

    if (top.x === par[y]) {
      cmasks.push({ first: vmasks[top.x].first, second: vmasks[top.x].second });
    }

    stack.push({ x: y, childIdx: 0, pushed: false });
  }

  // We need to handle cmask pops properly. The iterative approach above doesn't
  // correctly handle the push/pop of cmasks on the stack. Let me use recursive instead
  // since N <= 100, stack depth is bounded.
  return res;
}

// Use recursive approach since N <= 100
function dfsRecFastRecursive(
  x: number,
  root: number,
  cmasks: MaskPair[],
  vmasks: MaskPair[],
  par: number[],
  wasArr: number[],
  adj: number[][],
  n: number
): number {
  wasArr[x] = 1;
  let res = 0;

  if (x > root) {
    cmasks.push({ first: vmasks[x].first, second: vmasks[x].second });
    res += getMaxMexFast(cmasks, n);
    cmasks.pop();
  }

  for (const y of adj[x]) {
    if (wasArr[y]) continue;
    if (x === par[y]) {
      cmasks.push({ first: vmasks[x].first, second: vmasks[x].second });
    }
    res += dfsRecFastRecursive(y, root, cmasks, vmasks, par, wasArr, adj, n);
    if (x === par[y]) {
      cmasks.pop();
    }
  }

  return res;
}

function solveFast(n: number, a: number[], adj: number[][]): number {
  let res = 0;
  for (let root = 0; root < n - 1; root++) {
    const par = prebuild(root, n, adj);
    const vmasks: MaskPair[] = Array.from({ length: n }, () => ({
      first: INVALID_MASK,
      second: INVALID_MASK,
    }));
    const swas = new Set<string>();
    dfs(root, root, getBit(a[root]), vmasks, swas, par, adj, a);
    const wasArr = new Array(n).fill(0);
    const cmasks: MaskPair[] = [];
    res += dfsRecFastRecursive(root, root, cmasks, vmasks, par, wasArr, adj, n);
  }
  return res;
}

const solution: ProblemSolution = (input: string): string => {
  const lines = input.trim().split("\n");
  let idx = 0;
  const t = Number(lines[idx++]);
  const outputLines: string[] = [];

  for (let tc = 1; tc <= t; tc++) {
    const [nStr, mStr] = lines[idx++].trim().split(/\s+/);
    const n = Number(nStr);
    const m = Number(mStr);
    const a = lines[idx++].trim().split(/\s+/).map(Number);
    const adj: number[][] = Array.from({ length: n }, () => []);

    for (let i = 0; i < m; i++) {
      const [xStr, yStr] = lines[idx++].trim().split(/\s+/);
      const x = Number(xStr) - 1;
      const y = Number(yStr) - 1;
      adj[x].push(y);
      adj[y].push(x);
    }

    const result = solveFast(n, a, adj);
    outputLines.push(`Case #${tc}: ${result}`);
  }

  return outputLines.join("\n") + "\n";
};

export default solution;
