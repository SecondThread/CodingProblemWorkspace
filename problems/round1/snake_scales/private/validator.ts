import type { ProblemValidator } from "../../../../src/contracts/problem";

function parseIntegerToken(token: string, label: string): number {
  if (!/^-?\d+$/.test(token)) {
    throw new Error(`Expected ${label} to be an integer, received: ${token}`);
  }

  return Number(token);
}

const validator: ProblemValidator = {
  validate(input: string): void {
    const trimmedInput: string = input.trim();

    if (trimmedInput.length === 0) {
      throw new Error("Input must not be empty.");
    }

    const lines: readonly string[] = trimmedInput.split("\n").map((line) => line.trim());
    const testCaseCount: number = parseIntegerToken(lines[0] ?? "", "test case count");

    if (testCaseCount < 1 || testCaseCount > 65) {
      throw new Error(`Test case count must be between 1 and 65, received: ${String(testCaseCount)}`);
    }

    let lineIndex: number = 1;

    for (let caseNum = 1; caseNum <= testCaseCount; caseNum += 1) {
      if (lineIndex >= lines.length) {
        throw new Error(`Missing N line for case ${String(caseNum)}.`);
      }

      const n: number = parseIntegerToken(lines[lineIndex] ?? "", `N for case ${String(caseNum)}`);
      lineIndex += 1;

      if (n < 1 || n > 100) {
        throw new Error(`N for case ${String(caseNum)} must be between 1 and 100, received: ${String(n)}`);
      }

      if (lineIndex >= lines.length) {
        throw new Error(`Missing A values line for case ${String(caseNum)}.`);
      }

      const tokens: readonly string[] = (lines[lineIndex] ?? "").split(/\s+/).filter((t) => t.length > 0);
      lineIndex += 1;

      if (tokens.length !== n) {
        throw new Error(
          `Case ${String(caseNum)}: expected ${String(n)} values, but received ${String(tokens.length)}.`
        );
      }

      for (let i = 0; i < n; i += 1) {
        const value: number = parseIntegerToken(tokens[i] ?? "", `A_${String(i + 1)} in case ${String(caseNum)}`);

        if (value < 1 || value > 100) {
          throw new Error(
            `A_${String(i + 1)} in case ${String(caseNum)} must be between 1 and 100, received: ${String(value)}`
          );
        }
      }
    }
  }
};

export default validator;
