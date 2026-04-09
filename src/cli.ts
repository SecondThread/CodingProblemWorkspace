import { readFileSync } from "node:fs";
import type { CaseKind } from "./problem-core";
import { judgeProblem, writeHiddenCaseFiles } from "./problem-core";
import { getProblem, listProblems } from "./problem-registry";

type Command = "list" | "solve" | "judge" | "generate";

function usage(): string {
  return [
    "Usage:",
    "  node dist/src/cli.js list",
    "  node dist/src/cli.js solve <problem-id> < input.txt",
    "  node dist/src/cli.js judge <problem-id> [sample|hidden]",
    "  node dist/src/cli.js generate <problem-id>",
  ].join("\n");
}

function readStdin(): string {
  return readFileSync(0, "utf8");
}

function parseCaseKind(value: string | undefined): CaseKind {
  if (value === undefined || value === "sample") {
    return "sample";
  }

  if (value === "hidden") {
    return "hidden";
  }

  throw new Error(`Unknown case kind '${value}'. Expected 'sample' or 'hidden'.`);
}

function requireProblemId(problemId: string | undefined): string {
  if (problemId === undefined) {
    throw new Error("Problem id is required.");
  }

  return problemId;
}

function main(argv: readonly string[]): void {
  const [command, firstArg, secondArg] = argv as readonly [
    Command | undefined,
    string | undefined,
    string | undefined,
  ];

  switch (command) {
    case "list": {
      for (const problem of listProblems()) {
        console.log(`${problem.id} - ${problem.title}`);
      }
      return;
    }
    case "solve": {
      const problem = getProblem(requireProblemId(firstArg));
      process.stdout.write(problem.solve(readStdin()));
      return;
    }
    case "judge": {
      const problem = getProblem(requireProblemId(firstArg));
      const judgment = judgeProblem(problem, parseCaseKind(secondArg));
      if (!judgment.ok) {
        console.error(judgment.message);
        process.exitCode = 1;
        return;
      }

      console.log(judgment.message);
      return;
    }
    case "generate": {
      const problem = getProblem(requireProblemId(firstArg));
      const result = writeHiddenCaseFiles(problem);
      console.log(
        `Wrote ${result.caseCount} hidden cases for ${problem.id}:\n${result.inputPath}\n${result.outputPath}`,
      );
      return;
    }
    default:
      throw new Error(usage());
  }
}

try {
  main(process.argv.slice(2));
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
}
