import type { ProblemValidator } from "../../../../src/contracts/problem";

const validator: ProblemValidator = {
  validate(input: string): void {
    const lines: readonly string[] = input.trim().split("\n").map((l) => l.trim());
    let lineIndex = 0;
    const t: number = Number(lines[lineIndex++]!);

    if (!Number.isInteger(t) || t < 1 || t > 65) {
      throw new Error(`T must be between 1 and 65, got ${String(t)}`);
    }

    for (let c = 1; c <= t; c += 1) {
      if (lineIndex >= lines.length) {
        throw new Error(`Missing N line for case ${String(c)}`);
      }
      const n = Number(lines[lineIndex++]!);

      if (!Number.isInteger(n) || n < 1 || n > 6000) {
        throw new Error(`Case ${String(c)}: N must be between 1 and 6000, got ${String(n)}`);
      }

      if (lineIndex >= lines.length) {
        throw new Error(`Case ${String(c)}: missing A line`);
      }
      const aParts = lines[lineIndex++]!.split(/\s+/);
      if (aParts.length !== n) {
        throw new Error(`Case ${String(c)}: expected ${String(n)} A values, got ${String(aParts.length)}`);
      }
      for (let i = 0; i < n; i += 1) {
        const ai = Number(aParts[i]!);
        if (!Number.isInteger(ai) || ai < 1 || ai > 1000000000) {
          throw new Error(
            `Case ${String(c)}, A[${String(i + 1)}]: must be between 1 and 10^9, got ${String(aParts[i]!)}`
          );
        }
      }

      if (lineIndex >= lines.length) {
        throw new Error(`Case ${String(c)}: missing B line`);
      }
      const bParts = lines[lineIndex++]!.split(/\s+/);
      if (bParts.length !== n) {
        throw new Error(`Case ${String(c)}: expected ${String(n)} B values, got ${String(bParts.length)}`);
      }
      for (let i = 0; i < n; i += 1) {
        const bi = Number(bParts[i]!);
        if (!Number.isInteger(bi) || bi < 0 || bi > i + 1) {
          throw new Error(
            `Case ${String(c)}, B[${String(i + 1)}]: must be between 0 and ${String(i + 1)}, got ${String(bParts[i]!)}`
          );
        }
      }
    }
  }
};

export default validator;
