import type { ProblemValidator } from "../../../src/contracts/problem";

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

    const tokens: readonly string[] = trimmedInput.split(/\s+/).filter((token) => token.length > 0);
    const testCaseCount: number = parseIntegerToken(tokens[0] ?? "", "test case count");

    if (testCaseCount <= 0) {
      throw new Error(`Test case count must be positive, received: ${String(testCaseCount)}`);
    }

    if (tokens.length !== testCaseCount + 1) {
      throw new Error(
        `Expected ${String(testCaseCount)} case values, but received ${String(tokens.length - 1)}.`
      );
    }

    for (let index = 0; index < testCaseCount; index += 1) {
      const weightToken: string | undefined = tokens[index + 1];
      const weight: number = parseIntegerToken(weightToken ?? "", `weight for case ${String(index + 1)}`);

      if (weight < 1 || weight > 100) {
        throw new Error(
          `Weight for case ${String(index + 1)} must be between 1 and 100, received: ${String(weight)}`
        );
      }
    }
  }
};

export default validator;

