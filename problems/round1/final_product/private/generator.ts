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

function solve(a: number, b: number, n: number): string {
  const multipliers: number[] = [];
  for (let i = 0; i < 2 * n; i += 1) {
    multipliers.push(i === 2 * n - 1 ? b : 1);
  }
  void a;
  return multipliers.join(" ");
}

const generator: ProblemGenerator = {
  generate(): GeneratedCase {
    const rng = seededRandom(11111);
    const cases: { a: number; b: number; n: number }[] = [];

    cases.push({ a: 5, b: 63, n: 2 });
    cases.push({ a: 6, b: 12, n: 2 });
    cases.push({ a: 6, b: 12, n: 2 });
    cases.push({ a: 100, b: 9, n: 1 });
    cases.push({ a: 63, b: 64, n: 5 });
    cases.push({ a: 100, b: 1, n: 100 });

    for (let r = 0; r < 44; r += 1) {
      const n = randomInt(rng, 1, 100);
      const a = randomInt(rng, 1, 100);
      const b = randomInt(rng, 1, 100);
      cases.push({ a, b, n });
    }

    const inputLines: string[] = [String(cases.length)];
    for (const c of cases) inputLines.push(`${String(c.a)} ${String(c.b)} ${String(c.n)}`);

    const outputLines: string[] = cases.map((c, i) => `Case #${String(i + 1)}: ${solve(c.a, c.b, c.n)}`);

    return {
      input: `${inputLines.join("\n")}\n`,
      output: `${outputLines.join("\n")}\n`
    };
  }
};

export default generator;
