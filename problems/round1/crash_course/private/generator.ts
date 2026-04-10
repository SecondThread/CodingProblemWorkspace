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

function solve(s: string): string {
  let count = 0;
  let possible = false;
  for (let i = s.length - 1; i >= 0; i -= 1) {
    if (s[i] === "B") { count += 1; } else { count -= 1; if (count === -1) possible = true; }
  }
  return possible ? "Alice" : "Bob";
}

const generator: ProblemGenerator = {
  generate(): GeneratedCase {
    const rng = seededRandom(99999);
    const cases: string[] = [];

    cases.push("ABBAAAB");
    cases.push("A");
    cases.push("B");
    cases.push("AB");
    cases.push("AAAAAA");
    cases.push("BBBBBBA");

    for (let r = 0; r < 40; r += 1) {
      const n = randomInt(rng, 1, 500);
      let s = "";
      for (let i = 0; i < n; i += 1) s += rng() < 0.5 ? "A" : "B";
      cases.push(s);
    }

    const inputLines: string[] = [String(cases.length)];
    for (const c of cases) { inputLines.push(String(c.length)); inputLines.push(c); }

    const outputLines: string[] = cases.map((c, i) => `Case #${String(i + 1)}: ${solve(c)}`);

    return {
      input: `${inputLines.join("\n")}\n`,
      output: `${outputLines.join("\n")}\n`
    };
  }
};

export default generator;
