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

function getRandom(rng: () => number, n: number): { a: number[]; b: number[] } {
  const a: number[] = [];
  const b: number[] = [];
  for (let i = 0; i < n; i += 1) {
    a.push(randomInt(rng, 1, n));
    b.push(randomInt(rng, 1, n));
  }
  return { a, b };
}

function getValid(rng: () => number, n: number): { a: number[]; b: number[] } {
  const a: number[] = [];
  for (let i = 0; i < n; i += 1) {
    a.push(randomInt(rng, 1, n));
  }
  const sorted: number[] = [...a].sort((x, y) => x - y);
  const indexInSorted: Map<number, number> = new Map();
  for (let i = 0; i < sorted.length; i += 1) {
    indexInSorted.set(sorted[i]!, i);
  }
  const b: number[] = [];
  for (let j = 0; j < n; j += 1) {
    const l: number = indexInSorted.get(a[j]!)!;
    const idx: number = randomInt(rng, l, n - 1);
    b.push(sorted[idx]!);
  }
  return { a, b };
}

function solve(n: number, aIn: number[], bIn: number[]): string {
  const a: number[] = [...aIn];
  const b: number[] = [...bIn];

  const where: number[] = new Array(n + 1).fill(-1);
  for (let i = 0; i < n; i += 1) {
    where[a[i]!] = i;
  }

  const ord: number[] = [];
  for (let i = 0; i < n; i += 1) {
    ord.push(i);
  }
  ord.sort((x, y) => b[x]! - b[y]!);

  const ans: Array<[number, number]> = [];

  for (let i = 0; i < n; i += 1) {
    const c: number = ord[i]!;
    if (b[c]! < a[c]!) {
      return "-1";
    }
    if (b[c]! > n || where[b[c]!] === undefined || where[b[c]!] === -1) {
      return "-1";
    }
    if (b[c]! === a[c]!) {
      continue;
    }
    ans.push([where[b[c]!]!, c]);
  }

  const lines: string[] = [String(ans.length)];
  for (const [x, y] of ans) {
    lines.push(`${String(x + 1)} ${String(y + 1)}`);
  }
  return lines.join("\n");
}

const generator: ProblemGenerator = {
  generate(): GeneratedCase {
    const rng = seededRandom(31415);
    const testCases: Array<{ n: number; a: number[]; b: number[] }> = [];

    // 55 small valid cases (n <= 10)
    for (let r = 0; r < 55; r += 1) {
      const n: number = randomInt(rng, 1, 10);
      const { a, b } = getValid(rng, n);
      testCases.push({ n, a, b });
    }

    // 25 small random cases (n <= 10)
    for (let r = 0; r < 25; r += 1) {
      const n: number = randomInt(rng, 1, 10);
      const { a, b } = getRandom(rng, n);
      testCases.push({ n, a, b });
    }

    // 1 big valid case (n = 500000)
    {
      const n = 500000;
      const { a, b } = getValid(rng, n);
      testCases.push({ n, a, b });
    }

    // 1 big random case (n = 500000)
    {
      const n = 500000;
      const { a, b } = getRandom(rng, n);
      testCases.push({ n, a, b });
    }

    // 8 more small random cases (n <= 10)
    for (let r = 0; r < 8; r += 1) {
      const n: number = randomInt(rng, 1, 10);
      const { a, b } = getRandom(rng, n);
      testCases.push({ n, a, b });
    }

    const t: number = testCases.length;
    const inputLines: string[] = [String(t)];
    const outputLines: string[] = [];

    for (let i = 0; i < t; i += 1) {
      const tc = testCases[i]!;
      inputLines.push(String(tc.n));
      inputLines.push(tc.a.join(" "));
      inputLines.push(tc.b.join(" "));
      outputLines.push(`Case #${String(i + 1)}: ${solve(tc.n, tc.a, tc.b)}`);
    }

    return {
      input: `${inputLines.join("\n")}\n`,
      output: `${outputLines.join("\n")}\n`
    };
  }
};

export default generator;
