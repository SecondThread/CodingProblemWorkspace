import { join } from "node:path";

export interface ProblemPaths {
  readonly slug: string;
  readonly rootDir: string;
  readonly publicDir: string;
  readonly solutionDir: string;
  readonly privateDir: string;
  readonly publicStatementPath: string;
  readonly publicSampleInputPath: string;
  readonly publicSampleOutputPath: string;
  readonly solutionEntryPath: string;
  readonly privateGeneratorPath: string;
  readonly privateValidatorPath: string;
  readonly privateCheckerPath: string;
  readonly privateInputPath: string;
  readonly privateOutputPath: string;
}

export function buildProblemPaths(problemRootDir: string): ProblemPaths {
  const publicDir: string = join(problemRootDir, "public");
  const solutionDir: string = join(problemRootDir, "solution");
  const privateDir: string = join(problemRootDir, "private");
  const slug: string = problemRootDir.split("/").at(-1) ?? problemRootDir;

  return {
    slug,
    rootDir: problemRootDir,
    publicDir,
    solutionDir,
    privateDir,
    publicStatementPath: join(publicDir, "statement.md"),
    publicSampleInputPath: join(publicDir, "sample-input.txt"),
    publicSampleOutputPath: join(publicDir, "sample-output.txt"),
    solutionEntryPath: join(solutionDir, "solution.ts"),
    privateGeneratorPath: join(privateDir, "generator.ts"),
    privateValidatorPath: join(privateDir, "validator.ts"),
    privateCheckerPath: join(privateDir, "checker.ts"),
    privateInputPath: join(privateDir, "input.txt"),
    privateOutputPath: join(privateDir, "output.txt")
  };
}

export function getProblemWorkerScriptPath(): string {
  return join(getRepoRoot(), "src", "worker", "problemWorker.ts");
}

export function getProblemsRoot(): string {
  return join(getRepoRoot(), "problems");
}

export function getRepoRoot(): string {
  return process.cwd();
}

export function getTsxBinaryPath(): string {
  const binaryName: string = process.platform === "win32" ? "tsx.cmd" : "tsx";
  return join(getRepoRoot(), "node_modules", ".bin", binaryName);
}

