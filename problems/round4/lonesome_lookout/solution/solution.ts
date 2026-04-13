import type { ProblemSolution } from "../../../../src/contracts/problem";

const MOD = 1000000007n;
const MOD_NUM = 1000000007;

function pw(a: bigint, n: bigint): bigint {
  a = ((a % MOD) + MOD) % MOD;
  let result = 1n;
  while (n > 0n) {
    if (n & 1n) result = result * a % MOD;
    a = a * a % MOD;
    n >>= 1n;
  }
  return result;
}

// FFT with complex numbers (doubles)
function fft(reArr: Float64Array, imArr: Float64Array, inv: boolean): void {
  const n = reArr.length;
  let j = 0;
  for (let i = 1; i < n; i++) {
    let bit = n >> 1;
    while (j >= bit) {
      j -= bit;
      bit >>= 1;
    }
    j += bit;
    if (i < j) {
      let tmp = reArr[i]!; reArr[i] = reArr[j]!; reArr[j] = tmp;
      tmp = imArr[i]!; imArr[i] = imArr[j]!; imArr[j] = tmp;
    }
  }

  const ang = 2 * Math.PI / n * (inv ? -1 : 1);
  const rootsRe = new Float64Array(n >> 1);
  const rootsIm = new Float64Array(n >> 1);
  for (let i = 0; i < (n >> 1); i++) {
    rootsRe[i] = Math.cos(ang * i);
    rootsIm[i] = Math.sin(ang * i);
  }

  for (let len = 2; len <= n; len <<= 1) {
    const step = n / len;
    const half = len >> 1;
    for (let jj = 0; jj < n; jj += len) {
      for (let k = 0; k < half; k++) {
        const idx = step * k;
        const wRe = rootsRe[idx]!;
        const wIm = rootsIm[idx]!;
        const p = jj + k;
        const q = p + half;
        const vRe = reArr[q]! * wRe - imArr[q]! * wIm;
        const vIm = reArr[q]! * wIm + imArr[q]! * wRe;
        reArr[q] = reArr[p]! - vRe;
        imArr[q] = imArr[p]! - vIm;
        reArr[p] = reArr[p]! + vRe;
        imArr[p] = imArr[p]! + vIm;
      }
    }
  }

  if (inv) {
    for (let i = 0; i < n; i++) {
      reArr[i] /= n;
      imArr[i] /= n;
    }
  }
}

function multiply(v: bigint[], w: bigint[]): bigint[] {
  let n = 2;
  while (n < v.length + w.length) n <<= 1;

  // Split each value: val = hi * N + lo where N = sqrt(MOD) + 1
  const N = 31624; // ~sqrt(10^9+7) + 1

  // v1 = (hi_v, lo_v), v2 = (hi_w, lo_w)
  const v1Re = new Float64Array(n);
  const v1Im = new Float64Array(n);
  const v2Re = new Float64Array(n);
  const v2Im = new Float64Array(n);

  for (let i = 0; i < v.length; i++) {
    const val = Number(v[i]!);
    v1Re[i] = Math.floor(val / N);
    v1Im[i] = val % N;
  }
  for (let i = 0; i < w.length; i++) {
    const val = Number(w[i]!);
    v2Re[i] = Math.floor(val / N);
    v2Im[i] = val % N;
  }

  fft(v1Re, v1Im, false);
  fft(v2Re, v2Im, false);

  const r1Re = new Float64Array(n);
  const r1Im = new Float64Array(n);
  const r2Re = new Float64Array(n);
  const r2Im = new Float64Array(n);

  for (let i = 0; i < n; i++) {
    const j2 = i === 0 ? 0 : n - i;
    // ans1 = (v1 + conj(v1[j])) / 2  -> real parts (hi of v)
    const a1Re = (v1Re[i]! + v1Re[j2]!) * 0.5;
    const a1Im = (v1Im[i]! - v1Im[j2]!) * 0.5;
    // ans2 = (v1 - conj(v1[j])) / (2i) -> imag parts (lo of v)
    const a2Re = (v1Im[i]! + v1Im[j2]!) * 0.5;
    const a2Im = -(v1Re[i]! - v1Re[j2]!) * 0.5;
    // ans3 = (v2 + conj(v2[j])) / 2
    const a3Re = (v2Re[i]! + v2Re[j2]!) * 0.5;
    const a3Im = (v2Im[i]! - v2Im[j2]!) * 0.5;
    // ans4 = (v2 - conj(v2[j])) / (2i)
    const a4Re = (v2Im[i]! + v2Im[j2]!) * 0.5;
    const a4Im = -(v2Re[i]! - v2Re[j2]!) * 0.5;

    // r1 = a1*a3 + a1*a4 * i
    const prodACRe = a1Re * a3Re - a1Im * a3Im;
    const prodACIm = a1Re * a3Im + a1Im * a3Re;
    const prodADRe = a1Re * a4Re - a1Im * a4Im;
    const prodADIm = a1Re * a4Im + a1Im * a4Re;
    r1Re[i] = prodACRe - prodADIm;
    r1Im[i] = prodACIm + prodADRe;

    // r2 = a2*a3 + a2*a4 * i
    const prodBCRe = a2Re * a3Re - a2Im * a3Im;
    const prodBCIm = a2Re * a3Im + a2Im * a3Re;
    const prodBDRe = a2Re * a4Re - a2Im * a4Im;
    const prodBDIm = a2Re * a4Im + a2Im * a4Re;
    r2Re[i] = prodBCRe - prodBDIm;
    r2Im[i] = prodBCIm + prodBDRe;
  }

  fft(r1Re, r1Im, true);
  fft(r2Re, r2Im, true);

  const sz = v.length + w.length - 1;
  const ret: bigint[] = new Array(sz);
  const Nbig = BigInt(N);
  for (let i = 0; i < sz; i++) {
    let av = BigInt(Math.round(r1Re[i]!)) % MOD;
    let bv = (BigInt(Math.round(r1Im[i]!)) + BigInt(Math.round(r2Re[i]!))) % MOD;
    let cv = BigInt(Math.round(r2Im[i]!)) % MOD;
    let val = ((av * Nbig % MOD * Nbig % MOD) + (bv * Nbig % MOD) + cv) % MOD;
    val = ((val % MOD) + MOD) % MOD;
    ret[i] = val;
  }
  return ret;
}

const solution: ProblemSolution = (input: string): string => {
  const lines = input.trim().split("\n");
  let lineIdx = 0;

  const MAXN = 1000001;
  const fact = new Array<bigint>(MAXN);
  const inv = new Array<bigint>(MAXN);
  fact[0] = 1n;
  inv[0] = 1n;
  for (let i = 1; i < MAXN; i++) {
    fact[i] = fact[i - 1]! * BigInt(i) % MOD;
    inv[i] = pw(fact[i]!, MOD - 2n);
  }

  function combi(n: number, k: number): bigint {
    if (n < k || k < 0) return 0n;
    return fact[n]! * inv[k]! % MOD * inv[n - k]! % MOD;
  }

  const t = Number(lines[lineIdx++]!);
  const results: string[] = [];

  for (let z = 1; z <= t; z++) {
    const parts = lines[lineIdx++]!.split(/\s+/);
    const R = Number(parts[0]!);
    const C = Number(parts[1]!);
    const N = Number(parts[2]!);

    const cntRookRow = new Int32Array(R + 1);
    const cntRookCol = new Int32Array(C + 1);
    const rooks: [number, number][] = [];

    for (let i = 0; i < N; i++) {
      const rp = lines[lineIdx++]!.split(/\s+/);
      const x = Number(rp[0]!);
      const y = Number(rp[1]!);
      rooks.push([x, y]);
      cntRookRow[x]++;
      cntRookCol[y]++;
    }

    // Count defensive rooks (lonesome in initial config)
    let u = 0;
    const nonDefRows = new Set<number>();
    const nonDefCols = new Set<number>();
    for (const [x, y] of rooks) {
      if (cntRookRow[x] === 1 && cntRookCol[y] === 1) {
        u++;
      } else {
        nonDefRows.add(x);
        nonDefCols.add(y);
      }
    }

    const n1 = nonDefRows.size;
    const m1 = nonDefCols.size;
    const n2 = R - u - n1;
    const m2 = C - u - m1;

    const p = Math.min(R, C);

    // Build polynomials A and B
    const A: bigint[] = new Array(p + 1);
    const B: bigint[] = new Array(p + 1);
    for (let i = 0; i <= p; i++) {
      A[i] = pw(2n, BigInt(i)) * combi(u, i) % MOD;
      B[i] = combi(n2, i) * combi(m2, i) % MOD * fact[i]! % MOD;
    }

    const mul = multiply(A, B);

    // g[k] = 2^((n-k)*(m-k) - q) * mul[k]
    const g: bigint[] = new Array(p + 1);
    for (let k = 0; k <= p; k++) {
      const r = (R - k) * (C - k) - N;
      if (r >= 0) {
        g[k] = pw(2n, BigInt(r)) * mul[k]! % MOD;
      } else {
        const val = pw(2n, BigInt(-r));
        g[k] = pw(val, MOD - 2n) * mul[k]! % MOD;
      }
    }

    // Mobius inversion via convolution
    // D[i] = fact[p-i] * g[p-i]
    // E[i] = (-1)^i / i!
    const D: bigint[] = new Array(p + 1);
    const E: bigint[] = new Array(p + 1);
    for (let i = 0; i <= p; i++) {
      D[i] = fact[p - i]! * g[p - i]! % MOD;
      E[i] = inv[i]!;
      if (i % 2 === 1) E[i] = (MOD - E[i]!) % MOD;
    }

    const CC = multiply(D, E);

    const f: bigint[] = new Array(p + 1);
    for (let i = 0; i <= p; i++) {
      f[i] = CC[p - i]! * inv[i]! % MOD;
    }

    // Compute XOR of g(k) = (f(k) + 1220) * (k + 2025)
    let res = 0n;
    for (let i = 0; i <= p; i++) {
      res ^= (f[i]! + 1220n) * BigInt(i + 2025);
    }

    results.push(`Case #${z}: ${res}`);
  }

  return results.join("\n") + "\n";
};

export default solution;
