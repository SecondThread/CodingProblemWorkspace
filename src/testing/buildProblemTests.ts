import type { ProblemPaths } from "../utils/paths";
import { pathExistsSync, readTextFileSync } from "../utils/fs";
import { discoverCompleteProblems, discoverProblems } from "../runner/discoverProblems";
import { validateProblemData } from "../runner/validateProblemData";
import { runSolutionInSandbox } from "../runner/runSolutionInSandbox";
import { checkSolutionOutput } from "../runner/checkSolutionOutput";
import { formatWorkerFailure } from "../runner/runProblemWorker";

function assertProblemLayout(problem: ProblemPaths): void {
  const requiredPaths: readonly [label: string, path: string][] = [
    ["public statement", problem.publicStatementPath],
    ["public sample input", problem.publicSampleInputPath],
    ["public sample output", problem.publicSampleOutputPath],
    ["solution entry", problem.solutionEntryPath],
    ["private generator", problem.privateGeneratorPath],
    ["private validator", problem.privateValidatorPath],
    ["private checker", problem.privateCheckerPath],
    ["private input", problem.privateInputPath],
    ["private output", problem.privateOutputPath]
  ];

  for (const [label, path] of requiredPaths) {
    if (!pathExistsSync(path)) {
      throw new Error(`Problem ${problem.slug} is missing ${label}: ${path}`);
    }
  }
}

async function verifyProblemCase(
  problem: ProblemPaths,
  inputPath: string,
  outputPath: string,
  label: string
): Promise<void> {
  const start: number = Date.now();
  assertProblemLayout(problem);

  const input: string = readTextFileSync(inputPath);
  const expectedOutput: string = readTextFileSync(outputPath);

  await validateProblemData(problem, input);

  const solutionRun = await runSolutionInSandbox(problem, input);

  if (solutionRun.timedOut || solutionRun.exitCode !== 0) {
    throw new Error(formatWorkerFailure(`${problem.slug} ${label} solution`, solutionRun));
  }

  await checkSolutionOutput(problem, {
    actualOutput: solutionRun.stdout,
    expectedOutput,
    input
  });

  const elapsed: number = Date.now() - start;
  console.log(`[${problem.slug}] ${label} passed verification in ${String(elapsed)}ms`);
}

export function buildProblemTests(): void {
  const allProblems: readonly ProblemPaths[] = discoverProblems();
  const runnableProblems: readonly ProblemPaths[] = discoverCompleteProblems();

  describe("coding problems", () => {
    test("at least one problem exists", () => {
      expect(allProblems.length).toBeGreaterThan(0);
    });

    test("at least one complete problem exists", () => {
      expect(runnableProblems.length).toBeGreaterThan(0);
    });

    for (const problem of runnableProblems) {
      describe(problem.slug, () => {
        let problemStart: number;

        beforeAll(() => {
          problemStart = Date.now();
          console.log(`[${problem.slug}] starting...`);
        });

        afterAll(() => {
          const elapsed: number = Date.now() - problemStart;
          console.log(`[${problem.slug}] total: ${String(elapsed)}ms`);
        });

        test("sample case passes", async () => {
          await verifyProblemCase(
            problem,
            problem.publicSampleInputPath,
            problem.publicSampleOutputPath,
            "sample"
          );
        });

        test("full data case passes", async () => {
          await verifyProblemCase(problem, problem.privateInputPath, problem.privateOutputPath, "full data");
        }, problem.slug === "polishing_problems" ? 120_000 : undefined);
      });
    }
  });
}
