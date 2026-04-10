import type { ProblemSolution } from "../../../src/contracts/problem";

function canSplitWatermelon(weight: number): boolean {
  return weight > 2 && weight % 2 === 0;
}

const solution: ProblemSolution = (input: string): string => {
  const tokens: readonly string[] = input.trim().split(/\s+/).filter((token) => token.length > 0);
  const testCaseCount: number = Number(tokens[0]!);

  const outputLines: string[] = [];

  for (let index = 0; index < testCaseCount; index += 1) {
    const weight: number = Number(tokens[index + 1]!);
    const answer: string = canSplitWatermelon(weight) ? "YES" : "NO";
    outputLines.push(`Case #${String(index + 1)}: ${answer}`);
  }

  return `${outputLines.join("\n")}\n`;
};

export default solution;
