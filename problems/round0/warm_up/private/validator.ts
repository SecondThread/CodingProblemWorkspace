import type { ProblemValidator } from "../../../../src/contracts/problem";

const validator: ProblemValidator = {
  validate(input: string): void {
    const lines: readonly string[] = input.trim().split("\n").map((l) => l.trim());
    const t: number = Number(lines[0]!);

    if (!Number.isInteger(t) || t < 1 || t > 95) {
      throw new Error(`T must be between 1 and 95, got ${String(t)}`);
    }

    let lineIndex: number = 1;
    for (let c = 1; c <= t; c += 1) {
      if (lineIndex >= lines.length) throw new Error(`Missing N for case ${String(c)}`);
      const n: number = Number(lines[lineIndex]!);
      lineIndex += 1;
      if (!Number.isInteger(n) || n < 1 || n > 500000) {
        throw new Error(`Case ${String(c)}: N must be between 1 and 500000, got ${String(n)}`);
      }

      if (lineIndex >= lines.length) throw new Error(`Missing A array for case ${String(c)}`);
      const aParts: string[] = lines[lineIndex]!.split(" ");
      lineIndex += 1;
      if (aParts.length !== n) {
        throw new Error(`Case ${String(c)}: A array must have ${String(n)} elements, got ${String(aParts.length)}`);
      }
      for (let i = 0; i < n; i += 1) {
        const val: number = Number(aParts[i]!);
        if (!Number.isInteger(val) || val < 1 || val > n) {
          throw new Error(`Case ${String(c)}: A[${String(i)}] must be between 1 and ${String(n)}, got ${String(val)}`);
        }
      }

      if (lineIndex >= lines.length) throw new Error(`Missing B array for case ${String(c)}`);
      const bParts: string[] = lines[lineIndex]!.split(" ");
      lineIndex += 1;
      if (bParts.length !== n) {
        throw new Error(`Case ${String(c)}: B array must have ${String(n)} elements, got ${String(bParts.length)}`);
      }
      for (let i = 0; i < n; i += 1) {
        const val: number = Number(bParts[i]!);
        if (!Number.isInteger(val) || val < 1 || val > n) {
          throw new Error(`Case ${String(c)}: B[${String(i)}] must be between 1 and ${String(n)}, got ${String(val)}`);
        }
      }
    }
  }
};

export default validator;
