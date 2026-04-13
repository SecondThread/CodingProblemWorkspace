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

function isPrime(x: number): boolean {
  if (x < 2) return false;
  if (x % 2 === 0) return x === 2;
  for (let d = 3; d * d <= x; d += 2) {
    if (x % d === 0) return false;
  }
  return true;
}

function randomPrime(rng: () => number, lo: number, hi: number): number {
  for (let i = 0; i < 10000; i++) {
    let x = randomInt(rng, lo, hi);
    if (x % 2 === 0) x++;
    if (x > hi) x = lo | 1;
    if (isPrime(x)) return x;
  }
  // Fallback: scan
  for (let x = Math.max(2, lo); x <= hi; x++) {
    if (isPrime(x)) return x;
  }
  return 2;
}

type TeamRow = number[]; // M+1 values

interface TestCase {
  N: number;
  M: number;
  A: number;
  B: number;
  rows: TeamRow[];
}

/**
 * Generate a single test case.
 *   type: 0 = random (mix of backup/no-backup), 1 = all no-backup (-1), 2 = all have backup
 *   small: if true, use small weight values
 */
function generateCase(
  rng: () => number,
  N: number,
  M: number,
  A: number,
  B: number,
  type: number,
  small: boolean
): TestCase {
  const rows: TeamRow[] = [];
  for (let i = 0; i < N; i++) {
    const row: number[] = [];
    for (let j = 0; j < M; j++) {
      const r = randomInt(rng, 1, M);
      const k = small ? randomInt(rng, 0, 10) : randomInt(rng, 0, 10000);
      row.push(M * k + r);
    }

    let localType = type;
    if (localType === 0) {
      localType = randomInt(rng, 0, 2) < 2 ? 1 : 2;
    }

    if (localType === 2) {
      const r = randomInt(rng, 1, M);
      const k = small ? randomInt(rng, 0, 10) : randomInt(rng, 0, 10000);
      row.push(M * k + r);
    } else {
      row.push(-1);
    }
    rows.push(row);
  }
  return { N, M, A, B, rows };
}

function formatCase(c: TestCase): string {
  const lines: string[] = [];
  lines.push(`${c.N} ${c.M} ${c.A} ${c.B}`);
  for (const row of c.rows) {
    lines.push(row.join(" "));
  }
  return lines.join("\n");
}

function totalReindeer(c: TestCase): number {
  let count = 0;
  for (const row of c.rows) {
    for (let j = 0; j < row.length; j++) {
      if (row[j] !== -1) count++;
    }
  }
  return count;
}

const generator: ProblemGenerator = {
  generate(): GeneratedCase {
    const rng = seededRandom(42424242);
    const cases: TestCase[] = [];

    // ---- Sample cases (from sample-input.txt) ----
    cases.push({
      N: 2, M: 3, A: 14, B: 11,
      rows: [[4, 6, 1, -1], [10, 13, 4, 3]]
    });
    cases.push({
      N: 1, M: 4, A: 4, B: 9,
      rows: [[3, 5, 3, 7, 10]]
    });
    cases.push({
      N: 2, M: 3, A: 10, B: 5,
      rows: [[10, 4, 6, -1], [1, 4, 7, -1]]
    });
    cases.push({
      N: 2, M: 2, A: 8, B: 8,
      rows: [[7, 14, -1], [13, 5, -1]]
    });

    // ---- Edge cases ----

    // M=1: every reindeer forms its own team, penalty always 0
    cases.push({
      N: 3, M: 1, A: 100, B: 50,
      rows: [[5, -1], [10, -1], [3, 7]]
    });

    // All same weight
    cases.push({
      N: 3, M: 2, A: 10, B: 5,
      rows: [[6, 6, 6], [6, 6, -1], [6, 6, 6]]
    });

    // Single team, N=1
    cases.push({
      N: 1, M: 3, A: 100, B: 1,
      rows: [[1, 2, 3, 4]]
    });

    // A very large relative to B (always form all teams)
    cases.push({
      N: 2, M: 2, A: 1000000000, B: 1,
      rows: [[1, 2, -1], [3, 4, -1]]
    });

    // B very large relative to A (might skip teams)
    cases.push({
      N: 2, M: 2, A: 1, B: 1000000000,
      rows: [[1, 3, -1], [2, 4, -1]]
    });

    // ---- Small random cases ----
    for (let r = 0; r < 5; r++) {
      const M = randomInt(rng, 2, 6);
      const N = randomInt(rng, 2, 8);
      const A = randomInt(rng, 1, 100);
      const B = randomInt(rng, 1, 100);
      cases.push(generateCase(rng, N, M, A, B, 0, true));
    }

    // ---- Prime M cases ----
    for (let r = 0; r < 3; r++) {
      const M = randomPrime(rng, 5, 30);
      const N = randomInt(rng, 3, 15);
      const A = randomInt(rng, 1, 1000000000);
      const B = randomInt(rng, 1, 1000000000);
      cases.push(generateCase(rng, N, M, A, B, 0, true));
    }

    // ---- Composite M cases ----
    // M = product of small primes
    {
      const M = 2 * 3 * 5; // 30
      const N = randomInt(rng, 5, 20);
      const A = randomInt(rng, 1, 1000000000);
      const B = randomInt(rng, 1, 1000000000);
      cases.push(generateCase(rng, N, M, A, B, 0, true));
    }

    // M = power of 2
    {
      const M = 16;
      const N = randomInt(rng, 4, 15);
      const A = randomInt(rng, 1, 1000000000);
      const B = randomInt(rng, 1, 1000000000);
      cases.push(generateCase(rng, N, M, A, B, 1, true));
    }

    // ---- All no-backup cases ----
    for (let r = 0; r < 2; r++) {
      const M = randomInt(rng, 3, 10);
      const N = randomInt(rng, 3, 12);
      const A = randomInt(rng, 1, 1000000000);
      const B = randomInt(rng, 1, 1000000000);
      cases.push(generateCase(rng, N, M, A, B, 1, true));
    }

    // ---- k = m (N = M, all have backups) ----
    {
      const M = randomInt(rng, 4, 10);
      const N = M;
      const A = randomInt(rng, 1, 1000000000);
      const B = randomInt(rng, 1, 1000000000);
      cases.push(generateCase(rng, N, M, A, B, 2, true));
    }

    // ---- Medium cases ----
    // Larger prime M
    {
      const M = randomPrime(rng, 20, 50);
      const N = randomInt(rng, 10, 30);
      const A = randomInt(rng, 1, 1000000000);
      const B = randomInt(rng, 1, 1000000000);
      cases.push(generateCase(rng, N, M, A, B, 0, false));
    }

    // Composite medium M
    {
      const M = randomInt(rng, 20, 60);
      const N = randomInt(rng, 10, 30);
      const A = randomInt(rng, 1, 1000000000);
      const B = randomInt(rng, 1, 1000000000);
      cases.push(generateCase(rng, N, M, A, B, 0, false));
    }

    // Larger with n%m = 0
    for (let r = 0; r < 2; r++) {
      const M = randomInt(rng, 5, 20);
      const k = randomInt(rng, 3, 10);
      const N = k; // All have no backup: N*M reindeer, divisible by M
      const A = randomInt(rng, 1, 1000000000);
      const B = randomInt(rng, 1, 1000000000);
      cases.push(generateCase(rng, N, M, A, B, 1, false));
    }

    // ---- Verify all cases satisfy constraints ----
    for (const c of cases) {
      const tr = totalReindeer(c);
      if (tr > 200000) {
        throw new Error(`Generated case exceeds 200000 reindeer: ${tr}`);
      }
      if (tr < c.M) {
        throw new Error(`Generated case has fewer reindeer (${tr}) than M (${c.M})`);
      }
      // Check r <= k constraint
      const kk = Math.floor(tr / c.M);
      const rr = tr % c.M;
      if (rr > kk) {
        throw new Error(`Generated case violates r <= k: r=${rr}, k=${kk}, n=${tr}, M=${c.M}`);
      }
    }

    // Build input
    const T = cases.length;
    const inputLines: string[] = [String(T)];
    for (const c of cases) {
      inputLines.push(formatCase(c));
    }
    const input = `${inputLines.join("\n")}\n`;

    // Generate expected output using our solution
    const output: string = solution(input) as string;

    return { input, output };
  }
};

export default generator;
