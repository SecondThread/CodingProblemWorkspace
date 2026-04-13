import type { ProblemSolution } from "../../../../src/contracts/problem";

const solution: ProblemSolution = (input: string): string => {
  const lines = input.trim().split("\n");
  let ptr = 0;
  const T = Number(lines[ptr++]!);
  const results: string[] = [];

  for (let tn = 1; tn <= T; tn++) {
    const n = Number(lines[ptr++]!);
    const aTokens = lines[ptr++]!.trim().split(/\s+/);
    const bTokens = lines[ptr++]!.trim().split(/\s+/);

    // 0-indexed arrays of length n
    const a: number[] = new Array(n);
    for (let i = 0; i < n; i++) a[i] = Number(aTokens[i]!);

    const b: number[] = new Array(n);
    for (let i = 0; i < n; i++) b[i] = Number(bTokens[i]!);

    // prefix sums for a (0-indexed)
    const s: number[] = new Array(n);
    s[0] = a[0]!;
    for (let i = 1; i < n; i++) s[i] = s[i - 1]! + a[i]!;

    function getSum(l: number, r: number): number {
      if (l > r) return 0;
      let res = s[r]!;
      if (l > 0) res -= s[l - 1]!;
      return res;
    }

    // f[x] = memoized result of rec(x). -2 means uncomputed, -1 means impossible.
    const f: number[] = new Array(n + 1).fill(-2);

    function rec(x: number): number {
      if (f[x] !== -2) return f[x]!;

      const lastind = n - x;
      let mxind = -1;

      for (let i = 0; i < n; i++) {
        // b[i] <= i - lastind + 1 means lamp i is already satisfied
        if (b[i]! <= i - lastind + 1) continue;
        if (mxind === -1 || b[mxind]! < b[i]!) {
          mxind = i;
        }
      }

      if (mxind === -1) {
        f[x] = 0;
        return 0;
      }

      if (b[mxind]! > mxind + 1) {
        f[x] = -1;
        return -1;
      }

      const len = b[mxind]!;
      let res = -1;

      for (let l = 0; l + len - 1 <= mxind; l++) {
        let r = l + len - 1;
        r = Math.min(r, lastind - 1);
        const cur = rec(n - l);
        if (cur === -1) continue;
        const total = cur + getSum(l, r);
        if (res === -1 || total < res) {
          res = total;
        }
      }

      f[x] = res;
      return res;
    }

    const res = rec(0);
    results.push(`Case #${String(tn)}: ${String(res)}`);
  }

  return results.join("\n");
};

export default solution;
