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

    if (testCaseCount < 1 || testCaseCount > 100000) {
      throw new Error(`Test case count must be between 1 and 100000, received: ${String(testCaseCount)}`);
    }

    let lineIndex: number = 1;

    for (let caseNum = 1; caseNum <= testCaseCount; caseNum += 1) {
      if (lineIndex >= lines.length) {
        throw new Error(`Missing line for case ${String(caseNum)}.`);
      }

      const tokens: readonly string[] = (lines[lineIndex] ?? "").split(/\s+/).filter((t) => t.length > 0);
      lineIndex += 1;

      if (tokens.length !== 2) {
        throw new Error(
          `Case ${String(caseNum)}: expected 2 integers (N M), but received ${String(tokens.length)} tokens.`
        );
      }

      const n: number = parseIntegerToken(tokens[0] ?? "", `N for case ${String(caseNum)}`);
      const m: number = parseIntegerToken(tokens[1] ?? "", `M for case ${String(caseNum)}`);

      if (n < 1 || n > 1000000000) {
        throw new Error(
          `N for case ${String(caseNum)} must be between 1 and 10^9, received: ${String(n)}`
        );
      }

      if (m < 1 || m > 100) {
        throw new Error(
          `M for case ${String(caseNum)} must be between 1 and 100, received: ${String(m)}`
        );
      }
    }
  }
};

export default validator;
