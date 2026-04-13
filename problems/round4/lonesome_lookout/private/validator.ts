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

    if (testCaseCount < 1 || testCaseCount > 80) {
      throw new Error(`Test case count must be between 1 and 80, received: ${String(testCaseCount)}`);
    }

    let lineIndex: number = 1;

    for (let caseNum = 1; caseNum <= testCaseCount; caseNum += 1) {
      if (lineIndex >= lines.length) {
        throw new Error(`Missing header line for case ${String(caseNum)}.`);
      }

      const headerTokens: readonly string[] = (lines[lineIndex] ?? "").split(/\s+/).filter((t) => t.length > 0);
      lineIndex += 1;

      if (headerTokens.length !== 3) {
        throw new Error(
          `Case ${String(caseNum)}: expected 3 integers (R C N), but received ${String(headerTokens.length)} tokens.`
        );
      }

      const R: number = parseIntegerToken(headerTokens[0] ?? "", `R for case ${String(caseNum)}`);
      const C: number = parseIntegerToken(headerTokens[1] ?? "", `C for case ${String(caseNum)}`);
      const N: number = parseIntegerToken(headerTokens[2] ?? "", `N for case ${String(caseNum)}`);

      if (R < 1 || R > 1000000) {
        throw new Error(`R for case ${String(caseNum)} must be between 1 and 10^6, received: ${String(R)}`);
      }

      if (C < 1 || C > 1000000) {
        throw new Error(`C for case ${String(caseNum)} must be between 1 and 10^6, received: ${String(C)}`);
      }

      if (N < 0 || N > Math.min(R * C, 1000000)) {
        throw new Error(
          `N for case ${String(caseNum)} must be between 0 and min(R*C, 10^6), received: ${String(N)}`
        );
      }

      const seen = new Set<string>();

      for (let i = 0; i < N; i++) {
        if (lineIndex >= lines.length) {
          throw new Error(`Missing guard line ${String(i + 1)} for case ${String(caseNum)}.`);
        }

        const guardTokens: readonly string[] = (lines[lineIndex] ?? "").split(/\s+/).filter((t) => t.length > 0);
        lineIndex += 1;

        if (guardTokens.length !== 2) {
          throw new Error(
            `Case ${String(caseNum)}, guard ${String(i + 1)}: expected 2 integers (X Y), received ${String(guardTokens.length)} tokens.`
          );
        }

        const x: number = parseIntegerToken(guardTokens[0] ?? "", `X for guard ${String(i + 1)} in case ${String(caseNum)}`);
        const y: number = parseIntegerToken(guardTokens[1] ?? "", `Y for guard ${String(i + 1)} in case ${String(caseNum)}`);

        if (x < 1 || x > R) {
          throw new Error(
            `Case ${String(caseNum)}, guard ${String(i + 1)}: X must be between 1 and R=${String(R)}, received: ${String(x)}`
          );
        }

        if (y < 1 || y > C) {
          throw new Error(
            `Case ${String(caseNum)}, guard ${String(i + 1)}: Y must be between 1 and C=${String(C)}, received: ${String(y)}`
          );
        }

        const key = `${String(x)},${String(y)}`;
        if (seen.has(key)) {
          throw new Error(
            `Case ${String(caseNum)}, guard ${String(i + 1)}: duplicate position (${String(x)}, ${String(y)}).`
          );
        }
        seen.add(key);
      }
    }
  }
};

export default validator;
