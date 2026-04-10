import type { ProblemValidator } from "../../../../src/contracts/problem";

const validator: ProblemValidator = {
  validate(input: string): void {
    const lines: readonly string[] = input.trim().split("\n").map((l) => l.trim());
    const t: number = Number(lines[0]!);

    if (!Number.isInteger(t) || t < 1 || t > 100) {
      throw new Error(`T must be between 1 and 95, got ${String(t)}`);
    }

    let lineIndex: number = 1;
    for (let c = 1; c <= t; c += 1) {
      if (lineIndex >= lines.length) throw new Error(`Missing N for case ${String(c)}`);
      const n: number = Number(lines[lineIndex]!);
      lineIndex += 1;
      if (!Number.isInteger(n) || n < 1 || n > 600000) {
        throw new Error(`Case ${String(c)}: N must be between 1 and 600000, got ${String(n)}`);
      }
      if (lineIndex >= lines.length) throw new Error(`Missing S for case ${String(c)}`);
      const s: string = lines[lineIndex]!;
      lineIndex += 1;
      if (s.length !== n) {
        throw new Error(`Case ${String(c)}: S length must be ${String(n)}, got ${String(s.length)}`);
      }
      if (!/^[AB]+$/.test(s)) {
        throw new Error(`Case ${String(c)}: S must contain only 'A' and 'B'`);
      }
    }
  }
};

export default validator;
