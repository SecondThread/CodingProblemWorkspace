import { discoverProblems, isProblemComplete } from "../runner/discoverProblems";
import { generateProblemData } from "../runner/generateProblemData";

async function main(): Promise<void> {
  const problemSelector: string | undefined = process.argv[2];

  if (problemSelector === undefined) {
    throw new Error("Usage: yarn generate <problem-slug|all>");
  }

  const problems = discoverProblems();
  const matchedProblem: ProblemLike | undefined =
    problemSelector === "all" ? undefined : problems.find((problem) => problem.slug === problemSelector);

  let selectedProblems: readonly ProblemLike[];

  if (problemSelector === "all") {
    selectedProblems = problems.filter((problem) => isProblemComplete(problem));
  } else if (matchedProblem === undefined) {
    throw new Error(`No problem matched selector: ${problemSelector}`);
  } else if (!isProblemComplete(matchedProblem)) {
    throw new Error(`Problem ${problemSelector} is incomplete and cannot generate private data yet.`);
  } else {
    selectedProblems = [matchedProblem];
  }

  if (selectedProblems.length === 0) {
    throw new Error("No complete problems are available for generation.");
  }

  for (const problem of selectedProblems) {
    await generateProblemData(problem);
    console.log(`Generated private data for ${problem.slug}`);
  }
}

void main().catch((error: unknown) => {
  const message: string = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});

type ProblemLike = ReturnType<typeof discoverProblems>[number];
