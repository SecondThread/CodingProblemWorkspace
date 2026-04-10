import type { ProblemValidator } from "../../../../src/contracts/problem";

const validator: ProblemValidator = {
  validate(input: string): void {
    const lines: readonly string[] = input.trim().split("\n").map((l) => l.trim());
    const t: number = Number(lines[0]!);

    if (!Number.isInteger(t) || t < 1 || t > 100) {
      throw new Error(`T must be between 1 and 90, got ${String(t)}`);
    }

    let lineIndex: number = 1;
    for (let c = 1; c <= t; c += 1) {
      if (lineIndex >= lines.length) throw new Error(`Missing N for case ${String(c)}`);
      const n: number = Number(lines[lineIndex]!);
      lineIndex += 1;
      if (!Number.isInteger(n) || n < 1 || n > 1000000) {
        throw new Error(`Case ${String(c)}: N must be between 1 and 1000000, got ${String(n)}`);
      }
      if (lineIndex >= lines.length) throw new Error(`Missing A values for case ${String(c)}`);
      const tokens: readonly string[] = lines[lineIndex]!.split(/\s+/).filter((t) => t.length > 0);
      lineIndex += 1;
      if (tokens.length !== n) {
        throw new Error(`Case ${String(c)}: expected ${String(n)} values, got ${String(tokens.length)}`);
      }
      for (let i = 0; i < n; i += 1) {
        const val: number = Number(tokens[i]!);
        if (!Number.isInteger(val) || val < 0 || val >= (1 << 30)) {
          throw new Error(`Case ${String(c)}: A_${String(i + 1)} must be between 0 and 2^30-1, got ${String(val)}`);
        }
      }
    }
  }
};

export default validator;
