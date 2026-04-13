import type { CheckerArgs, CheckerResult, ProblemChecker } from "../../../../src/contracts/problem";

function buildError(message: string): CheckerResult {
  return { ok: false, kind: "wrong-answer", message };
}

function normalizeNewlines(text: string): string {
  return text.replace(/\r\n/g, "\n");
}

const checker: ProblemChecker = {
  check(args: CheckerArgs): CheckerResult {
    const expectedLines = normalizeNewlines(args.expectedOutput).trim().split("\n");
    const actualLines = normalizeNewlines(args.actualOutput).trim().split("\n");

    if (actualLines.length !== expectedLines.length) {
      return buildError(
        `Expected ${String(expectedLines.length)} output lines, got ${String(actualLines.length)}.`
      );
    }

    const totalCases = expectedLines.length;
    let skippedCount = 0;

    for (let i = 0; i < totalCases; i += 1) {
      const expected = expectedLines[i]!;
      const actual = actualLines[i]!;

      // Parse case header
      const expectedMatch = expected.match(/^Case #(\d+): (.*)$/);
      const actualMatch = actual.match(/^Case #(\d+): (.*)$/);

      if (expectedMatch === null) {
        return buildError(`Could not parse expected output line ${String(i + 1)}: "${expected}"`);
      }

      if (actualMatch === null) {
        return buildError(`Could not parse actual output line ${String(i + 1)}: "${actual}"`);
      }

      if (expectedMatch[1] !== actualMatch[1]) {
        return buildError(
          `Case number mismatch on line ${String(i + 1)}: expected Case #${expectedMatch[1]!}, got Case #${actualMatch[1]!}.`
        );
      }

      const actualAnswer = actualMatch[2]!;

      if (actualAnswer === "SKIP") {
        skippedCount += 1;
        continue;
      }

      const expectedAnswer = expectedMatch[2]!;
      if (actualAnswer !== expectedAnswer) {
        return buildError(
          `Case #${expectedMatch[1]!}: Wrong answer. Expected length ${String(expectedAnswer.length)}, got length ${String(actualAnswer.length)}.`
        );
      }
    }

    // Check skip percentage
    const maxSkips = Math.floor(totalCases * 0.6);
    if (skippedCount > maxSkips) {
      return buildError(
        `Too many skips: ${String(skippedCount)} out of ${String(totalCases)} cases skipped (max allowed: ${String(maxSkips)}).`
      );
    }

    return { ok: true };
  }
};

export default checker;
