import type { CheckerArgs, CheckerResult, ProblemChecker } from "../../../src/contracts/problem";

function normalizeOutput(text: string): string {
  return text.replace(/\r\n/g, "\n").trimEnd();
}

function buildMismatchMessage(expected: readonly string[], actual: readonly string[]): string {
  const lineCount: number = Math.max(expected.length, actual.length);

  for (let index = 0; index < lineCount; index += 1) {
    const expectedLine: string | undefined = expected[index];
    const actualLine: string | undefined = actual[index];

    if (expectedLine !== actualLine) {
      return `Line ${String(index + 1)} differs. Expected "${expectedLine ?? "<missing>"}" but received "${actualLine ?? "<missing>"}".`;
    }
  }

  return "Output differs from the expected output.";
}

const checker: ProblemChecker = {
  check(args: CheckerArgs): CheckerResult {
    const normalizedExpected: string = normalizeOutput(args.expectedOutput);
    const normalizedActual: string = normalizeOutput(args.actualOutput);

    if (normalizedExpected === normalizedActual) {
      return { ok: true };
    }

    const expectedLines: readonly string[] = normalizedExpected.split("\n");
    const actualLines: readonly string[] = normalizedActual.split("\n");

    return {
      kind: "wrong-answer",
      message: buildMismatchMessage(expectedLines, actualLines),
      ok: false
    };
  }
};

export default checker;
