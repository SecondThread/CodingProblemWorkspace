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

function solve(a: readonly number[]): bigint {
  const n = a.length;
  const s: number[] = new Array<number>(n + 1);
  s[0] = 0;
  for (let i = 1; i <= n; i += 1) s[i] = (s[i - 1]! ^ a[i - 1]!);
  const cnt: Map<number, bigint> = new Map();
  let res = 0n;
  for (let l = n; l >= 1; l -= 1) {
    cnt.set(s[l]!, (cnt.get(s[l]!) ?? 0n) + 1n);
    const c = cnt.get(s[l - 1]!) ?? 0n;
    const span = BigInt(n - l + 1);
    res += span * (span + 1n) / 2n;
    res -= c * (c + 1n) / 2n;
  }
  return res;
}

const generator: ProblemGenerator = {
  generate(): GeneratedCase {
    const rng = seededRandom(77777);
    const cases: (readonly number[])[] = [];

    cases.push([0, 0]);
    cases.push([1, 1, 1]);
    cases.push([1, 2, 3]);
    cases.push([0, 1, 0, 2, 0, 3, 0]);

    for (let r = 0; r < 30; r += 1) {
      const n = randomInt(rng, 1, 100);
      cases.push(Array.from({ length: n }, () => randomInt(rng, 0, (1 << 20) - 1)));
    }

    const inputLines: string[] = [String(cases.length)];
    for (const c of cases) { inputLines.push(String(c.length)); inputLines.push(c.join(" ")); }

    const outputLines: string[] = cases.map((c, i) => `Case #${String(i + 1)}: ${String(solve(c))}`);

    return {
      input: `${inputLines.join("\n")}\n`,
      output: `${outputLines.join("\n")}\n`
    };
  }
};

export default generator;
