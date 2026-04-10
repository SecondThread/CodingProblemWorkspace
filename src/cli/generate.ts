import { discoverProblems } from "../runner/discoverProblems";
import { generateProblemData } from "../runner/generateProblemData";

async function main(): Promise<void> {
  const problemSelector: string | undefined = process.argv[2];

  if (problemSelector === undefined) {
    throw new Error("Usage: npm run generate -- <problem-slug|all>");
  }

  const problems = discoverProblems();
  const selectedProblems =
    problemSelector === "all" ? problems : problems.filter((problem) => problem.slug === problemSelector);

  if (selectedProblems.length === 0) {
    throw new Error(`No problem matched selector: ${problemSelector}`);
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

