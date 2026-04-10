import type { ProblemSolution } from "../../../../src/contracts/problem";

const solution: ProblemSolution = (input: string): string => {
  const lines: readonly string[] = input.trim().split("\n");
  const t: number = Number(lines[0]!);
  const outputLines: string[] = [];

  for (let test = 1; test <= t; test += 1) {
    const parts: readonly string[] = lines[test]!.split(" ");
    const a: number = Number(parts[0]!);
    const b: number = Number(parts[1]!);
    const n: number = Number(parts[2]!);

    const multipliers: number[] = [];
    for (let i = 0; i < 2 * n; i += 1) {
      if (i === 2 * n - 1) {
        multipliers.push(b);
      } else {
        multipliers.push(1);
      }
    }

    void a;
    outputLines.push(`Case #${String(test)}: ${multipliers.join(" ")}`);
  }

  return `${outputLines.join("\n")}\n`;
};

export default solution;
