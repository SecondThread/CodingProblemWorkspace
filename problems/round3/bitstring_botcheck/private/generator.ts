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

function getRand(rng: () => number, n: number): string {
  let s = "";
  for (let i = 0; i < 2 * n; i += 1) {
    s += String(randomInt(rng, 0, 1));
  }
  return s;
}

function getPair(rng: () => number, n: number): string {
  let s = "";
  for (let i = 0; i < n; i += 1) {
    if (randomInt(rng, 0, 1) === 1) {
      s += "01";
    } else {
      s += "10";
    }
  }
  return s;
}

const MX = 150;

const generator: ProblemGenerator = {
  async generate(): Promise<GeneratedCase> {
    const rng = seededRandom(123456789);

    interface TestCase {
      readonly n: number;
      readonly s: string;
    }

    const cases: TestCase[] = [];

    // 28 cases: N random in [3,20], fully random bitstring
    for (let t = 0; t < 28; t += 1) {
      const n = randomInt(rng, 3, 20);
      cases.push({ n, s: getRand(rng, n) });
    }

    // 28 cases: N random in [3,20], pair bitstring
    for (let t = 0; t < 28; t += 1) {
      const n = randomInt(rng, 3, 20);
      cases.push({ n, s: getPair(rng, n) });
    }

    // 2 cases: N=MX, fully random
    for (let t = 0; t < 2; t += 1) {
      cases.push({ n: MX, s: getRand(rng, MX) });
    }

    // 2 cases: N=MX, pair
    for (let t = 0; t < 2; t += 1) {
      cases.push({ n: MX, s: getPair(rng, MX) });
    }

    // 20 cases: N random in [3,20], random or pair
    for (let t = 0; t < 20; t += 1) {
      const n = randomInt(rng, 3, 20);
      if (randomInt(rng, 0, 1) === 1) {
        cases.push({ n, s: getRand(rng, n) });
      } else {
        cases.push({ n, s: getPair(rng, n) });
      }
    }

    // Build input
    const inputLines: string[] = [String(cases.length)];
    for (const c of cases) {
      inputLines.push(String(c.n));
      inputLines.push(c.s);
    }
    const input = inputLines.join("\n") + "\n";

    const output = await Promise.resolve(solution(input));
    return { input, output: output as string };
  }
};

export default generator;
