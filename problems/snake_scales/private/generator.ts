import type { GeneratedCase, ProblemGenerator } from "../../../src/contracts/problem";

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

function printCase(a: readonly number[]): string {
  return `${String(a.length)}\n${a.join(" ")}`;
}

function solve(cases: readonly (readonly number[])[]): string {
  const outputLines: string[] = [];

  for (let t = 0; t < cases.length; t += 1) {
    const a: readonly number[] = cases[t]!;
    let ans: number = 0;
    for (let i = 1; i < a.length; i += 1) {
      ans = Math.max(ans, Math.abs(a[i]! - a[i - 1]!));
    }
    outputLines.push(`Case #${String(t + 1)}: ${String(ans)}`);
  }

  return `${outputLines.join("\n")}\n`;
}

const generator: ProblemGenerator = {
  generate(): GeneratedCase {
    const rng: () => number = seededRandom(12345);
    const cases: (readonly number[])[] = [];

    // Sample cases
    cases.push([2, 4, 5, 1, 4]);
    cases.push([13, 10, 11]);
    cases.push([1, 3, 3, 7]);
    cases.push([42]);
    cases.push([5, 50, 42]);
    cases.push([4, 2, 5, 6, 4, 2, 1]);

    // Edge cases
    cases.push(Array.from({ length: 50 }, (_, i) => i + 1));
    cases.push(Array.from({ length: 50 }, (_, i) => (i % 2) + 3));

    // Random small cases
    for (let r = 0; r < 20; r += 1) {
      const n: number = randomInt(rng, 1, 9);
      cases.push(Array.from({ length: n }, () => randomInt(rng, 1, 9)));
    }

    // Random cases with gaps
    for (let r = 0; r < 20; r += 1) {
      const n: number = randomInt(rng, 1, 9);
      cases.push(Array.from({ length: n }, () => randomInt(rng, 1, 9) + 20 * randomInt(rng, 0, 1)));
    }

    // Random large cases
    for (let r = 0; r < 17; r += 1) {
      const n: number = randomInt(rng, 1, 99);
      cases.push(Array.from({ length: n }, () => randomInt(rng, 1, 99)));
    }

    const inputLines: string[] = [String(cases.length)];
    for (const c of cases) {
      inputLines.push(printCase(c));
    }
    const input: string = `${inputLines.join("\n")}\n`;

    return {
      input,
      output: solve(cases)
    };
  }
};

export default generator;
