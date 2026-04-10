import type { CheckerArgs, CheckerResult, ProblemChecker } from "../../../../src/contracts/problem";

function buildError(message: string): CheckerResult {
  return { kind: "wrong-answer", message, ok: false };
}

function normalizeNewlines(text: string): string {
  return text.replace(/\r\n/g, "\n");
}

interface CaseInput {
  readonly n: number;
  readonly m: bigint;
  readonly a: readonly bigint[];
}

function parseInput(input: string): readonly CaseInput[] {
  const lines = normalizeNewlines(input).trim().split("\n").map((l) => l.trim());
  const t = Number(lines[0]!);
  const cases: CaseInput[] = [];
  let lineIndex = 1;

  for (let i = 0; i < t; i++) {
    const parts = lines[lineIndex]!.split(/\s+/);
    const n = Number(parts[0]!);
    const m = BigInt(parts[1]!);
    lineIndex++;
    const a = lines[lineIndex]!.split(/\s+/).map((v) => BigInt(v));
    lineIndex++;
    cases.push({ a, m, n });
  }

  return cases;
}

interface ParsedCase {
  readonly brickCount: bigint;
  readonly heights: readonly bigint[];
}

function parseExpectedBrickCounts(expectedOutput: string, caseCount: number): readonly bigint[] {
  const lines = normalizeNewlines(expectedOutput).trim().split("\n").map((l) => l.trim());
  const counts: bigint[] = [];
  let lineIndex = 0;

  for (let i = 0; i < caseCount; i++) {
    const header = lines[lineIndex]!;
    const match = header.match(/^Case #\d+:\s+(\d+)$/);
    if (match === null) {
      counts.push(-1n);
      lineIndex++;
      continue;
    }
    counts.push(BigInt(match[1]!));
    lineIndex++;
    // Skip the heights line
    lineIndex++;
  }

  return counts;
}

function parseActualOutput(
  actualOutput: string,
  cases: readonly CaseInput[]
): CheckerResult | readonly ParsedCase[] {
  const lines = normalizeNewlines(actualOutput).trim().split("\n").map((l) => l.trim());
  const parsed: ParsedCase[] = [];
  let lineIndex = 0;

  for (let i = 0; i < cases.length; i++) {
    const caseNum = i + 1;

    if (lineIndex >= lines.length) {
      return buildError(`Missing output for case ${String(caseNum)}.`);
    }

    const header = lines[lineIndex]!;
    const headerMatch = header.match(/^Case #(\d+):\s+(\d+)$/);

    if (headerMatch === null) {
      return buildError(
        `Invalid header format for case ${String(caseNum)}: "${header}". Expected "Case #${String(caseNum)}: <brick_count>".`
      );
    }

    if (Number(headerMatch[1]!) !== caseNum) {
      return buildError(
        `Header case number mismatch: expected Case #${String(caseNum)}, got Case #${headerMatch[1]!}.`
      );
    }

    const brickCount = BigInt(headerMatch[2]!);
    lineIndex++;

    if (lineIndex >= lines.length) {
      return buildError(`Missing heights line for case ${String(caseNum)}.`);
    }

    const heightTokens = lines[lineIndex]!.split(/\s+/).filter((t) => t.length > 0);
    lineIndex++;

    if (heightTokens.length !== cases[i]!.n) {
      return buildError(
        `Case #${String(caseNum)}: expected ${String(cases[i]!.n)} heights, got ${String(heightTokens.length)}.`
      );
    }

    const heights: bigint[] = [];
    for (const token of heightTokens) {
      if (!/^\d+$/.test(token)) {
        return buildError(`Case #${String(caseNum)}: invalid height value "${token}".`);
      }
      heights.push(BigInt(token));
    }

    parsed.push({ brickCount, heights });
  }

  return parsed;
}

const checker: ProblemChecker = {
  check(args: CheckerArgs): CheckerResult {
    const cases = parseInput(args.input);
    const actualParsed = parseActualOutput(args.actualOutput, cases);

    if (!Array.isArray(actualParsed)) {
      return actualParsed;
    }

    const expectedBrickCounts = parseExpectedBrickCounts(args.expectedOutput, cases.length);

    for (let i = 0; i < cases.length; i++) {
      const caseNum = i + 1;
      const caseInput = cases[i]!;
      const actual = actualParsed[i]!;
      const expectedBricks = expectedBrickCounts[i]!;

      // Check heights are non-negative
      for (let j = 0; j < caseInput.n; j++) {
        if (actual.heights[j]! < 0n) {
          return buildError(`Case #${String(caseNum)}: height x_${String(j + 1)} is negative.`);
        }
      }

      // Check heights are non-increasing
      for (let j = 1; j < caseInput.n; j++) {
        if (actual.heights[j]! > actual.heights[j - 1]!) {
          return buildError(
            `Case #${String(caseNum)}: heights are not non-increasing (x_${String(j)} = ${String(actual.heights[j - 1]!)} < x_${String(j + 1)} = ${String(actual.heights[j]!)}).`
          );
        }
      }

      // Check weighted sum >= M
      let weightedSum = 0n;
      for (let j = 0; j < caseInput.n; j++) {
        weightedSum += caseInput.a[j]! * actual.heights[j]!;
      }
      if (weightedSum < caseInput.m) {
        return buildError(
          `Case #${String(caseNum)}: weighted sum ${String(weightedSum)} is less than M = ${String(caseInput.m)}.`
        );
      }

      // Check total bricks matches stated count
      let totalBricks = 0n;
      for (let j = 0; j < caseInput.n; j++) {
        totalBricks += actual.heights[j]!;
      }
      if (totalBricks !== actual.brickCount) {
        return buildError(
          `Case #${String(caseNum)}: stated brick count ${String(actual.brickCount)} does not match actual sum ${String(totalBricks)}.`
        );
      }

      // Check brick count matches expected optimal
      if (expectedBricks >= 0n && actual.brickCount !== expectedBricks) {
        return buildError(
          `Case #${String(caseNum)}: brick count ${String(actual.brickCount)} does not match expected optimal ${String(expectedBricks)}.`
        );
      }
    }

    return { ok: true };
  }
};

export default checker;
