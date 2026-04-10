import type { GeneratedCase, ProblemGenerator } from "../../../../src/contracts/problem";
import solution from "../solution/solution";

interface TestCase {
  readonly a: readonly number[];
  readonly m: number;
  readonly n: number;
}

const generator: ProblemGenerator = {
  async generate(): Promise<GeneratedCase> {
    const cases: TestCase[] = [
      { a: [3, 5, 1], m: 27, n: 3 },
      { a: [1, 9, 6], m: 18, n: 3 },
      { a: [3, 5, 1], m: 28, n: 3 },
      { a: [7, 6, 16, 9, 3], m: 100, n: 5 },
      { a: [1, 2, 4, 8, 1, 2, 60, 3, 5, 7], m: 45, n: 10 },
      { a: [5, 11, 12, 15, 13, 7, 23, 7], m: 230, n: 8 }
    ];

    const inputLines: string[] = [String(cases.length)];
    for (const c of cases) {
      inputLines.push(`${String(c.n)} ${String(c.m)}`);
      inputLines.push(c.a.join(" "));
    }

    const input = inputLines.join("\n") + "\n";
    const output = await Promise.resolve(solution(input));

    return { input, output };
  }
};

export default generator;
