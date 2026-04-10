import type { CheckerArgs, CheckerResult } from "../contracts/problem";
import type { ProblemPaths } from "../utils/paths";
import { runJsonProblemWorker } from "./runProblemWorker";

export async function checkSolutionOutput(problem: ProblemPaths, args: CheckerArgs): Promise<void> {
  const result: CheckerResult = await runJsonProblemWorker<CheckerResult>({
    action: "check",
    input: JSON.stringify(args),
    modulePath: problem.privateCheckerPath
  });

  if (!result.ok) {
    throw new Error(`Checker rejected output for ${problem.slug}: ${result.kind}: ${result.message}`);
  }
}

