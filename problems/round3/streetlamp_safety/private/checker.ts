import type { CheckerArgs, CheckerResult, ProblemChecker } from "../../../../src/contracts/problem";

function normalizeOutput(text: string): string {
  return text.replace(/\r\n/g, "\n").trimEnd();
}

function buildMismatchMessage(expected: readonly string[], actual: readonly string[]): string {
  const lineCount = Math.max(expected.length, actual.length);
  for (let index = 0; index < lineCount; index += 1) {
    const expectedLine = expected[index];
    const actualLine = actual[index];
    if (expectedLine !== actualLine) {
      return `Line ${String(index + 1)} differs. Expected "${expectedLine ?? "<missing>"}" but received "${actualLine ?? "<missing>"}".`;
    }
  }
  return "Output differs from the expected output.";
}

const checker: ProblemChecker = {
  check(args: CheckerArgs): CheckerResult {
    const normalizedExpected = normalizeOutput(args.expectedOutput);
    const normalizedActual = normalizeOutput(args.actualOutput);
    if (normalizedExpected === normalizedActual) return { ok: true };
    return {
      kind: "wrong-answer",
      message: buildMismatchMessage(normalizedExpected.split("\n"), normalizedActual.split("\n")),
      ok: false
    };
  }
};
export default checker;
