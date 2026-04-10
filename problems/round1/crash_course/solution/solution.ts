import type { ProblemSolution } from "../../../../src/contracts/problem";

const solution: ProblemSolution = (input: string): string => {
  const lines: readonly string[] = input.trim().split("\n");
  const t: number = Number(lines[0]!);
  const outputLines: string[] = [];
  let lineIndex: number = 1;

  for (let test = 1; test <= t; test += 1) {
    const n: number = Number(lines[lineIndex]!);
    lineIndex += 1;
    const s: string = lines[lineIndex]!;
    lineIndex += 1;

    let count: number = 0;
    let possible: boolean = false;

    for (let i = n - 1; i >= 0; i -= 1) {
      if (s[i] === "B") {
        count += 1;
      } else {
        count -= 1;
        if (count === -1) {
          possible = true;
        }
      }
    }

    outputLines.push(`Case #${String(test)}: ${possible ? "Alice" : "Bob"}`);
  }

  return `${outputLines.join("\n")}\n`;
};

export default solution;
