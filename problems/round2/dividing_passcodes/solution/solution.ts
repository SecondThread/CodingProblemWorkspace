import type { ProblemSolution } from "../../../../src/contracts/problem";

const MAXK = 25;
const MOD = 998244353;

function getOverflow(s: string, k: number): number {
  const slen = s.length;
  if (slen < k) return 0;
  let a = 0;
  for (let i = 0; i < slen; i++) {
    a = (a * 10 + (s.charCodeAt(i) - 48)) % MOD;
  }
  let b = 0;
  for (let i = 0; i < k - 1; i++) {
    b = (b * 10 + 9) % MOD;
  }
  return (a - b + MOD) % MOD;
}

// Precompute mask weights for all masks up to 2^MAXK
const maskWeight: Int32Array = new Int32Array(1 << MAXK);
for (let mask = 1; mask < (1 << MAXK); mask++) {
  maskWeight[mask] = maskWeight[mask & (mask - 1)]! + 1;
}

// Precompute cache[k][i] for k=2..MAXK
const preCache: number[][] = [];
for (let k = 0; k <= MAXK; k++) {
  preCache.push(new Array<number>(MAXK).fill(0));
}

// f9 array, inds array - used during precomputation and per-case
let f9: Int32Array;
let inds: number[] = new Array<number>(10);

function rec9(mask: number, k: number): number {
  const cached = f9[mask]!;
  if (cached !== -1) return cached;
  const x = maskWeight[mask]!;
  if (x === k) {
    f9[mask] = 1;
    return 1;
  }
  let res = 0;
  for (let ii = 1; ii <= 9; ii++) {
    const i = inds[ii]!;
    if (mask & (1 << i)) continue;
    let nmask = mask | (1 << i);
    const tail = nmask & ((1 << i) - 1);
    nmask >>>= i;
    nmask |= (tail << (k - i));
    res += rec9(nmask, k);
    if (res >= MOD) res -= MOD;
  }
  preCache[k]![k - x] = preCache[k]![k - x]! + res;
  f9[mask] = res;
  return res;
}

// Precompute cache for each k
for (let k = 2; k <= MAXK; k++) {
  f9 = new Int32Array(1 << k).fill(-1);
  for (let i = 1; i < 10; i++) inds[i] = i % k;
  for (let mask = 1; mask < (1 << k); mask += 2) rec9(mask, k);
  let val = 9;
  for (let i = 1; i < k; i++) {
    preCache[k]![i] = preCache[k]![i]! % MOD;
    preCache[k]![i] = (val - preCache[k]![i]! + MOD) % MOD;
    val = (val * 10) % MOD;
  }
}

// Per-case state
let N: number;
let K: number;
let aDigits: number[];
let f: Int32Array[];

function rec(mask: number, z: number): number {
  const cached = f[z]![mask]!;
  if (cached !== -1) return cached;
  const x = maskWeight[mask]! - 1;
  if (x === N) {
    f[z]![mask] = 1;
    return 1;
  }
  let res = 0;
  const fn = z !== 0 ? 9 : aDigits[x]!;
  for (let ii = 1; ii <= fn; ii++) {
    const i = inds[ii]!;
    if (mask & (1 << i)) continue;
    let nmask = mask | (1 << i);
    const nz = ii === fn ? z : 1;
    const tail = nmask & ((1 << i) - 1);
    nmask >>>= i;
    nmask |= (tail << (K - i));
    res += rec(nmask, nz);
    if (res >= MOD) res -= MOD;
  }
  f[z]![mask] = res;
  return res;
}

function getAns(s: string): number {
  N = s.length;
  aDigits = new Array<number>(N);
  for (let i = 0; i < N; i++) aDigits[i] = s.charCodeAt(i) - 48;
  const sz = 1 << K;
  f = [new Int32Array(sz).fill(-1), new Int32Array(sz).fill(-1)];
  let res = 0;
  for (let i = 0; i < N; i++) res = (res * 10 + aDigits[i]!) % MOD;
  let red = 0;
  for (let i = 1; i < N; i++) red = (red * 10 + 9) % MOD;
  res = (res - red + MOD) % MOD;
  inds = new Array<number>(10);
  for (let i = 1; i < 10; i++) inds[i] = i % K;
  return (res - rec(1, 0) + MOD) % MOD;
}

function solve(s: string, k: number): number {
  let res = 0;
  const slen = s.length;
  if (slen >= k) {
    res += getOverflow(s, k);
    res += preCache[k]![k - 1]!;
  } else {
    res += getAns(s);
  }
  for (let i = 1; i < Math.min(slen, k - 1); i++) {
    res += preCache[k]![i]!;
  }
  return res % MOD;
}

function reduce(s: string): string {
  const chars = s.split("");
  for (let i = chars.length - 1; i >= 0; i--) {
    if (chars[i] === "0") {
      chars[i] = "9";
    } else {
      chars[i] = String.fromCharCode(chars[i]!.charCodeAt(0) - 1);
      break;
    }
  }
  if (chars.length > 1 && chars[0] === "0") {
    chars.shift();
  }
  return chars.join("");
}

function solveCase(L: string, R: string, k: number): number {
  K = k;
  return (solve(R, k) - solve(reduce(L), k) + MOD) % MOD;
}

const solution: ProblemSolution = (input: string): string => {
  const lines = input.trim().split("\n").map((l) => l.trim());
  const T = Number(lines[0]!);
  const results: string[] = [];
  for (let t = 0; t < T; t++) {
    const parts = lines[1 + t]!.split(/\s+/);
    const L = parts[0]!;
    const R = parts[1]!;
    const k = Number(parts[2]!);
    const ans = solveCase(L, R, k);
    results.push(`Case #${String(t + 1)}: ${String(ans)}`);
  }
  return results.join("\n") + "\n";
};

export default solution;
