import type { ProblemSolution } from "../../../../src/contracts/problem";

const PRIME = 1103;
const P1 = 1000000033;

function mulmod(a: number, b: number, m: number): number {
  // Use BigInt for multiplication to avoid overflow
  return Number((BigInt(a) * BigInt(b)) % BigInt(m));
}

function uncompress(s: string): string {
  const parts: string[] = [];
  const len = s.length;
  let i = 0;
  while (i < len) {
    let numStr = "";
    while (i < len && s[i]! >= "0" && s[i]! <= "9") {
      numStr += s[i]!;
      i += 1;
    }
    if (numStr === "") {
      parts.push(s[i]!);
      i += 1;
    } else {
      const count = parseInt(numStr, 10);
      parts.push(s[i]!.repeat(count));
      i += 1;
    }
  }
  return parts.join("");
}

function fillHash(s: string, PP: number[]): number[] {
  const l = s.length;
  const h = new Array<number>(l);
  h[0] = s.charCodeAt(0);
  for (let i = 1; i < l; i += 1) {
    h[i] = (mulmod(h[i - 1]!, PRIME, P1) + s.charCodeAt(i)) % P1;
  }
  return h;
}

function getHash(l: number, r: number, h: number[], PP: number[]): number {
  let res = h[r]!;
  if (l > 0) {
    res -= mulmod(PP[r - l + 1]!, h[l - 1]!, P1);
    if (res < 0) {
      res += P1;
    }
    res = ((res % P1) + P1) % P1;
  }
  return res;
}

const solution: ProblemSolution = (input: string): string => {
  const lines: readonly string[] = input.trim().split("\n");
  let lineIndex = 0;

  const kMaxL = 1000003;
  const PP = new Array<number>(kMaxL);
  PP[0] = 1;
  for (let i = 1; i < kMaxL; i += 1) {
    PP[i] = mulmod(PP[i - 1]!, PRIME, P1);
  }

  const t = Number(lines[lineIndex]!);
  lineIndex += 1;
  const outputLines: string[] = [];

  for (let test = 1; test <= t; test += 1) {
    const firstLine = lines[lineIndex]!.trim().split(/\s+/);
    const n = Number(firstLine[0]!);
    const k = Number(firstLine[1]!);
    lineIndex += 1;

    const a: string[] = [];
    for (let i = 0; i < n; i += 1) {
      a.push(lines[lineIndex]!.trim());
      lineIndex += 1;
    }

    if (n === 1) {
      const wordLen = uncompress(a[0]!).length;
      let res = 0;
      if (wordLen <= k) {
        res = wordLen;
      }
      outputLines.push(`Case #${String(test)}: ${String(res)}`);
      continue;
    }

    // Compute overlaps for consecutive pairs
    const b: number[][] = [];
    for (let i = 0; i < n - 1; i += 1) {
      b.push([]);
    }

    let l0 = 0;
    for (let i = 1; i < n; i += 1) {
      const prevWord = uncompress(a[i - 1]!);
      const currWord = uncompress(a[i]!);
      const PH = fillHash(prevWord, PP);
      const H = fillHash(currWord, PP);
      const l1 = PH.length;
      if (i === 1) {
        l0 = l1;
      }
      const l2 = H.length;
      const maxOverlap = Math.min(l1, l2);

      b[i - 1]!.push(l2);
      for (let j = 1; j <= maxOverlap; j += 1) {
        if (getHash(l1 - j, l1 - 1, PH, PP) !== getHash(0, j - 1, H, PP)) {
          continue;
        }
        b[i - 1]!.push(l2 - j);
      }
      b[i - 1]!.reverse();
    }

    // Now n-1 pairs, stored in b[0..n-2]
    const pairCount = n - 1;

    // Compress arithmetic progressions
    const bb: Array<{ start: number; step: number; count: number }[]> = [];
    for (let i = 0; i < pairCount; i += 1) {
      bb.push([]);
    }

    for (let i = 0; i < pairCount; i += 1) {
      const bi = b[i]!;
      const x = bi[0]!;
      l0 += x;
      const sz = bi.length;
      for (let j = 0; j < sz; j += 1) {
        bi[j] = bi[j]! - x;
      }
      if (sz === 1) {
        continue;
      }
      bb[i]!.push({ start: bi[0]!, step: bi[1]! - bi[0]!, count: 1 });
      for (let j = 2; j < sz; j += 1) {
        const diff = bi[j]! - bi[j - 1]!;
        const last = bb[i]![bb[i]!.length - 1]!;
        if (diff === last.step) {
          last.count += 1;
          continue;
        }
        bb[i]!.push({ start: bi[j - 1]!, step: diff, count: 1 });
      }
    }

    if (k < l0) {
      outputLines.push(`Case #${String(test)}: 0`);
      continue;
    }

    const mx = k - l0;
    let lim = 0;
    const f = new Uint8Array(mx + 1);
    f[0] = 1;
    let ff: Uint8Array;

    for (let i = 0; i < pairCount; i += 1) {
      const bi = b[i]!;
      lim += bi[bi.length - 1]!;
      if (lim > mx) lim = mx;
      ff = new Uint8Array(f);

      for (const cur of bb[i]!) {
        const g = new Uint8Array(lim + 1);
        for (let j = 0; j <= lim - cur.start; j += 1) {
          g[j + cur.start] = f[j]!;
        }

        // Binary lifting
        const W: number[] = [];
        let remaining = cur.count;
        let p = 1;
        while (remaining > 0) {
          W.push(Math.min(remaining, p) * cur.step);
          remaining -= Math.min(remaining, p);
          p <<= 1;
        }

        for (const w of W) {
          for (let j = lim - w; j >= cur.start; j -= 1) {
            if (g[j]!) {
              g[j + w] = 1;
            }
          }
        }

        for (let j = 1; j <= lim; j += 1) {
          if (g[j]!) {
            ff[j] = 1;
          }
        }
      }

      for (let j = 1; j <= lim; j += 1) {
        f[j] = ff[j]!;
      }
    }

    let res = l0;
    for (let i = 1; i <= mx; i += 1) {
      if (f[i]!) {
        res += l0 + i;
      }
    }

    outputLines.push(`Case #${String(test)}: ${String(res)}`);
  }

  return `${outputLines.join("\n")}\n`;
};

export default solution;
