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

function solveCase(n: number, m: number): string {
  if ((m <= n && n <= 2 * m - 2) || (2 * m <= n && n % 2 === 0)) {
    return "YES";
  }
  return "NO";
}

interface TestCase {
  readonly n: number;
  readonly m: number;
}

const generator: ProblemGenerator = {
  generate(): GeneratedCase {
    const rng: () => number = seededRandom(54321);
    const cases: TestCase[] = [];

    // Sample cases from the problem statement
    cases.push({ n: 4, m: 3 });
    cases.push({ n: 5, m: 3 });
    cases.push({ n: 3, m: 3 });
    cases.push({ n: 6, m: 3 });
    cases.push({ n: 1, m: 1 });
    cases.push({ n: 138, m: 6 });

    // Edge cases: M = 1
    cases.push({ n: 1, m: 1 });
    cases.push({ n: 2, m: 1 });
    cases.push({ n: 1000000000, m: 1 });

    // Edge cases: M = 100
    cases.push({ n: 100, m: 100 });
    cases.push({ n: 198, m: 100 });
    cases.push({ n: 199, m: 100 });
    cases.push({ n: 200, m: 100 });
    cases.push({ n: 202, m: 100 });
    cases.push({ n: 999999999, m: 100 });
    cases.push({ n: 1000000000, m: 100 });

    // Edge cases: small N
    cases.push({ n: 1, m: 2 });
    cases.push({ n: 2, m: 2 });
    cases.push({ n: 3, m: 2 });
    cases.push({ n: 4, m: 2 });
    cases.push({ n: 1, m: 50 });

    // Boundary cases around M and 2*M-2
    for (let m = 2; m <= 20; m += 1) {
      for (let offset = -2; offset <= 2; offset += 1) {
        const n1: number = m + offset;
        if (n1 >= 1) {
          cases.push({ n: n1, m });
        }
        const n2: number = 2 * m - 2 + offset;
        if (n2 >= 1) {
          cases.push({ n: n2, m });
        }
        const n3: number = 2 * m + offset;
        if (n3 >= 1) {
          cases.push({ n: n3, m });
        }
      }
    }

    // Random small cases
    for (let r = 0; r < 50; r += 1) {
      const m: number = randomInt(rng, 1, 100);
      const n: number = randomInt(rng, 1, 1000);
      cases.push({ n, m });
    }

    // Random large N cases
    for (let r = 0; r < 50; r += 1) {
      const m: number = randomInt(rng, 1, 100);
      const n: number = randomInt(rng, 1, 1000000000);
      cases.push({ n, m });
    }

    const inputLines: string[] = [String(cases.length)];
    const outputLines: string[] = [];

    for (let t = 0; t < cases.length; t += 1) {
      const c: TestCase = cases[t]!;
      inputLines.push(`${String(c.n)} ${String(c.m)}`);
      outputLines.push(`Case #${String(t + 1)}: ${solveCase(c.n, c.m)}`);
    }

    const input: string = `${inputLines.join("\n")}\n`;
    const output: string = `${outputLines.join("\n")}\n`;

    return { input, output };
  }
};

export default generator;
