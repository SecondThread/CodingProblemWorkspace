import type { GeneratedCase, ProblemGenerator } from "../../../src/contracts/problem";

function buildInput(weights: readonly number[]): string {
  return `${[String(weights.length), ...weights.map((weight) => String(weight))].join("\n")}\n`;
}

function buildOutput(weights: readonly number[]): string {
  const lines: string[] = weights.map((weight, index) => {
    const answer: string = weight > 2 && weight % 2 === 0 ? "YES" : "NO";
    return `Case #${String(index + 1)}: ${answer}`;
  });

  return `${lines.join("\n")}\n`;
}

const generator: ProblemGenerator = {
  generate(): GeneratedCase {
    const weights: readonly number[] = [1, 2, 3, 4, 99, 100];

    return {
      input: buildInput(weights),
      output: buildOutput(weights)
    };
  }
};

export default generator;

