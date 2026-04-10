import type { ProblemSolution } from "../../../src/contracts/problem";

const solution: ProblemSolution = (input: string): string => {
  const lines: readonly string[] = input.trim().split("\n");
  const t: number = Number(lines[0]!);
  const outputLines: string[] = [];
  let lineIndex: number = 1;

  for (let test = 1; test <= t; test += 1) {
    const n: number = Number(lines[lineIndex]!);
    lineIndex += 1;
    const a: readonly number[] = lines[lineIndex]!.split(" ").map(Number);
    lineIndex += 1;

    let ans: number = 0;
    for (let i = 1; i < n; i += 1) {
      ans = Math.max(ans, Math.abs(a[i]! - a[i - 1]!));
    }

    outputLines.push(`Case #${String(test)}: ${String(ans)}`);
  }

  return `${outputLines.join("\n")}\n`;
};

export default solution;
