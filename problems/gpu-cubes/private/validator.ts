import type { ProblemValidator } from "../../../src/contracts/problem";

function parseIntegerToken(token: string, label: string): number {
  if (!/^\d+$/.test(token)) {
    throw new Error(`Expected ${label} to be a non-negative integer, received: ${token}`);
  }

  return Number(token);
}

const validator: ProblemValidator = {
  validate(input: string): void {
    const lines: readonly string[] = input.replace(/\r\n/g, "\n").trim().split("\n");

    if (lines.length === 0 || (lines.length === 1 && lines[0] === "")) {
      throw new Error("Input must not be empty.");
    }

    const testCaseCount: number = parseIntegerToken(lines[0] ?? "", "test case count");

    if (testCaseCount < 1 || testCaseCount > 60) {
      throw new Error(`Test case count must be between 1 and 60, received: ${String(testCaseCount)}`);
    }

    let lineIndex = 1;

    for (let caseIndex = 0; caseIndex < testCaseCount; caseIndex += 1) {
      const colorCount: number = parseIntegerToken(
        lines[lineIndex] ?? "",
        `color count for case ${String(caseIndex + 1)}`
      );
      lineIndex += 1;

      if (colorCount < 1 || colorCount > 50) {
        throw new Error(
          `Color count for case ${String(caseIndex + 1)} must be between 1 and 50, received: ${String(colorCount)}`
        );
      }

      for (let row = 1; row < colorCount; row += 1) {
        const rowText: string | undefined = lines[lineIndex];
        lineIndex += 1;

        if (rowText === undefined) {
          throw new Error(`Missing adjacency row ${String(row)} for case ${String(caseIndex + 1)}`);
        }

        const tokens: readonly string[] = rowText.split(" ").filter((value) => value.length > 0);

        if (tokens.length !== row) {
          throw new Error(
            `Adjacency row ${String(row)} for case ${String(caseIndex + 1)} must contain ${String(row)} values, received ${String(tokens.length)}`
          );
        }

        for (const token of tokens) {
          if (token !== "0" && token !== "1") {
            throw new Error(
              `Adjacency row ${String(row)} for case ${String(caseIndex + 1)} contains invalid value: ${token}`
            );
          }
        }
      }
    }

    if (lineIndex !== lines.length) {
      throw new Error(`Input contains ${String(lines.length - lineIndex)} extra lines after the final test case.`);
    }
  }
};

export default validator;

