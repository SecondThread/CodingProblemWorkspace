import { runJsonProblemWorker } from "./runProblemWorker";
import type { ProblemPaths } from "../utils/paths";

interface ValidationSuccess {
  readonly ok: true;
}

export async function validateProblemData(problem: ProblemPaths, input: string): Promise<void> {
  await runJsonProblemWorker<ValidationSuccess>({
    action: "validate",
    input,
    modulePath: problem.privateValidatorPath
  });
}

