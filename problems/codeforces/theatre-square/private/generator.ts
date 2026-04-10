import type { GeneratedCase, ProblemGenerator } from "../../../src/contracts/problem";

function buildInput(cases: readonly (readonly [bigint, bigint, bigint])[]): string {
  const lines: string[] = [String(cases.length)];

  for (const [n, m, a] of cases) {
    lines.push(`${n.toString()} ${m.toString()} ${a.toString()}`);
  }

  return `${lines.join("\n")}\n`;
}

function divideAndRoundUp(dividend: bigint, divisor: bigint): bigint {
  return (dividend + divisor - 1n) / divisor;
}

function buildOutput(cases: readonly (readonly [bigint, bigint, bigint])[]): string {
  const lines: string[] = cases.map(([n, m, a], index) => {
    const answer: bigint = divideAndRoundUp(n, a) * divideAndRoundUp(m, a);
    return `Case #${String(index + 1)}: ${answer.toString()}`;
  });

  return `${lines.join("\n")}\n`;
}

function buildDeterministicCases(): readonly (readonly [bigint, bigint, bigint])[] {
  const cases: Array<readonly [bigint, bigint, bigint]> = [];

  for (let value = 1n; value <= 25n; value += 1n) {
    cases.push([value, value, 1n]);
  }

  for (let value = 1n; value <= 25n; value += 1n) {
    cases.push([value, value + 5n, 2n]);
  }

  for (let value = 1n; value <= 20n; value += 1n) {
    cases.push([3n * value, 7n * value + 1n, 3n]);
  }

  for (let value = 1n; value <= 15n; value += 1n) {
    cases.push([97n * value, 89n * value + 13n, 10n]);
  }

  const edgeCases: readonly (readonly [bigint, bigint, bigint])[] = [
    [1_000_000_000n, 1_000_000_000n, 1n],
    [1_000_000_000n, 1_000_000_000n, 1_000_000_000n],
    [999_999_937n, 999_999_929n, 2n],
    [1_000_000_000n, 1n, 999_999_999n],
    [1n, 1_000_000_000n, 999_999_999n],
    [123_456_789n, 987_654_321n, 10_000n],
    [999_999_999n, 500_000_000n, 333_333_333n],
    [42n, 42n, 100n],
    [6n, 6n, 4n],
    [2n, 7n, 3n]
  ];

  return [...cases, ...edgeCases];
}

const generator: ProblemGenerator = {
  generate(): GeneratedCase {
    const cases: readonly (readonly [bigint, bigint, bigint])[] = buildDeterministicCases();

    return {
      input: buildInput(cases),
      output: buildOutput(cases)
    };
  }
};

export default generator;

