import type { CheckerArgs, CheckerResult, ProblemChecker } from "../../../../src/contracts/problem";

function normalizeOutput(text: string): string {
  return text.replace(/\r\n/g, "\n").trimEnd();
}

const checker: ProblemChecker = {
  check(args: CheckerArgs): CheckerResult {
    const inputLines = args.input.trim().split("\n").map((l) => l.trim());
    const expectedLines = normalizeOutput(args.expectedOutput).split("\n");
    const actualLines = normalizeOutput(args.actualOutput).split("\n");

    const t = Number(inputLines[0]!);

    if (actualLines.length < t) {
      return {
        ok: false,
        kind: "presentation-error",
        message: `Expected ${String(t)} output lines, got ${String(actualLines.length)}.`
      };
    }

    let lineIndex = 1;
    for (let c = 1; c <= t; c++) {
      const parts = inputLines[lineIndex]!.split(/\s+/);
      const n = Number(parts[0]!);
      const m = Number(parts[1]!);
      lineIndex++;

      const edges: [number, number][] = [];
      for (let e = 0; e < m; e++) {
        const ep = inputLines[lineIndex]!.split(/\s+/);
        edges.push([Number(ep[0]!), Number(ep[1]!)]);
        lineIndex++;
      }

      // Parse expected
      const expectedMatch = expectedLines[c - 1]!.match(/^Case #(\d+):\s+(\d+)\s+(.+)$/);
      if (!expectedMatch) {
        return {
          ok: false,
          kind: "runtime-error",
          message: `Could not parse expected output line for case ${String(c)}.`
        };
      }
      const expectedCost = BigInt(expectedMatch[2]!);

      // Parse actual
      const actualMatch = actualLines[c - 1]!.match(/^Case #(\d+):\s+(\d+)\s+(.+)$/);
      if (!actualMatch) {
        return {
          ok: false,
          kind: "presentation-error",
          message: `Case ${String(c)}: could not parse output. Expected format "Case #${String(c)}: COST ASSIGNMENT".`
        };
      }

      const actualCaseNum = Number(actualMatch[1]!);
      if (actualCaseNum !== c) {
        return {
          ok: false,
          kind: "presentation-error",
          message: `Case ${String(c)}: case number mismatch, got ${String(actualCaseNum)}.`
        };
      }

      const claimedCost = BigInt(actualMatch[2]!);
      const assignment = actualMatch[3]!.trim();

      if (assignment.length !== m) {
        return {
          ok: false,
          kind: "wrong-answer",
          message: `Case ${String(c)}: assignment length is ${String(assignment.length)}, expected ${String(m)}.`
        };
      }

      if (!/^[12]+$/.test(assignment)) {
        return {
          ok: false,
          kind: "wrong-answer",
          message: `Case ${String(c)}: assignment must contain only '1' and '2'.`
        };
      }

      // Compute actual cost from assignment and edges
      const deg: [bigint, bigint][] = new Array(n + 1);
      for (let i = 0; i <= n; i++) deg[i] = [BigInt(0), BigInt(0)];

      for (let i = 0; i < m; i++) {
        const [u, v] = edges[i]!;
        const day = assignment[i] === "1" ? 0 : 1;
        deg[u]![day]++;
        deg[v]![day]++;
      }

      let computedCost = BigInt(0);
      for (let j = 0; j <= 1; j++) {
        for (let i = 1; i <= n; i++) {
          computedCost += deg[i]![j]! * deg[i]![j]!;
        }
      }

      if (computedCost !== claimedCost) {
        return {
          ok: false,
          kind: "wrong-answer",
          message: `Case ${String(c)}: claimed cost is ${String(claimedCost)} but computed cost from assignment is ${String(computedCost)}.`
        };
      }

      if (computedCost !== expectedCost) {
        return {
          ok: false,
          kind: "wrong-answer",
          message: `Case ${String(c)}: cost is ${String(computedCost)} but optimal cost is ${String(expectedCost)}.`
        };
      }
    }

    return { ok: true };
  }
};

export default checker;
