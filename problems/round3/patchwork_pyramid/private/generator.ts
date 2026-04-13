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

const generator: ProblemGenerator = {
  generate(): GeneratedCase {
    const rng = seededRandom(98765);
    const cases: [number, number][] = [];

    // Sample cases
    cases.push([3, 3]);
    cases.push([4, 3]);
    cases.push([4, 1]);

    // Validation / edge cases
    cases.push([5, 2]);
    cases.push([6, 3]);
    cases.push([7, 4]);
    cases.push([3, 5]);

    // Edge cases
    cases.push([1, 1]);
    cases.push([2, 1]);
    cases.push([2, 3]);
    cases.push([100, 1]);
    cases.push([100, 5050]);
    cases.push([100, 100]);

    // Mandatory cases for various N with small K, random K, large K
    for (let n = 1; n <= 100; n += 7) {
      const maxK: number = (n * (n + 1)) / 2;
      // small K
      cases.push([n, 1]);
      cases.push([n, Math.min(2, maxK)]);
      cases.push([n, Math.min(3, maxK)]);
      // large K
      cases.push([n, maxK]);
      cases.push([n, Math.max(1, Math.floor(maxK / 2))]);
      // random K
      cases.push([n, randomInt(rng, 1, maxK)]);
    }

    // K=2 specific cases (special branch in solution)
    for (let n = 1; n <= 20; n += 1) {
      const maxK: number = (n * (n + 1)) / 2;
      cases.push([n, Math.min(2, maxK)]);
    }

    // Fill remaining with random cases
    while (cases.length < 150) {
      const n: number = randomInt(rng, 1, 100);
      const maxK: number = (n * (n + 1)) / 2;
      const k: number = randomInt(rng, 1, maxK);
      cases.push([n, k]);
    }

    // Trim to exactly 150
    const finalCases: [number, number][] = cases.slice(0, 150);

    const T: number = finalCases.length;
    const inputLines: string[] = [String(T)];
    for (const [n, k] of finalCases) {
      inputLines.push(`${String(n)} ${String(k)}`);
    }

    const inputStr: string = `${inputLines.join("\n")}\n`;
    const outputStr: string = solution(inputStr);

    return {
      input: inputStr,
      output: outputStr
    };
  }
};

export default generator;
