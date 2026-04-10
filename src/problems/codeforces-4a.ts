import type { HiddenCase, ProblemDefinition } from "../problem-core";

export type Codeforces4AId = "codeforces-4a";

export function solveWatermelon(input: string): string {
  const tokens = input.trim().split(/\s+/).filter((token) => token.length > 0);
  const [weightToken] = tokens;
  if (tokens.length !== 1 || weightToken === undefined) {
    throw new Error("Watermelon expects exactly one integer weight.");
  }

  const weight = Number.parseInt(weightToken, 10);
  if (!Number.isInteger(weight)) {
    throw new Error(`Invalid weight: ${weightToken}`);
  }

  return weight > 2 && weight % 2 === 0 ? "YES\n" : "NO\n";
}

function buildHiddenCaseSet(): readonly HiddenCase[] {
  return Array.from({ length: 100 }, (_, index) => {
    const weight = index + 1;
    const input = `${weight}\n`;

    return {
      label: `w=${weight}`,
      input,
      expectedOutput: solveWatermelon(input),
    };
  });
}

export const codeforces4A = {
  id: "codeforces-4a",
  title: "Codeforces 4A - Watermelon",
  solve: solveWatermelon,
  buildHiddenCaseSet,
} satisfies ProblemDefinition<Codeforces4AId>;
