import type { ProblemValidator } from "../../../src/contracts/problem";

const MAX_VALUE: bigint = 1_000_000_000n;

function parseIntegerToken(token: string, label: string): bigint {
  if (!/^\d+$/.test(token)) {
    throw new Error(`Expected ${label} to be a non-negative integer, received: ${token}`);
  }

  return BigInt(token);
}

const validator: ProblemValidator = {
  validate(input: string): void {
    const trimmedInput: string = input.trim();

    if (trimmedInput.length === 0) {
      throw new Error("Input must not be empty.");
    }

    const tokens: readonly string[] = trimmedInput.split(/\s+/).filter((token) => token.length > 0);
    const testCaseCountBigInt: bigint = parseIntegerToken(tokens[0] ?? "", "test case count");

    if (testCaseCountBigInt <= 0n) {
      throw new Error(`Test case count must be positive, received: ${testCaseCountBigInt.toString()}`);
    }

    if (testCaseCountBigInt > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new Error(`Test case count is too large to index safely: ${testCaseCountBigInt.toString()}`);
    }

    const testCaseCount: number = Number(testCaseCountBigInt);

    if (tokens.length !== 1 + testCaseCount * 3) {
      throw new Error(
        `Expected ${String(testCaseCount)} triples, but received ${String((tokens.length - 1) / 3)}.`
      );
    }

    for (let index = 0; index < testCaseCount; index += 1) {
      const baseIndex: number = 1 + index * 3;
      const n: bigint = parseIntegerToken(tokens[baseIndex] ?? "", `n for case ${String(index + 1)}`);
      const m: bigint = parseIntegerToken(tokens[baseIndex + 1] ?? "", `m for case ${String(index + 1)}`);
      const a: bigint = parseIntegerToken(tokens[baseIndex + 2] ?? "", `a for case ${String(index + 1)}`);

      for (const [label, value] of [
        ["n", n],
        ["m", m],
        ["a", a]
      ] as const) {
        if (value < 1n || value > MAX_VALUE) {
          throw new Error(
            `${label} for case ${String(index + 1)} must be between 1 and 1000000000, received: ${value.toString()}`
          );
        }
      }
    }
  }
};

export default validator;

