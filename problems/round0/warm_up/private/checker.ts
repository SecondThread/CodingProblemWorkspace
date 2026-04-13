import type { CheckerArgs, CheckerResult, ProblemChecker } from "../../../../src/contracts/problem";

function normalizeOutput(text: string): string {
  return text.replace(/\r\n/g, "\n").trimEnd();
}

interface ParsedCase {
  readonly impossible: boolean;
  readonly k: number;
  readonly ops: ReadonlyArray<[number, number]>;
}

function parseCases(output: string, t: number): ParsedCase[] | string {
  const lines: string[] = normalizeOutput(output).split("\n");
  const cases: ParsedCase[] = [];
  let lineIndex = 0;

  for (let c = 1; c <= t; c += 1) {
    if (lineIndex >= lines.length) {
      return `Missing output for case ${String(c)}`;
    }
    const header: string = lines[lineIndex]!;
    lineIndex += 1;

    const prefix = `Case #${String(c)}: `;
    if (!header.startsWith(prefix)) {
      return `Case ${String(c)}: Expected header starting with "${prefix}", got "${header}"`;
    }
    const rest: string = header.slice(prefix.length).trim();

    if (rest === "-1") {
      cases.push({ impossible: true, k: 0, ops: [] });
      continue;
    }

    const k: number = Number(rest);
    if (!Number.isInteger(k) || k < 0) {
      return `Case ${String(c)}: Expected K or -1, got "${rest}"`;
    }

    const ops: Array<[number, number]> = [];
    for (let o = 0; o < k; o += 1) {
      if (lineIndex >= lines.length) {
        return `Case ${String(c)}: Missing operation line ${String(o + 1)} of ${String(k)}`;
      }
      const parts: string[] = lines[lineIndex]!.trim().split(/\s+/);
      lineIndex += 1;
      if (parts.length !== 2) {
        return `Case ${String(c)}: Operation line ${String(o + 1)} must have 2 numbers, got ${String(parts.length)}`;
      }
      const i: number = Number(parts[0]!);
      const j: number = Number(parts[1]!);
      if (!Number.isInteger(i) || !Number.isInteger(j)) {
        return `Case ${String(c)}: Operation contains non-integer values`;
      }
      ops.push([i, j]);
    }

    cases.push({ impossible: false, k, ops });
  }

  return cases;
}

const checker: ProblemChecker = {
  check(args: CheckerArgs): CheckerResult {
    const inputLines: string[] = args.input.trim().split("\n").map((l) => l.trim());
    const t: number = Number(inputLines[0]!);

    const expectedResult = parseCases(args.expectedOutput, t);
    if (typeof expectedResult === "string") {
      return { ok: false, kind: "presentation-error", message: `Error parsing expected output: ${expectedResult}` };
    }

    const actualResult = parseCases(args.actualOutput, t);
    if (typeof actualResult === "string") {
      return { ok: false, kind: "presentation-error", message: actualResult };
    }

    let inputLineIndex = 1;
    for (let c = 0; c < t; c += 1) {
      const n: number = Number(inputLines[inputLineIndex]!);
      inputLineIndex += 1;
      const a: number[] = inputLines[inputLineIndex]!.split(" ").map(Number);
      inputLineIndex += 1;
      const b: number[] = inputLines[inputLineIndex]!.split(" ").map(Number);
      inputLineIndex += 1;

      const expected: ParsedCase = expectedResult[c]!;
      const actual: ParsedCase = actualResult[c]!;

      if (expected.impossible) {
        if (!actual.impossible) {
          return {
            ok: false,
            kind: "wrong-answer",
            message: `Case ${String(c + 1)}: Expected -1 but got ${String(actual.k)} operations`
          };
        }
        continue;
      }

      if (actual.impossible) {
        return {
          ok: false,
          kind: "wrong-answer",
          message: `Case ${String(c + 1)}: Expected a valid answer but got -1`
        };
      }

      if (actual.k > n) {
        return {
          ok: false,
          kind: "wrong-answer",
          message: `Case ${String(c + 1)}: K=${String(actual.k)} exceeds N=${String(n)}`
        };
      }

      const temps: number[] = [...a];
      for (let o = 0; o < actual.k; o += 1) {
        const [pi, pj] = actual.ops[o]!;
        if (pi < 1 || pi > n || pj < 1 || pj > n) {
          return {
            ok: false,
            kind: "wrong-answer",
            message: `Case ${String(c + 1)}: Operation ${String(o + 1)} indices (${String(pi)}, ${String(pj)}) out of range [1, ${String(n)}]`
          };
        }
        const ti: number = temps[pi - 1]!;
        const tj: number = temps[pj - 1]!;
        if (ti === tj) {
          return {
            ok: false,
            kind: "wrong-answer",
            message: `Case ${String(c + 1)}: Operation ${String(o + 1)} dishes ${String(pi)} and ${String(pj)} have equal temps (${String(ti)})`
          };
        }
        const maxTemp: number = Math.max(ti, tj);
        temps[pi - 1] = maxTemp;
        temps[pj - 1] = maxTemp;
      }

      for (let i = 0; i < n; i += 1) {
        if (temps[i] !== b[i]) {
          return {
            ok: false,
            kind: "wrong-answer",
            message: `Case ${String(c + 1)}: After operations, dish ${String(i + 1)} has temp ${String(temps[i])} but expected ${String(b[i]!)}`
          };
        }
      }
    }

    return { ok: true };
  }
};

export default checker;
