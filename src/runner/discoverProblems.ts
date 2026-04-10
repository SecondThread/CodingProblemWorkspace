import { readdirSync } from "node:fs";
import { join } from "node:path";

import { getProblemsRoot, buildProblemPaths, type ProblemPaths } from "../utils/paths";
import { pathExistsSync } from "../utils/fs";

export function discoverProblems(): readonly ProblemPaths[] {
  const problemsRoot: string = getProblemsRoot();
  const entries: readonly string[] = readdirSync(problemsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  return entries.map((slug) => buildProblemPaths(join(problemsRoot, slug)));
}

export function isProblemComplete(problem: ProblemPaths): boolean {
  const requiredPaths: readonly string[] = [
    problem.publicStatementPath,
    problem.publicSampleInputPath,
    problem.publicSampleOutputPath,
    problem.solutionEntryPath,
    problem.privateGeneratorPath,
    problem.privateValidatorPath,
    problem.privateCheckerPath,
    problem.privateInputPath,
    problem.privateOutputPath
  ];

  return requiredPaths.every((path) => pathExistsSync(path));
}

export function isProblemGeneratable(problem: ProblemPaths): boolean {
  const requiredPaths: readonly string[] = [
    problem.publicStatementPath,
    problem.publicSampleInputPath,
    problem.publicSampleOutputPath,
    problem.solutionEntryPath,
    problem.privateGeneratorPath,
    problem.privateValidatorPath,
    problem.privateCheckerPath
  ];

  return requiredPaths.every((path) => pathExistsSync(path));
}

export function discoverCompleteProblems(): readonly ProblemPaths[] {
  return discoverProblems().filter((problem) => isProblemComplete(problem));
}
