import type { ProblemValidator } from "../../../../src/contracts/problem";

function parseIntegerToken(token: string, label: string): number {
  if (!/^\d+$/.test(token)) {
    throw new Error(`Expected ${label} to be a non-negative integer, received: ${token}`);
  }

  return Number(token);
}

const validator: ProblemValidator = {
  validate(input: string): void {
    const lines = input.replace(/\r\n/g, "\n").trim().split("\n");

    if (lines.length === 0 || (lines.length === 1 && lines[0] === "")) {
      throw new Error("Input must not be empty.");
    }

    const testCaseCount = parseIntegerToken(lines[0] ?? "", "test case count");

    if (testCaseCount < 1 || testCaseCount > 70) {
      throw new Error(`Test case count must be between 1 and 70, received: ${testCaseCount}`);
    }

    let lineIndex = 1;

    for (let caseIndex = 0; caseIndex < testCaseCount; caseIndex++) {
      const colorCount = parseIntegerToken(
        lines[lineIndex] ?? "",
        `color count for case ${caseIndex + 1}`
      );
      lineIndex++;

      if (colorCount < 1 || colorCount > 94) {
        throw new Error(
          `Color count for case ${caseIndex + 1} must be between 1 and 94, received: ${colorCount}`
        );
      }

      for (let row = 1; row < colorCount; row++) {
        const rowText = lines[lineIndex];
        lineIndex++;

        if (rowText === undefined) {
          throw new Error(`Missing adjacency row ${row} for case ${caseIndex + 1}`);
        }

        const tokens = rowText.split(" ").filter((v) => v.length > 0);

        if (tokens.length !== row) {
          throw new Error(
            `Adjacency row ${row} for case ${caseIndex + 1} must contain ${row} values, received ${tokens.length}`
          );
        }

        for (const token of tokens) {
          if (token !== "0" && token !== "1") {
            throw new Error(
              `Adjacency row ${row} for case ${caseIndex + 1} contains invalid value: ${token}`
            );
          }
        }
      }
    }

    if (lineIndex !== lines.length) {
      throw new Error(`Input contains ${lines.length - lineIndex} extra lines after the final test case.`);
    }
  }
};

export default validator;
