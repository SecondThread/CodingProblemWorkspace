import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export const CASE_SEPARATOR = "\n<<CASE>>\n";

export type CaseKind = "sample" | "hidden";

export interface HiddenCase {
  readonly label: string;
  readonly input: string;
  readonly expectedOutput: string;
}

export interface Judgment {
  readonly ok: boolean;
  readonly message: string;
}

export interface JudgeContext<TId extends string = string> {
  readonly problem: ProblemDefinition<TId>;
  readonly caseKind: CaseKind;
  readonly caseLabel: string;
  readonly input: string;
  readonly expectedOutput: string;
  readonly actualOutput: string;
}

export type Judge<TId extends string = string> = (
  context: JudgeContext<TId>,
) => Judgment;

export interface ProblemDefinition<TId extends string = string> {
  readonly id: TId;
  readonly title: string;
  readonly solve: (input: string) => string;
  readonly buildHiddenCaseSet?: () => readonly HiddenCase[];
  readonly judgeOutput?: Judge<TId>;
}

type ProblemAssetName =
  | "problem.md"
  | "sample-input.txt"
  | "sample-output.txt"
  | "hidden-input.txt"
  | "hidden-output.txt";

function normalizeNewlines(text: string): string {
  return text.replace(/\r\n/g, "\n");
}

function normalizeBlock(text: string): string {
  return normalizeNewlines(text).trimEnd();
}

function defaultJudge<TId extends string>(
  context: JudgeContext<TId>,
): Judgment {
  if (normalizeBlock(context.actualOutput) === normalizeBlock(context.expectedOutput)) {
    return { ok: true, message: `${context.problem.id} ${context.caseKind} ${context.caseLabel} passed` };
  }

  return {
    ok: false,
    message: [
      `${context.problem.id} ${context.caseKind} ${context.caseLabel} failed`,
      `expected: ${JSON.stringify(normalizeBlock(context.expectedOutput))}`,
      `actual: ${JSON.stringify(normalizeBlock(context.actualOutput))}`,
    ].join("\n"),
  };
}

export function problemAssetPath(problemId: string, assetName: ProblemAssetName): string {
  return join(process.cwd(), "problems", problemId, assetName);
}

export function readProblemAsset(problemId: string, assetName: ProblemAssetName): string {
  return readFileSync(problemAssetPath(problemId, assetName), "utf8");
}

function writeProblemAsset(problemId: string, assetName: ProblemAssetName, content: string): void {
  const assetPath = problemAssetPath(problemId, assetName);
  mkdirSync(dirname(assetPath), { recursive: true });
  writeFileSync(assetPath, content, "utf8");
}

export function serializeCaseSet(blocks: readonly string[]): string {
  return `${blocks.map(normalizeBlock).join(CASE_SEPARATOR)}\n`;
}

export function parseCaseSet(serialized: string): readonly string[] {
  const normalized = normalizeNewlines(serialized).trim();
  if (normalized === "") {
    return [];
  }

  return normalized.split(CASE_SEPARATOR).map((block) => `${normalizeBlock(block)}\n`);
}

function runJudge<TId extends string>(
  problem: ProblemDefinition<TId>,
  caseKind: CaseKind,
  caseLabel: string,
  input: string,
  expectedOutput: string,
): Judgment {
  const actualOutput = problem.solve(input);
  const judge = problem.judgeOutput ?? defaultJudge<TId>;

  return judge({
    problem,
    caseKind,
    caseLabel,
    input,
    expectedOutput,
    actualOutput,
  });
}

function loadHiddenCaseSet<TId extends string>(
  problem: ProblemDefinition<TId>,
): readonly HiddenCase[] {
  const inputs = parseCaseSet(readProblemAsset(problem.id, "hidden-input.txt"));
  const outputs = parseCaseSet(readProblemAsset(problem.id, "hidden-output.txt"));

  if (inputs.length !== outputs.length) {
    throw new Error(
      `Hidden case file count mismatch for ${problem.id}: ${inputs.length} inputs vs ${outputs.length} outputs`,
    );
  }

  return inputs.map((input, index) => {
    const expectedOutput = outputs[index];
    if (expectedOutput === undefined) {
      throw new Error(`Missing hidden output for ${problem.id} case ${index + 1}`);
    }

    return {
      label: `case-${index + 1}`,
      input,
      expectedOutput,
    };
  });
}

export function judgeProblem<TId extends string>(
  problem: ProblemDefinition<TId>,
  caseKind: CaseKind,
): Judgment {
  if (caseKind === "sample") {
    return runJudge(
      problem,
      "sample",
      "sample",
      readProblemAsset(problem.id, "sample-input.txt"),
      readProblemAsset(problem.id, "sample-output.txt"),
    );
  }

  const hiddenCases = loadHiddenCaseSet(problem);
  for (const hiddenCase of hiddenCases) {
    const judgment = runJudge(
      problem,
      "hidden",
      hiddenCase.label,
      hiddenCase.input,
      hiddenCase.expectedOutput,
    );

    if (!judgment.ok) {
      return judgment;
    }
  }

  return {
    ok: true,
    message: `${problem.id} hidden passed ${hiddenCases.length} cases`,
  };
}

export function writeHiddenCaseFiles<TId extends string>(
  problem: ProblemDefinition<TId>,
): { readonly inputPath: string; readonly outputPath: string; readonly caseCount: number } {
  if (problem.buildHiddenCaseSet === undefined) {
    throw new Error(`Problem ${problem.id} does not define buildHiddenCaseSet()`);
  }

  const hiddenCases = problem.buildHiddenCaseSet();
  writeProblemAsset(
    problem.id,
    "hidden-input.txt",
    serializeCaseSet(hiddenCases.map((hiddenCase) => hiddenCase.input)),
  );
  writeProblemAsset(
    problem.id,
    "hidden-output.txt",
    serializeCaseSet(hiddenCases.map((hiddenCase) => hiddenCase.expectedOutput)),
  );

  return {
    inputPath: problemAssetPath(problem.id, "hidden-input.txt"),
    outputPath: problemAssetPath(problem.id, "hidden-output.txt"),
    caseCount: hiddenCases.length,
  };
}
