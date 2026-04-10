import type { GeneratedCase, ProblemGenerator } from "../../../../src/contracts/problem";
import solution from "../solution/solution";

const generator: ProblemGenerator = {
  generate(): GeneratedCase {
    const inputLines: string[] = [
      "4",
      "1 3 2",
      "129 135 5",
      "98 3669 11",
      "12345678 87654321 20"
    ];
    const input = inputLines.join("\n") + "\n";
    const output = solution(input) as string;
    return { input, output };
  }
};

export default generator;
