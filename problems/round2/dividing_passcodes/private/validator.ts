import type { ProblemValidator } from "../../../../src/contracts/problem";

function isValidPositiveIntegerString(s: string): boolean {
  if (s.length === 0) return false;
  if (!/^\d+$/.test(s)) return false;
  if (s.length > 1 && s[0] === "0") return false;
  return true;
}

function compareStringNumbers(a: string, b: string): number {
  if (a.length !== b.length) return a.length - b.length;
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

const validator: ProblemValidator = {
  validate(input: string): void {
    const lines: readonly string[] = input.trim().split("\n").map((l) => l.trim());
    const t: number = Number(lines[0]!);

    if (!Number.isInteger(t) || t < 1 || t > 120) {
      throw new Error(`T must be between 1 and 100, got ${String(t)}`);
    }

    for (let c = 1; c <= t; c += 1) {
      if (c >= lines.length) throw new Error(`Missing data for case ${String(c)}`);
      const parts = lines[c].split(/\s+/);
      if (parts.length !== 3) {
        throw new Error(`Case ${String(c)}: expected 3 space-separated values, got ${String(parts.length)}`);
      }
      const L = parts[0];
      const R = parts[1];
      const kStr = parts[2];

      if (!isValidPositiveIntegerString(L)) {
        throw new Error(`Case ${String(c)}: L is not a valid positive integer string: "${L}"`);
      }
      if (!isValidPositiveIntegerString(R)) {
        throw new Error(`Case ${String(c)}: R is not a valid positive integer string: "${R}"`);
      }
      if (compareStringNumbers(L, R) > 0) {
        throw new Error(`Case ${String(c)}: L must be <= R`);
      }

      const k = Number(kStr);
      if (!Number.isInteger(k) || k < 2 || k > 20) {
        throw new Error(`Case ${String(c)}: K must be between 2 and 20, got ${String(k)}`);
      }
    }
  }
};

export default validator;
