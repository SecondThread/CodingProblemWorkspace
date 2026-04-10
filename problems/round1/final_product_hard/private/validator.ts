import type { ProblemValidator } from "../../../../src/contracts/problem";

const validator: ProblemValidator = {
  validate(input: string): void {
    const lines: readonly string[] = input.trim().split("\n").map((l) => l.trim());
    const t: number = Number(lines[0]!);

    if (!Number.isInteger(t) || t < 1 || t > 160) {
      throw new Error(`T must be between 1 and 140, got ${String(t)}`);
    }

    for (let c = 1; c <= t; c += 1) {
      if (c >= lines.length) throw new Error(`Missing data for case ${String(c)}`);
      const parts: readonly string[] = lines[c]!.split(/\s+/).filter((t) => t.length > 0);
      if (parts.length !== 3) {
        throw new Error(`Case ${String(c)}: expected 3 values, got ${String(parts.length)}`);
      }
      const a: bigint = BigInt(parts[0]!);
      const b: bigint = BigInt(parts[1]!);
      const n: bigint = BigInt(parts[2]!);
      if (a < 1n || a > 100000000000000n) {
        throw new Error(`Case ${String(c)}: A must be between 1 and 10^14, got ${String(a)}`);
      }
      if (b < 1n || b > 100000000000000n) {
        throw new Error(`Case ${String(c)}: B must be between 1 and 10^14, got ${String(b)}`);
      }
      if (n < 1n || n > 10000000000000000n) {
        throw new Error(`Case ${String(c)}: N must be between 1 and 10^16, got ${String(n)}`);
      }
    }
  }
};

export default validator;
