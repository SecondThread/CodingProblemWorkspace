import type { ProblemSolution } from "../../../src/contracts/problem";

function divideAndRoundUp(dividend: bigint, divisor: bigint): bigint {
  return (dividend + divisor - 1n) / divisor;
}

const solution: ProblemSolution = (input: string): string => {
  const tokens: readonly string[] = input.trim().split(/\s+/).filter((token) => token.length > 0);
  const testCaseCount: number = Number(tokens[0]!);
  const outputLines: string[] = [];

  for (let index = 0; index < testCaseCount; index += 1) {
    const baseIndex: number = 1 + index * 3;
    const n: bigint = BigInt(tokens[baseIndex]!);
    const m: bigint = BigInt(tokens[baseIndex + 1]!);
    const a: bigint = BigInt(tokens[baseIndex + 2]!);
    const tilesAlongLength: bigint = divideAndRoundUp(n, a);
    const tilesAlongWidth: bigint = divideAndRoundUp(m, a);
    const answer: bigint = tilesAlongLength * tilesAlongWidth;

    outputLines.push(`Case #${String(index + 1)}: ${answer.toString()}`);
  }

  return `${outputLines.join("\n")}\n`;
};

export default solution;

