import type { GeneratedCase, ProblemGenerator } from "../../../../src/contracts/problem";

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

/**
 * Generate a valid array A by performing random operations forward,
 * then flatten B to get A.
 */
function generateCase(rng: () => number, targetN: number): number[] {
  // B is an array of permutations (each is number[])
  const b: number[][] = [];
  let totalLen: number = 0;

  while (totalLen < targetN) {
    if (b.length > 0 && rng() < 0.4) {
      // Operation 2: rotate all permutations left by 1
      for (const perm of b) {
        const first: number = perm[0]!;
        for (let j = 0; j < perm.length - 1; j += 1) {
          perm[j] = perm[j + 1]!;
        }
        perm[perm.length - 1] = first;
      }
    } else {
      // Operation 1: insert identity permutation of some size
      const remaining: number = targetN - totalLen;
      const k: number = remaining === 1 ? 1 : randomInt(rng, 1, Math.min(remaining, 20));
      const identity: number[] = [];
      for (let j = 1; j <= k; j += 1) identity.push(j);
      b.push(identity);
      totalLen += k;
    }
  }

  // Flatten B
  const a: number[] = [];
  for (const perm of b) {
    for (const v of perm) a.push(v);
  }
  return a;
}

/**
 * Solve: parse A into groups of rotated identity permutations,
 * then reconstruct operations.
 */
function solve(a: number[]): string[] {
  const groups: Array<[number, number]> = [];
  let i: number = 0;
  while (i < a.length) {
    if (a[i] === 1) {
      while (i < a.length - 1 && a[i + 1] === a[i]! + 1) {
        i += 1;
      }
      groups.push([a[i]!, 0]);
    } else {
      const start: number = a[i]!;
      let biggest: number = a[i]!;
      while (a[i] !== 1) {
        biggest = a[i]!;
        i += 1;
      }
      while (a[i] !== start - 1) {
        i += 1;
      }
      groups.push([biggest, start - 1]);
    }
    i += 1;
  }

  let shifts: number = 0;
  const ops: Array<number[]> = [];
  for (let g = groups.length - 1; g >= 0; g -= 1) {
    const [size, shift] = groups[g]!;
    let sNeeded: number = shifts % size;
    sNeeded = size - sNeeded;
    sNeeded += shift;
    sNeeded %= size;
    for (let j = 0; j < sNeeded; j += 1) ops.push([2]);
    ops.push([1, size]);
    shifts += sNeeded;
  }
  ops.reverse();

  const result: string[] = [];
  result.push(String(ops.length));
  for (const op of ops) result.push(op.join(" "));
  return result;
}

const generator: ProblemGenerator = {
  generate(): GeneratedCase {
    const rng = seededRandom(314159);
    const cases: Array<number[]> = [];

    // Hand-crafted edge cases
    cases.push([1, 2, 3, 3, 4, 1, 2]); // sample case
    cases.push([1, 2, 3, 4, 5]);        // single unshifted group
    cases.push([3, 1, 2, 1]);           // shifted + small
    cases.push([2, 1, 2, 1]);           // two groups both shifted
    cases.push([1]);                     // minimal
    cases.push([1, 1]);                  // two size-1 groups
    cases.push([1, 1, 1]);              // three size-1 groups

    // Small random cases (N=1..20)
    for (let r = 0; r < 30; r += 1) {
      const n: number = randomInt(rng, 1, 20);
      cases.push(generateCase(rng, n));
    }

    // Medium random cases (N=50..200)
    for (let r = 0; r < 30; r += 1) {
      const n: number = randomInt(rng, 50, 200);
      cases.push(generateCase(rng, n));
    }

    // Larger cases (N=500..1000)
    for (let r = 0; r < 10; r += 1) {
      const n: number = randomInt(rng, 500, 1000);
      cases.push(generateCase(rng, n));
    }

    // Cases with all size-1 groups (many groups, all unshifted)
    for (let r = 0; r < 5; r += 1) {
      const n: number = randomInt(rng, 10, 50);
      const a: number[] = [];
      for (let j = 0; j < n; j += 1) a.push(1);
      cases.push(a);
    }

    // Cases with one large group
    for (let r = 0; r < 5; r += 1) {
      const n: number = randomInt(rng, 50, 200);
      // Identity permutation (unshifted)
      const a: number[] = [];
      for (let j = 1; j <= n; j += 1) a.push(j);
      cases.push(a);
    }

    // Cases with one large shifted group
    for (let r = 0; r < 5; r += 1) {
      const n: number = randomInt(rng, 50, 200);
      const shift: number = randomInt(rng, 1, n - 1);
      const a: number[] = [];
      for (let j = shift + 1; j <= n; j += 1) a.push(j);
      for (let j = 1; j <= shift; j += 1) a.push(j);
      cases.push(a);
    }

    const inputLines: string[] = [String(cases.length)];
    const outputLines: string[] = [];

    for (let c = 0; c < cases.length; c += 1) {
      const a: number[] = cases[c]!;
      inputLines.push(String(a.length));
      inputLines.push(a.join(" "));

      const solLines: string[] = solve(a);
      outputLines.push(`Case #${String(c + 1)}: ${solLines[0]!}`);
      for (let s = 1; s < solLines.length; s += 1) {
        outputLines.push(solLines[s]!);
      }
    }

    return {
      input: `${inputLines.join("\n")}\n`,
      output: `${outputLines.join("\n")}\n`
    };
  }
};

export default generator;
