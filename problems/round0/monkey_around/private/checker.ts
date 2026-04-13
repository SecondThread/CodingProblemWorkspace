import type { CheckerArgs, CheckerResult, ProblemChecker } from "../../../../src/contracts/problem";

function normalizeOutput(text: string): string {
  return text.replace(/\r\n/g, "\n").trimEnd();
}

const checker: ProblemChecker = {
  check(args: CheckerArgs): CheckerResult {
    const inputLines: readonly string[] = normalizeOutput(args.input).split("\n");
    const actualLines: string[] = normalizeOutput(args.actualOutput).split("\n");

    const t: number = Number(inputLines[0]!);
    let inputIdx: number = 1;
    let actualIdx: number = 0;

    for (let c = 1; c <= t; c += 1) {
      const n: number = Number(inputLines[inputIdx]!);
      inputIdx += 1;
      const a: number[] = inputLines[inputIdx]!.trim().split(/\s+/).map(Number);
      inputIdx += 1;

      // Parse "Case #c: M" from actual output
      if (actualIdx >= actualLines.length) {
        return { ok: false, kind: "wrong-answer", message: `Case ${String(c)}: missing case header line` };
      }
      const headerLine: string = actualLines[actualIdx]!.trim();
      actualIdx += 1;

      const headerMatch: RegExpMatchArray | null = headerLine.match(/^Case\s*#(\d+):\s*(\d+)$/);
      if (headerMatch === null) {
        return { ok: false, kind: "presentation-error", message: `Case ${String(c)}: invalid header "${headerLine}"` };
      }
      const caseNum: number = Number(headerMatch[1]!);
      if (caseNum !== c) {
        return { ok: false, kind: "presentation-error", message: `Case ${String(c)}: expected case number ${String(c)}, got ${String(caseNum)}` };
      }
      const m: number = Number(headerMatch[2]!);

      if (m > 2 * n) {
        return { ok: false, kind: "wrong-answer", message: `Case ${String(c)}: M=${String(m)} exceeds 2*N=${String(2 * n)}` };
      }

      // Read M operation lines
      const ops: Array<number[]> = [];
      for (let j = 0; j < m; j += 1) {
        if (actualIdx >= actualLines.length) {
          return { ok: false, kind: "wrong-answer", message: `Case ${String(c)}: missing operation line ${String(j + 1)}` };
        }
        const parts: string[] = actualLines[actualIdx]!.trim().split(/\s+/);
        actualIdx += 1;
        ops.push(parts.map(Number));
      }

      // Simulate operations
      const b: number[][] = [];
      for (const op of ops) {
        if (op[0] === 1) {
          const k: number = op[1]!;
          if (k < 1) {
            return { ok: false, kind: "wrong-answer", message: `Case ${String(c)}: invalid insert size ${String(k)}` };
          }
          const identity: number[] = [];
          for (let j = 1; j <= k; j += 1) identity.push(j);
          b.push(identity);
        } else if (op[0] === 2) {
          // Rotate all permutations left by 1
          for (const perm of b) {
            const first: number = perm[0]!;
            for (let j = 0; j < perm.length - 1; j += 1) {
              perm[j] = perm[j + 1]!;
            }
            perm[perm.length - 1] = first;
          }
        } else {
          return { ok: false, kind: "wrong-answer", message: `Case ${String(c)}: unknown operation type ${String(op[0])}` };
        }
      }

      // Flatten B and compare to A
      const flat: number[] = [];
      for (const perm of b) {
        for (const v of perm) flat.push(v);
      }

      if (flat.length !== a.length) {
        return { ok: false, kind: "wrong-answer", message: `Case ${String(c)}: produced array of length ${String(flat.length)}, expected ${String(a.length)}` };
      }

      for (let j = 0; j < a.length; j += 1) {
        if (flat[j] !== a[j]) {
          return { ok: false, kind: "wrong-answer", message: `Case ${String(c)}: mismatch at position ${String(j)}: expected ${String(a[j])}, got ${String(flat[j])}` };
        }
      }
    }

    return { ok: true };
  }
};

export default checker;
