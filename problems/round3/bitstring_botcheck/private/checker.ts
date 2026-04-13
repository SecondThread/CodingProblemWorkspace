import type { CheckerArgs, CheckerResult, ProblemChecker } from "../../../../src/contracts/problem";

function fail(message: string): CheckerResult {
  return { ok: false, kind: "wrong-answer", message };
}

const checker: ProblemChecker = {
  check(args: CheckerArgs): CheckerResult {
    const inputLines = args.input.trim().split("\n").map((l) => l.trim());
    const actualLines = args.actualOutput.replace(/\r\n/g, "\n").trimEnd().split("\n").map((l) => l.trim());

    const t = Number(inputLines[0]!);
    let inIdx = 1;
    let outIdx = 0;

    for (let c = 1; c <= t; c += 1) {
      const n = Number(inputLines[inIdx]!);
      inIdx += 1;
      const s = inputLines[inIdx]!.split("");
      inIdx += 1;

      if (outIdx >= actualLines.length) {
        return fail(`Case #${String(c)}: missing output`);
      }

      const headerLine = actualLines[outIdx]!;
      outIdx += 1;

      // Parse "Case #c: M"
      const headerMatch = headerLine.match(/^Case\s+#(\d+):\s*(.+)$/);
      if (headerMatch == null) {
        return fail(`Case #${String(c)}: invalid header format "${headerLine}"`);
      }

      const caseNum = Number(headerMatch[1]!);
      if (caseNum !== c) {
        return fail(`Expected Case #${String(c)} but got Case #${String(caseNum)}`);
      }

      const mStr = headerMatch[2]!.trim();
      const m = Number(mStr);

      if (!Number.isInteger(m) || m < 0) {
        return fail(`Case #${String(c)}: invalid M value "${mStr}"`);
      }

      if (m > 10 * n) {
        return fail(`Case #${String(c)}: M=${String(m)} exceeds 10*N=${String(10 * n)}`);
      }

      const workS = s.slice();

      for (let op = 0; op < m; op += 1) {
        if (outIdx >= actualLines.length) {
          return fail(`Case #${String(c)}, operation ${String(op + 1)}: missing A line`);
        }
        const aTokens = actualLines[outIdx]!.split(/\s+/).map(Number);
        outIdx += 1;

        if (outIdx >= actualLines.length) {
          return fail(`Case #${String(c)}, operation ${String(op + 1)}: missing B line`);
        }
        const bTokens = actualLines[outIdx]!.split(/\s+/).map(Number);
        outIdx += 1;

        if (aTokens.length !== n) {
          return fail(
            `Case #${String(c)}, op ${String(op + 1)}: A has ${String(aTokens.length)} elements, expected ${String(n)}`
          );
        }
        if (bTokens.length !== n) {
          return fail(
            `Case #${String(c)}, op ${String(op + 1)}: B has ${String(bTokens.length)} elements, expected ${String(n)}`
          );
        }

        // Check sorted
        for (let i = 1; i < n; i += 1) {
          if (aTokens[i]! < aTokens[i - 1]!) {
            return fail(`Case #${String(c)}, op ${String(op + 1)}: A is not sorted`);
          }
          if (bTokens[i]! < bTokens[i - 1]!) {
            return fail(`Case #${String(c)}, op ${String(op + 1)}: B is not sorted`);
          }
        }

        // Check every index in [1..2N] appears exactly once
        const seen = new Uint8Array(2 * n + 1);
        for (const x of aTokens) {
          if (x < 1 || x > 2 * n) {
            return fail(`Case #${String(c)}, op ${String(op + 1)}: index ${String(x)} out of range`);
          }
          seen[x] = 1;
        }
        for (const x of bTokens) {
          if (x < 1 || x > 2 * n) {
            return fail(`Case #${String(c)}, op ${String(op + 1)}: index ${String(x)} out of range`);
          }
          if (seen[x] === 1) {
            return fail(`Case #${String(c)}, op ${String(op + 1)}: index ${String(x)} appears in both A and B`);
          }
          seen[x] = 1;
        }
        for (let i = 1; i <= 2 * n; i += 1) {
          if (seen[i] !== 1) {
            return fail(`Case #${String(c)}, op ${String(op + 1)}: index ${String(i)} missing from A and B`);
          }
        }

        // Apply swaps (1-indexed to 0-indexed)
        for (let i = 0; i < n; i += 1) {
          const ai = aTokens[i]! - 1;
          const bi = bTokens[i]! - 1;
          const tmp = workS[ai]!;
          workS[ai] = workS[bi]!;
          workS[bi] = tmp;
        }
      }

      // Check sorted
      for (let i = 1; i < 2 * n; i += 1) {
        if (workS[i]! < workS[i - 1]!) {
          return fail(`Case #${String(c)}: string is not sorted after applying operations`);
        }
      }
    }

    return { ok: true };
  }
};

export default checker;
