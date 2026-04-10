import { mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { copyDirectory, removeDirectory } from "../utils/fs";
import type { ProblemPaths } from "../utils/paths";
import { runProblemWorker, type WorkerRunResult } from "./runProblemWorker";

export async function runSolutionInSandbox(
  problem: ProblemPaths,
  input: string,
  timeoutMs = 30_000
): Promise<WorkerRunResult> {
  const sandboxRoot: string = await mkdtemp(join(tmpdir(), `coding-problem-${problem.slug}-`));

  try {
    const sandboxPublicDir: string = join(sandboxRoot, "public");
    const sandboxSolutionDir: string = join(sandboxRoot, "solution");
    const sandboxSolutionEntryPath: string = join(sandboxSolutionDir, "solution.ts");

    await copyDirectory(problem.publicDir, sandboxPublicDir);
    await copyDirectory(problem.solutionDir, sandboxSolutionDir);

    const result = await runProblemWorker({
      action: "solution",
      cwd: sandboxRoot,
      input,
      modulePath: sandboxSolutionEntryPath,
      timeoutMs
    });

    return result;
  } finally {
    await removeDirectory(sandboxRoot);
  }
}
