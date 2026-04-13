import type { ProblemValidator } from "../../../../src/contracts/problem";

const validator: ProblemValidator = {
  validate(input: string): void {
    const lines = input.trim().split("\n").map((l) => l.trim());
    let lineIndex = 0;

    const t = Number(lines[lineIndex]!);
    lineIndex += 1;

    if (!Number.isInteger(t) || t < 1 || t > 80) {
      throw new Error(`T must be between 1 and 80, got ${String(t)}`);
    }

    for (let c = 1; c <= t; c += 1) {
      if (lineIndex >= lines.length) {
        throw new Error(`Missing N line for case ${String(c)}`);
      }
      const n = Number(lines[lineIndex]!);
      lineIndex += 1;

      if (!Number.isInteger(n) || n < 3 || n > 150) {
        throw new Error(`Case ${String(c)}: N must be between 3 and 150, got ${String(n)}`);
      }

      if (lineIndex >= lines.length) {
        throw new Error(`Missing S line for case ${String(c)}`);
      }
      const s = lines[lineIndex]!;
      lineIndex += 1;

      if (s.length !== 2 * n) {
        throw new Error(
          `Case ${String(c)}: S must have length ${String(2 * n)}, got ${String(s.length)}`
        );
      }

      if (!/^[01]+$/.test(s)) {
        throw new Error(`Case ${String(c)}: S must consist of only '0' and '1'`);
      }
    }
  }
};

export default validator;
