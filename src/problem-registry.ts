import type { ProblemDefinition } from "./problem-core";
import { codeforces4A } from "./problems/codeforces-4a";

const problems = [codeforces4A] as const satisfies readonly ProblemDefinition[];

export type ProblemId = (typeof problems)[number]["id"];

const problemMap = new Map<ProblemId, (typeof problems)[number]>(
  problems.map((problem) => [problem.id, problem]),
);

export function isProblemId(value: string): value is ProblemId {
  return problemMap.has(value as ProblemId);
}

export function getProblem(id: string): (typeof problems)[number] {
  if (!isProblemId(id)) {
    const availableIds = problems.map((problem) => problem.id).join(", ");
    throw new Error(`Unknown problem '${id}'. Available problems: ${availableIds}`);
  }

  return problemMap.get(id)!;
}

export function listProblems(): readonly (typeof problems)[number][] {
  return problems;
}
