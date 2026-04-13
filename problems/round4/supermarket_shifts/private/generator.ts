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

function shuffle(arr: number[], rng: () => number): void {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
}

function inversePermutation(a: number[]): number[] {
  const n = a.length;
  const b = new Array<number>(n);
  for (let i = 0; i < n; i += 1) {
    b[a[i]!] = i;
  }
  return b;
}

interface TestCase {
  readonly n: number;
  readonly m: number;
  readonly w: number[];  // 1-indexed values
  readonly t: number[];  // 1-indexed values
  readonly restrictions: Array<[number, number]>;  // 1-indexed pairs
}

function generateTestCaseValid(rng: () => number, nMin: number, nMax: number): TestCase {
  const n = randomInt(rng, nMin, nMax);
  const w: number[] = [];
  const t: number[] = [];
  for (let i = 0; i < n; i += 1) {
    w.push(i);
    t.push(i);
  }
  shuffle(w, rng);
  shuffle(t, rng);

  const invW = inversePermutation(inversePermutation(w));
  const invT = inversePermutation(inversePermutation(t));

  const valid: Array<[number, number]> = [];
  if (n > 1000) {
    const vset = new Set<string>();
    for (let iter = 0; iter < 100000; iter += 1) {
      const i = randomInt(rng, 0, n - 1);
      const j = randomInt(rng, 0, n - 1);
      if (i === j) continue;
      if (
        (invW[i]! < invW[j]! && invT[i]! < invT[j]!) ||
        (invW[i]! > invW[j]! && invT[i]! > invT[j]!)
      ) {
        const lo = Math.min(i, j) + 1;
        const hi = Math.max(i, j) + 1;
        vset.add(`${String(lo)},${String(hi)}`);
      }
    }
    for (const key of vset) {
      const parts = key.split(",");
      valid.push([Number(parts[0]!), Number(parts[1]!)]);
    }
  } else {
    for (let i = 0; i < n; i += 1) {
      for (let j = i + 1; j < n; j += 1) {
        if (
          (invW[i]! < invW[j]! && invT[i]! < invT[j]!) ||
          (invW[i]! > invW[j]! && invT[i]! > invT[j]!)
        ) {
          valid.push([i + 1, j + 1]);
        }
      }
    }
  }

  const sampleSize = randomInt(rng, 0, valid.length);
  shuffle(valid as unknown as number[], rng);
  const restrictions = valid.slice(0, sampleSize) as unknown as Array<[number, number]>;

  // Properly shuffle the restrictions array (pairs)
  const restPairs: Array<[number, number]> = [];
  // Re-do: just sample randomly
  const indices: number[] = [];
  for (let i = 0; i < valid.length; i += 1) indices.push(i);
  shuffle(indices, rng);
  const take = randomInt(rng, 0, valid.length);
  const picked: Array<[number, number]> = [];
  for (let i = 0; i < take; i += 1) {
    picked.push(valid[indices[i]!]!);
  }

  const w1 = w.map((v) => v + 1);
  const t1 = t.map((v) => v + 1);
  return { n, m: picked.length, w: w1, t: t1, restrictions: picked };
}

function generateTestCaseInvalid(rng: () => number, nMin: number, nMax: number): TestCase {
  const n = randomInt(rng, nMin, nMax);
  const w: number[] = [];
  const t: number[] = [];
  for (let i = 0; i < n; i += 1) {
    w.push(i);
    t.push(i);
  }
  shuffle(w, rng);
  shuffle(t, rng);

  const invW = inversePermutation(inversePermutation(w));
  const invT = inversePermutation(inversePermutation(t));

  const valid: Array<[number, number]> = [];
  const invalid: Array<[number, number]> = [];

  if (n > 1000) {
    const vset = new Set<string>();
    const invset = new Set<string>();
    for (let iter = 0; iter < 100000; iter += 1) {
      const i = randomInt(rng, 0, n - 1);
      const j = randomInt(rng, 0, n - 1);
      if (i === j) continue;
      const lo = Math.min(i, j) + 1;
      const hi = Math.max(i, j) + 1;
      const key = `${String(lo)},${String(hi)}`;
      if (
        (invW[i]! < invW[j]! && invT[i]! < invT[j]!) ||
        (invW[i]! > invW[j]! && invT[i]! > invT[j]!)
      ) {
        vset.add(key);
      } else {
        invset.add(key);
      }
    }
    for (const key of vset) {
      const parts = key.split(",");
      valid.push([Number(parts[0]!), Number(parts[1]!)]);
    }
    for (const key of invset) {
      const parts = key.split(",");
      invalid.push([Number(parts[0]!), Number(parts[1]!)]);
    }
  } else {
    for (let i = 0; i < n; i += 1) {
      for (let j = i + 1; j < n; j += 1) {
        if (
          (invW[i]! < invW[j]! && invT[i]! < invT[j]!) ||
          (invW[i]! > invW[j]! && invT[i]! > invT[j]!)
        ) {
          valid.push([i + 1, j + 1]);
        } else {
          invalid.push([i + 1, j + 1]);
        }
      }
    }
  }

  const w1 = w.map((v) => v + 1);
  const t1 = t.map((v) => v + 1);

  // Sample valid restrictions
  const validIndices: number[] = [];
  for (let i = 0; i < valid.length; i += 1) validIndices.push(i);
  shuffle(validIndices, rng);
  const takeValid = randomInt(rng, 0, valid.length);
  const restrictions: Array<[number, number]> = [];
  for (let i = 0; i < takeValid; i += 1) {
    restrictions.push(valid[validIndices[i]!]!);
  }

  // Sample invalid restrictions (at least 1 to ensure it's invalid)
  const invalidIndices: number[] = [];
  for (let i = 0; i < invalid.length; i += 1) invalidIndices.push(i);
  shuffle(invalidIndices, rng);
  const takeInvalid = randomInt(rng, 1, Math.min(5, invalid.length));
  for (let i = 0; i < takeInvalid; i += 1) {
    restrictions.push(invalid[invalidIndices[i]!]!);
  }

  return { n, m: restrictions.length, w: w1, t: t1, restrictions };
}

function formatCase(tc: TestCase): string {
  const lines: string[] = [];
  lines.push(`${String(tc.n)} ${String(tc.m)}`);
  lines.push(tc.w.join(" "));
  lines.push(tc.t.join(" "));
  for (const [x, y] of tc.restrictions) {
    lines.push(`${String(x)} ${String(y)}`);
  }
  return lines.join("\n");
}

const generator: ProblemGenerator = {
  async generate(): Promise<GeneratedCase> {
    const rng = seededRandom(42424242);
    const cases: TestCase[] = [];

    // --- 5 Sample cases ---
    cases.push({
      n: 6, m: 4,
      w: [4, 2, 1, 3, 6, 5],
      t: [3, 4, 2, 1, 5, 6],
      restrictions: [[1, 4], [1, 3], [2, 6], [3, 6]]
    });
    cases.push({
      n: 5, m: 1,
      w: [1, 2, 3, 4, 5],
      t: [1, 3, 2, 4, 5],
      restrictions: [[2, 3]]
    });
    cases.push({
      n: 4, m: 6,
      w: [3, 2, 1, 4],
      t: [3, 2, 1, 4],
      restrictions: [[1, 4], [1, 3], [1, 2], [2, 3], [2, 4], [4, 3]]
    });
    cases.push({
      n: 6, m: 1,
      w: [6, 5, 4, 3, 2, 1],
      t: [1, 2, 3, 4, 5, 6],
      restrictions: [[1, 6]]
    });
    cases.push({
      n: 4, m: 1,
      w: [1, 2, 3, 4],
      t: [4, 2, 3, 1],
      restrictions: [[3, 2]]
    });

    // --- 6 Validation cases (small edge cases) ---
    // N=2, no locks, identity
    cases.push({ n: 2, m: 0, w: [1, 2], t: [1, 2], restrictions: [] });
    // N=2, one lock, identity
    cases.push({ n: 2, m: 1, w: [1, 2], t: [1, 2], restrictions: [[1, 2]] });
    // N=2, no locks, swap needed
    cases.push({ n: 2, m: 0, w: [2, 1], t: [1, 2], restrictions: [] });
    // N=2, one lock, swap needed -> blocked
    cases.push({ n: 2, m: 1, w: [2, 1], t: [1, 2], restrictions: [[1, 2]] });
    // N=2, no locks, identity already swapped
    cases.push({ n: 2, m: 0, w: [1, 2], t: [2, 1], restrictions: [] });
    // N=2, one lock, need swap -> blocked
    cases.push({ n: 2, m: 1, w: [1, 2], t: [2, 1], restrictions: [[1, 2]] });

    // N=8 with locks (valid)
    cases.push({
      n: 8, m: 5,
      w: [8, 7, 3, 6, 2, 1, 5, 4],
      t: [7, 6, 2, 5, 1, 8, 3, 4],
      restrictions: [[3, 5], [3, 1], [2, 4], [2, 1], [5, 8]]
    });
    // N=8 with lock (invalid)
    cases.push({
      n: 8, m: 1,
      w: [8, 7, 3, 6, 2, 1, 5, 4],
      t: [7, 6, 2, 5, 1, 8, 3, 4],
      restrictions: [[1, 6]]
    });

    // --- 1 Large case: identity vs reversed, no locks ---
    {
      const n = 500000;
      const w: number[] = [];
      const t: number[] = [];
      for (let i = 0; i < n; i += 1) {
        w.push(i + 1);
        t.push(n - i);
      }
      cases.push({ n, m: 0, w, t, restrictions: [] });
    }

    // --- 2 Mandatory large cases: N=500000 with N-1 consecutive locks ---
    {
      const n = 500000;
      const w: number[] = [];
      const t: number[] = [];
      for (let i = 0; i < n; i += 1) {
        w.push(i + 1);
        t.push(n - i);
      }
      const restrictions: Array<[number, number]> = [];
      for (let i = 0; i < n - 1; i += 1) {
        restrictions.push([i + 1, i + 2]);
      }
      cases.push({ n, m: n - 1, w, t, restrictions });
    }
    {
      const n = 500000;
      const w: number[] = [];
      const t: number[] = [];
      for (let i = 0; i < n; i += 1) {
        w.push(n - i);
        t.push(n - i);
      }
      const restrictions: Array<[number, number]> = [];
      for (let i = 0; i < n - 1; i += 1) {
        restrictions.push([i + 1, i + 2]);
      }
      cases.push({ n, m: n - 1, w, t, restrictions });
    }

    // --- 24 Exhaustive small cases: N=3, all perm pairs with lock subsets ---
    {
      const n = 3;
      const allPerms: number[][] = [];
      // Generate all permutations of [1,2,3]
      for (let a = 1; a <= 3; a += 1) {
        for (let b = 1; b <= 3; b += 1) {
          if (b === a) continue;
          for (let c = 1; c <= 3; c += 1) {
            if (c === a || c === b) continue;
            allPerms.push([a, b, c]);
          }
        }
      }
      const pairs: Array<[number, number]> = [[1, 2], [1, 3], [2, 3]];
      // Generate all subsets of pairs (2^3 = 8)
      const allSubsets: Array<Array<[number, number]>> = [];
      for (let mask = 0; mask < 8; mask += 1) {
        const subset: Array<[number, number]> = [];
        for (let bit = 0; bit < 3; bit += 1) {
          if (mask & (1 << bit)) {
            subset.push(pairs[bit]!);
          }
        }
        allSubsets.push(subset);
      }

      let cnt = 0;
      for (const p1 of allPerms) {
        for (const p2 of allPerms) {
          for (const s of allSubsets) {
            cnt += 1;
            if (cnt % 12 !== 0) continue;
            cases.push({
              n, m: s.length,
              w: [...p1],
              t: [...p2],
              restrictions: s.map(([a, b]) => [a, b] as [number, number])
            });
          }
        }
      }
    }

    // --- 15 Random valid cases ---
    for (let i = 0; i < 15; i += 1) {
      cases.push(generateTestCaseValid(rng, 4, 1000));
    }

    // --- 5 Random invalid cases ---
    for (let i = 0; i < 5; i += 1) {
      cases.push(generateTestCaseInvalid(rng, 4, 1000));
    }

    // --- 2 Medium valid cases ---
    for (let i = 0; i < 2; i += 1) {
      cases.push(generateTestCaseValid(rng, 5000, 10000));
    }

    // --- 1 Medium invalid case ---
    cases.push(generateTestCaseInvalid(rng, 5000, 10000));

    // --- 37 Optional random cases (scaled N, mix of valid/invalid) ---
    for (let i = 0; i < 37; i += 1) {
      const maxN = (i + 1) * 6;
      if (i % 4 === 1) {
        cases.push(generateTestCaseInvalid(rng, 4, maxN));
      } else {
        cases.push(generateTestCaseValid(rng, 4, maxN));
      }
    }

    // Build input
    const inputLines: string[] = [String(cases.length)];
    for (const c of cases) {
      inputLines.push(formatCase(c));
    }

    const input = inputLines.join("\n") + "\n";
    const output = await Promise.resolve(solution(input));

    return { input, output: output as string };
  }
};

export default generator;
