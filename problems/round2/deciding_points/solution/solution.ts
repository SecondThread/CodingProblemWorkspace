import type { ProblemSolution } from "../../../../src/contracts/problem";

const solution: ProblemSolution = (input: string): string => {
  const lines: readonly string[] = input.trim().split("\n");
  const t: number = Number(lines[0]!);
  const outputLines: string[] = [];

  for (let test = 1; test <= t; test += 1) {
    const tokens: readonly string[] = (lines[test] ?? "").trim().split(/\s+/);
    const n: number = Number(tokens[0]!);
    const m: number = Number(tokens[1]!);

    let answer: string;
    if ((m <= n && n <= 2 * m - 2) || (2 * m <= n && n % 2 === 0)) {
      answer = "YES";
    } else {
      answer = "NO";
    }

    outputLines.push(`Case #${String(test)}: ${answer}`);
  }

  return `${outputLines.join("\n")}\n`;
};

export default solution;
