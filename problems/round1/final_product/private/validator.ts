import type { ProblemValidator } from "../../../../src/contracts/problem";

const validator: ProblemValidator = {
  validate(input: string): void {
    const lines: readonly string[] = input.trim().split("\n").map((l) => l.trim());
    const t: number = Number(lines[0]!);

    if (!Number.isInteger(t) || t < 1 || t > 60) {
      throw new Error(`T must be between 1 and 50, got ${String(t)}`);
    }

    for (let c = 1; c <= t; c += 1) {
      if (c >= lines.length) throw new Error(`Missing data for case ${String(c)}`);
      const parts: readonly string[] = lines[c]!.split(/\s+/).filter((t) => t.length > 0);
      if (parts.length !== 3) {
        throw new Error(`Case ${String(c)}: expected 3 values, got ${String(parts.length)}`);
      }
      const a: number = Number(parts[0]!);
      const b: number = Number(parts[1]!);
      const n: number = Number(parts[2]!);
      if (!Number.isInteger(a) || a < 1 || a > 100) {
        throw new Error(`Case ${String(c)}: A must be between 1 and 100, got ${String(a)}`);
      }
      if (!Number.isInteger(b) || b < 1 || b > 100) {
        throw new Error(`Case ${String(c)}: B must be between 1 and 100, got ${String(b)}`);
      }
      if (!Number.isInteger(n) || n < 1 || n > 100) {
        throw new Error(`Case ${String(c)}: N must be between 1 and 100, got ${String(n)}`);
      }
    }
  }
};

export default validator;
