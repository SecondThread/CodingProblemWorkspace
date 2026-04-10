import type { CheckerArgs, CheckerResult, ProblemChecker } from "../../../../src/contracts/problem";

function normalizeOutput(text: string): string {
  return text.replace(/\r\n/g, "\n").trimEnd();
}

const checker: ProblemChecker = {
  check(args: CheckerArgs): CheckerResult {
    const inputLines: readonly string[] = args.input.trim().split("\n");
    const actualLines: readonly string[] = normalizeOutput(args.actualOutput).split("\n");
    const t: number = Number(inputLines[0]!);

    if (actualLines.length !== t) {
      return {
        ok: false,
        kind: "presentation-error",
        message: `Expected ${String(t)} output lines, got ${String(actualLines.length)}.`
      };
    }

    for (let test = 0; test < t; test += 1) {
      const parts: readonly string[] = inputLines[test + 1]!.split(" ");
      const a: number = Number(parts[0]!);
      const b: number = Number(parts[1]!);
      const n: number = Number(parts[2]!);

      const line: string = actualLines[test]!;
      const prefix: string = `Case #${String(test + 1)}: `;
      if (!line.startsWith(prefix)) {
        return {
          ok: false,
          kind: "presentation-error",
          message: `Line ${String(test + 1)} does not start with "${prefix}".`
        };
      }

      const tokens: readonly number[] = line.slice(prefix.length).split(" ").map(Number);

      if (tokens.length !== 2 * n) {
        return {
          ok: false,
          kind: "wrong-answer",
          message: `Case ${String(test + 1)}: expected ${String(2 * n)} multipliers, got ${String(tokens.length)}.`
        };
      }

      for (let i = 0; i < tokens.length; i += 1) {
        if (!Number.isInteger(tokens[i]!) || tokens[i]! < 1) {
          return {
            ok: false,
            kind: "wrong-answer",
            message: `Case ${String(test + 1)}: multiplier ${String(i + 1)} is not a positive integer.`
          };
        }
      }

      let productFirstN: number = 1;
      for (let i = 0; i < n; i += 1) {
        productFirstN *= tokens[i]!;
      }
      if (productFirstN > a) {
        return {
          ok: false,
          kind: "wrong-answer",
          message: `Case ${String(test + 1)}: product after first ${String(n)} days is ${String(productFirstN)}, exceeds A=${String(a)}.`
        };
      }

      let productAll: number = 1;
      for (let i = 0; i < 2 * n; i += 1) {
        productAll *= tokens[i]!;
      }
      if (productAll !== b) {
        return {
          ok: false,
          kind: "wrong-answer",
          message: `Case ${String(test + 1)}: total product is ${String(productAll)}, expected B=${String(b)}.`
        };
      }
    }

    return { ok: true };
  }
};

export default checker;
