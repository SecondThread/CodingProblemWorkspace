import type { GeneratedCase } from "../contracts/problem";
import type { ProblemPaths } from "../utils/paths";
import { writeTextFile } from "../utils/fs";
import { runJsonProblemWorker } from "./runProblemWorker";
import { validateProblemData } from "./validateProblemData";

export async function generateProblemData(problem: ProblemPaths): Promise<GeneratedCase> {
  const generatedCase: GeneratedCase = await runJsonProblemWorker<GeneratedCase>({
    action: "generate",
    modulePath: problem.privateGeneratorPath
  });

  await validateProblemData(problem, generatedCase.input);
  await writeTextFile(problem.privateInputPath, generatedCase.input);
  await writeTextFile(problem.privateOutputPath, generatedCase.output);

  return generatedCase;
}

