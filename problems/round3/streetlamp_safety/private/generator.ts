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

function randomLong(rng: () => number, min: number, max: number): number {
  // For large ranges, combine two calls for better distribution
  if (max - min < 0x100000000) {
    return Math.floor(rng() * (max - min + 1)) + min;
  }
  const hi = Math.floor(rng() * 0x10000);
  const lo = Math.floor(rng() * 0x10000);
  const combined = hi * 0x10000 + lo;
  return min + (combined % (max - min + 1));
}

/**
 * Partition totalN into count positive parts, each <= maxPart.
 * Retry if any part exceeds maxPart.
 */
function partition(rng: () => number, count: number, totalN: number, maxPart: number): number[] {
  for (let attempt = 0; attempt < 10000; attempt++) {
    // Generate count-1 cut points in [1, totalN-1], sort, take differences
    const cuts: number[] = [];
    for (let i = 0; i < count - 1; i++) {
      cuts.push(randomInt(rng, 1, totalN - 1));
    }
    cuts.sort((a, b) => a - b);

    const parts: number[] = [];
    let prev = 0;
    for (const c of cuts) {
      parts.push(c - prev);
      prev = c;
    }
    parts.push(totalN - prev);

    let ok = true;
    for (const p of parts) {
      if (p < 1 || p > maxPart) {
        ok = false;
        break;
      }
    }
    if (ok) return parts;
  }
  // Fallback: equal distribution
  const parts: number[] = new Array(count).fill(Math.floor(totalN / count));
  let rem = totalN - parts.reduce((a, b) => a + b, 0);
  for (let i = 0; i < rem; i++) parts[i]! += 1;
  return parts;
}

interface CaseData {
  n: number;
  a: number[]; // 1-indexed (index 0 unused)
  b: number[]; // 1-indexed (index 0 unused)
}

function genCase(rng: () => number, n: number, type: number): CaseData {
  // Fallback guards
  if (type === 3 && n < 2) type = 0;
  if (type === 6 && n < 12) type = 0;
  if (type === 7 && n < 4) type = 0;
  if (type === 8 && n < 3) type = 0;

  const a: number[] = new Array(n + 1).fill(0);
  const b: number[] = new Array(n + 1).fill(0);

  switch (type) {
    case 0: {
      // Fully random
      for (let i = 1; i <= n; i++) {
        a[i] = randomLong(rng, 1, 1000000000);
        b[i] = randomInt(rng, 0, i);
      }
      break;
    }
    case 1: {
      // All b[i] = 0
      for (let i = 1; i <= n; i++) {
        a[i] = randomLong(rng, 1, 1000000000);
        b[i] = 0;
      }
      break;
    }
    case 2: {
      // Roughly non-decreasing b
      let cur = 0;
      for (let i = 1; i <= n; i++) {
        a[i] = randomLong(rng, 1, 1000000000);
        if (cur < i && randomInt(rng, 0, 1) === 1) cur++;
        b[i] = cur;
      }
      break;
    }
    case 3: {
      // One big spike, cheap segment
      const segs = randomInt(rng, 2, Math.min(6, n));
      const lens = partition(rng, segs, n, n);
      let pos = 1;
      const cheapSeg = randomInt(rng, 0, segs - 1);
      for (let s = 0; s < segs; s++) {
        for (let k = 0; k < lens[s]!; k++) {
          const i = pos + k;
          if (s === cheapSeg) {
            a[i] = randomLong(rng, 1, 1000);
          } else {
            a[i] = randomLong(rng, 1000000, 1000000000);
          }
        }
        pos += lens[s]!;
      }
      const spikePos = randomInt(rng, 1, n);
      const spikeLen = randomInt(rng, Math.max(2, Math.floor(n / 3)), n);
      for (let i = 1; i <= n; i++) {
        if (i === spikePos) {
          b[i] = Math.min(spikeLen, i);
        } else {
          const hi = Math.min(i, 3);
          b[i] = randomInt(rng, 0, hi);
        }
      }
      break;
    }
    case 4: {
      // Cheap ends, expensive middle, two spikes
      let midL = Math.max(2, Math.floor(n / 3));
      let midR = Math.min(n - 1, n - Math.floor(n / 3));
      for (let i = 1; i <= n; i++) {
        if (i >= midL && i <= midR) {
          a[i] = randomLong(rng, 500000000, 1000000000);
        } else {
          a[i] = randomLong(rng, 1, 1000);
        }
      }
      const leftHi = Math.max(1, midL - 1);
      const leftPos = randomInt(rng, 1, leftHi);
      const rightLo = Math.max(midR + 1, 1);
      const rightPos = randomInt(rng, rightLo, n);
      const leftLenHi = Math.max(2, Math.max(1, midL - 1));
      const leftLen = randomInt(rng, 2, leftLenHi);
      const rightLenHi = Math.max(2, Math.max(1, n - midR));
      const rightLen = randomInt(rng, 2, rightLenHi);
      for (let i = 1; i <= n; i++) b[i] = 0;
      b[leftPos] = Math.min(leftLen, leftPos);
      b[rightPos] = Math.min(rightLen, rightPos);
      for (let i = 1; i <= n; i++) {
        if (b[i] === 0 && randomInt(rng, 0, 3) === 0) {
          b[i] = randomInt(rng, 0, Math.min(i, 3));
        }
      }
      break;
    }
    case 5: {
      // Zigzag b
      for (let i = 1; i <= n; i++) {
        a[i] = randomLong(rng, 1, 1000000000);
      }
      let up = 0;
      let down = 0;
      for (let i = 1; i <= n; i++) {
        if (i % 2 === 1) {
          if (up < i) up++;
          b[i] = up;
        } else {
          down = Math.max(0, down - 1);
          b[i] = down;
        }
        if (b[i]! < 0) b[i] = 0;
        if (b[i]! > i) b[i] = i;
      }
      break;
    }
    case 6: {
      // Extend vs restart
      let L = Math.floor(n / 4);
      let R = n - Math.floor(n / 4);
      if (L < 3) L = 3;
      if (R <= L + 1) R = L + 2;
      if (R > n) R = n;
      for (let i = 1; i <= n; i++) {
        if (i <= L) {
          a[i] = randomLong(rng, 1, 10);
        } else if (i <= R) {
          a[i] = randomLong(rng, 500000000, 1000000000);
        } else {
          a[i] = randomLong(rng, 1, 10);
        }
      }
      const pos1 = randomInt(rng, 3, L);
      const len1 = randomInt(rng, 2, Math.min(5, pos1));
      const pos2 = randomInt(rng, Math.max(R, pos1 + 2), n);
      const len2 = randomInt(rng, len1 + 1, Math.min(len1 + 3, pos2));
      for (let i = 1; i <= n; i++) b[i] = 0;
      b[pos1] = len1;
      b[pos2] = len2;
      for (let i = 1; i <= n; i++) {
        if (b[i] === 0 && randomInt(rng, 0, 4) === 0) {
          b[i] = randomInt(rng, 0, Math.min(i, 3));
        }
      }
      break;
    }
    case 7: {
      // Must NOT anchor at i
      for (let i = 1; i <= n; i++) {
        a[i] = randomLong(rng, 1, 1000);
        b[i] = 0;
      }
      const center = randomInt(rng, 3, n - 1);
      a[center] = randomLong(rng, 800000000, 1000000000);
      const L = Math.max(1, center - 5);
      const R2 = center - 1;
      for (let i = L; i <= R2; i++) {
        a[i] = randomLong(rng, 1, 10);
      }
      const len = Math.max(1, Math.min(4, R2 - L + 1));
      const pos = center;
      b[pos] = Math.min(len, pos);
      for (let i = 1; i < pos; i++) {
        if (b[i] === 0 && randomInt(rng, 0, 3) === 0) {
          b[i] = randomInt(rng, 0, Math.min(i, 3));
        }
      }
      for (let i = pos + 1; i <= n; i++) {
        if (randomInt(rng, 0, 4) === 0) {
          b[i] = randomInt(rng, 0, Math.min(i, 3));
        }
      }
      break;
    }
    case 8: {
      // Prefix-count vs run
      for (let i = 1; i <= n; i++) {
        if (i % 2 === 1) {
          a[i] = randomLong(rng, 1, 10);
        } else {
          a[i] = randomLong(rng, 500000000, 1000000000);
        }
      }
      const len = randomInt(rng, 3, Math.min(7, n));
      const pos = randomInt(rng, len, n);
      for (let i = 1; i <= n; i++) b[i] = 0;
      b[pos] = len;
      for (let i = 1; i < pos; i++) {
        if (randomInt(rng, 0, 4) === 0) {
          b[i] = randomInt(rng, 0, Math.min(i, 2));
        }
      }
      break;
    }
    default: {
      for (let i = 1; i <= n; i++) {
        a[i] = randomLong(rng, 1, 1000000000);
        b[i] = randomInt(rng, 0, i);
      }
      break;
    }
  }

  // Clamp
  for (let i = 1; i <= n; i++) {
    if (a[i]! < 1) a[i] = 1;
    if (a[i]! > 1000000000) a[i] = 1000000000;
    if (b[i]! < 0) b[i] = 0;
    if (b[i]! > i) b[i] = i;
  }

  return { n, a, b };
}

function formatCase(c: CaseData): string {
  const aLine = c.a.slice(1).join(" ");
  const bLine = c.b.slice(1).join(" ");
  return `${String(c.n)}\n${aLine}\n${bLine}`;
}

const generator: ProblemGenerator = {
  async generate(): Promise<GeneratedCase> {
    const rng = seededRandom(314159265);

    // 5 sample cases (from sample-input.txt)
    const sampleCases: CaseData[] = [
      { n: 3, a: [0, 3, 1, 2], b: [0, 0, 1, 2] },
      { n: 4, a: [0, 5, 5, 5, 5], b: [0, 0, 2, 3, 0] },
      { n: 5, a: [0, 2, 4, 1, 7, 3], b: [0, 0, 0, 0, 0, 0] },
      { n: 6, a: [0, 5, 2, 6, 1, 4, 3], b: [0, 0, 2, 0, 3, 1, 4] },
      { n: 8, a: [0, 7, 1, 8, 2, 9, 3, 10, 4], b: [0, 0, 1, 2, 2, 3, 1, 4, 5] },
    ];

    const cases: CaseData[] = [...sampleCases];

    // Generate ~60 more cases for a total of ~65
    const targetT = 65;
    const generatedT = targetT - sampleCases.length; // 60

    // Total N budget: keep sum around 15000 for performance (O(N^2) solution)
    // Subtract sample N usage
    const sampleNSum = sampleCases.reduce((s, c) => s + c.n, 0); // 3+4+5+6+8=26
    const remainingN = 15000 - sampleNSum;

    const maxN = 6000;
    const sizes = partition(rng, generatedT, remainingN, maxN);

    // Weighted pattern of types
    const pattern = [
      0,          // random
      1,          // all b=0
      2, 2, 2,    // increasing-ish
      3, 3, 3, 3, // big spike
      4, 4, 4, 4, // two spikes w/ expensive middle
      5, 5, 5,    // zigzag
      6, 6, 6, 6, // extend vs restart
      7, 7, 7,    // must NOT anchor at i
      8, 8, 8,    // prefix-count vs run
    ];
    const P = pattern.length;

    for (let tc = 0; tc < generatedT; tc++) {
      const n = sizes[tc]!;
      const type = pattern[tc % P]!;
      cases.push(genCase(rng, n, type));
    }

    // Build input
    const inputLines: string[] = [String(cases.length)];
    for (const c of cases) {
      inputLines.push(formatCase(c));
    }
    const input = inputLines.join("\n") + "\n";

    // Run solution
    const output = await Promise.resolve(solution(input));

    return { input, output: output as string };
  }
};

export default generator;
