import type { ProblemValidator } from "../../../../src/contracts/problem";

const validator: ProblemValidator = {
  validate(input: string): void {
    const lines: readonly string[] = input.trim().split("\n").map((l) => l.trim());
    const t: number = Number(lines[0]!);

    if (!Number.isInteger(t) || t < 1 || t > 125) {
      throw new Error(`T must be between 1 and 125, got ${String(t)}`);
    }

    let lineIndex: number = 1;
    for (let c = 1; c <= t; c += 1) {
      if (lineIndex >= lines.length) throw new Error(`Missing N for case ${String(c)}`);
      const n: number = Number(lines[lineIndex]!);
      lineIndex += 1;

      if (!Number.isInteger(n) || n < 1 || n > 400000) {
        throw new Error(`Case ${String(c)}: N must be between 1 and 400000, got ${String(n)}`);
      }

      if (lineIndex >= lines.length) throw new Error(`Missing A for case ${String(c)}`);
      const parts: string[] = lines[lineIndex]!.split(/\s+/);
      lineIndex += 1;

      if (parts.length !== n) {
        throw new Error(`Case ${String(c)}: expected ${String(n)} values, got ${String(parts.length)}`);
      }

      for (let i = 0; i < parts.length; i += 1) {
        const v: number = Number(parts[i]!);
        if (!Number.isInteger(v) || v < 1 || v > n) {
          throw new Error(`Case ${String(c)}: A[${String(i)}] must be between 1 and N=${String(n)}, got ${String(v)}`);
        }
      }
    }
  }
};

export default validator;
