import { readdirSync } from "node:fs";
import { join } from "node:path";

import { getProblemsRoot, buildProblemPaths, type ProblemPaths } from "../utils/paths";

export function discoverProblems(): readonly ProblemPaths[] {
  const problemsRoot: string = getProblemsRoot();
  const entries: readonly string[] = readdirSync(problemsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  return entries.map((slug) => buildProblemPaths(join(problemsRoot, slug)));
}

