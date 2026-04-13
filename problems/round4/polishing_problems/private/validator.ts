import type { ProblemValidator } from "../../../../src/contracts/problem";

const validator: ProblemValidator = {
  validate(input: string): void {
    const normalized = input.replace(/\r\n/g, "\n");
    const lines = normalized.endsWith("\n")
      ? normalized.slice(0, -1).split("\n")
      : normalized.split("\n");

    if (lines.length === 0 || (lines.length === 1 && lines[0] === "")) {
      throw new Error("Input must not be empty.");
    }

    const T = parseInt(lines[0]!, 10);
    if (isNaN(T) || T < 1 || T > 150) {
      throw new Error(`Test case count T must be between 1 and 150, received: ${String(T)}`);
    }

    let lineIndex = 1;

    for (let caseIndex = 0; caseIndex < T; caseIndex += 1) {
      if (lineIndex >= lines.length) {
        throw new Error(`Missing N for case ${String(caseIndex + 1)}`);
      }

      const N = parseInt(lines[lineIndex]!, 10);
      lineIndex += 1;

      if (isNaN(N) || N < 1 || N > 2025) {
        throw new Error(
          `N for case ${String(caseIndex + 1)} must be between 1 and 2025, received: ${String(N)}`
        );
      }

      if (lineIndex >= lines.length) {
        throw new Error(`Missing string S' for case ${String(caseIndex + 1)}`);
      }

      const s = lines[lineIndex]!;
      lineIndex += 1;

      // Allow length <= N because trailing spaces may be stripped when saving files
      if (s.length > N) {
        throw new Error(
          `String S' for case ${String(caseIndex + 1)} has length ${String(s.length)}, which exceeds N=${String(N)}`
        );
      }
    }
  }
};

export default validator;
