import type { ProblemValidator } from "../../../../src/contracts/problem";

const validator: ProblemValidator = {
  validate(input: string): void {
    const lines: readonly string[] = input.trim().split("\n").map((l) => l.trim());
    const t: number = Number(lines[0]!);

    if (!Number.isInteger(t) || t < 1 || t > 70) {
      throw new Error(`T must be between 1 and 70, got ${String(t)}`);
    }

    let lineIndex: number = 1;
    let totalCells: number = 0;

    for (let c = 1; c <= t; c += 1) {
      if (lineIndex >= lines.length) throw new Error(`Missing R C S for case ${String(c)}`);
      const parts: string[] = lines[lineIndex]!.split(/\s+/);
      if (parts.length !== 3) {
        throw new Error(`Case ${String(c)}: expected 3 values (R C S), got ${String(parts.length)}`);
      }
      const R: number = Number(parts[0]!);
      const C: number = Number(parts[1]!);
      const S: number = Number(parts[2]!);
      lineIndex += 1;

      if (!Number.isInteger(R) || R < 1) {
        throw new Error(`Case ${String(c)}: R must be >= 1, got ${String(R)}`);
      }
      if (!Number.isInteger(C) || C < 1) {
        throw new Error(`Case ${String(c)}: C must be >= 1, got ${String(C)}`);
      }
      if (R * C > 1000000) {
        throw new Error(`Case ${String(c)}: R*C must be <= 1000000, got ${String(R * C)}`);
      }
      if (!Number.isInteger(S) || S < 1 || S > 1000) {
        throw new Error(`Case ${String(c)}: S must be between 1 and 1000, got ${String(S)}`);
      }

      totalCells += R * C;

      for (let r = 0; r < R; r += 1) {
        if (lineIndex >= lines.length) {
          throw new Error(`Case ${String(c)}: missing row ${String(r)}`);
        }
        const row: string = lines[lineIndex]!;
        if (row.length !== C) {
          throw new Error(`Case ${String(c)}, row ${String(r)}: expected length ${String(C)}, got ${String(row.length)}`);
        }
        if (!/^[.#]+$/.test(row)) {
          throw new Error(`Case ${String(c)}, row ${String(r)}: must contain only '.' and '#'`);
        }
        lineIndex += 1;
      }
    }

    if (totalCells > 5000000) {
      throw new Error(`Sum of R*C must be <= 5000000, got ${String(totalCells)}`);
    }
  }
};

export default validator;
