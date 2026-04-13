import type { ProblemValidator } from "../../../../src/contracts/problem";

const validator: ProblemValidator = {
  validate(input: string): void {
    const lines: readonly string[] = input.trim().split("\n").map((l) => l.trim());
    const t: number = Number(lines[0]!);

    if (!Number.isInteger(t) || t < 1 || t > 150) {
      throw new Error(`T must be between 1 and 150, got ${String(t)}`);
    }

    let lineIndex: number = 1;
    for (let c = 1; c <= t; c += 1) {
      if (lineIndex >= lines.length) {
        throw new Error(`Missing line for case ${String(c)}`);
      }
      const parts: string[] = lines[lineIndex]!.split(/\s+/);
      lineIndex += 1;

      if (parts.length !== 2) {
        throw new Error(`Case ${String(c)}: expected 2 integers (N K), got ${String(parts.length)} tokens`);
      }

      const n: number = Number(parts[0]!);
      const k: number = Number(parts[1]!);

      if (!Number.isInteger(n) || n < 1 || n > 100) {
        throw new Error(`Case ${String(c)}: N must be between 1 and 100, got ${String(n)}`);
      }

      const maxK: number = (n * (n + 1)) / 2;
      if (!Number.isInteger(k) || k < 1 || k > maxK) {
        throw new Error(`Case ${String(c)}: K must be between 1 and ${String(maxK)}, got ${String(k)}`);
      }
    }
  }
};

export default validator;
