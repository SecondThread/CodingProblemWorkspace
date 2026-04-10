import type { ProblemValidator } from "../../../../src/contracts/problem";

const validator: ProblemValidator = {
  validate(input: string): void {
    const lines: readonly string[] = input.trim().split("\n").map((l) => l.trim());
    const t: number = Number(lines[0]!);

    if (!Number.isInteger(t) || t < 1 || t > 100) {
      throw new Error(`T must be between 1 and 100, got ${String(t)}`);
    }

    let lineIndex = 1;
    for (let c = 1; c <= t; c += 1) {
      if (lineIndex >= lines.length) throw new Error(`Missing N M for case ${String(c)}`);
      const parts: number[] = lines[lineIndex]!.split(" ").map(Number);
      lineIndex += 1;

      if (parts.length !== 2) {
        throw new Error(`Case ${String(c)}: expected 2 values on N M line, got ${String(parts.length)}`);
      }
      const n: number = parts[0]!;
      const m: number = parts[1]!;

      if (!Number.isInteger(n) || n < 1 || n > 1000000) {
        throw new Error(`Case ${String(c)}: N must be between 1 and 1000000, got ${String(n)}`);
      }
      if (!Number.isInteger(m) || m < 1 || m > 1000000) {
        throw new Error(`Case ${String(c)}: M must be between 1 and 1000000, got ${String(m)}`);
      }

      if (lineIndex >= lines.length) throw new Error(`Missing scores for case ${String(c)}`);
      const scores: number[] = lines[lineIndex]!.split(" ").map(Number);
      lineIndex += 1;

      if (scores.length !== n) {
        throw new Error(`Case ${String(c)}: expected ${String(n)} scores, got ${String(scores.length)}`);
      }
      for (let i = 0; i < n; i += 1) {
        const v: number = scores[i]!;
        if (!Number.isInteger(v) || v < 0 || v > 1000000) {
          throw new Error(`Case ${String(c)}: score A[${String(i)}] must be between 0 and 1000000, got ${String(v)}`);
        }
      }

      if (lineIndex >= lines.length) throw new Error(`Missing stock for case ${String(c)}`);
      const stock: number[] = lines[lineIndex]!.split(" ").map(Number);
      lineIndex += 1;

      if (stock.length !== m) {
        throw new Error(`Case ${String(c)}: expected ${String(m)} stock values, got ${String(stock.length)}`);
      }
      for (let i = 0; i < m; i += 1) {
        const v: number = stock[i]!;
        if (!Number.isInteger(v) || v < 0 || v > 1000000) {
          throw new Error(`Case ${String(c)}: stock B[${String(i)}] must be between 0 and 1000000, got ${String(v)}`);
        }
      }
    }
  }
};

export default validator;
