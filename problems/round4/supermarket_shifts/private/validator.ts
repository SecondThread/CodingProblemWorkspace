import type { ProblemValidator } from "../../../../src/contracts/problem";

const validator: ProblemValidator = {
  validate(input: string): void {
    const lines: readonly string[] = input.replace(/\r\n/g, "\n").trim().split("\n");

    if (lines.length === 0 || (lines.length === 1 && lines[0] === "")) {
      throw new Error("Input must not be empty.");
    }

    const t = Number(lines[0]!);
    if (!Number.isInteger(t) || t < 1 || t > 100) {
      throw new Error(`T must be between 1 and 100, got ${String(t)}`);
    }

    let lineIndex = 1;

    for (let c = 1; c <= t; c += 1) {
      if (lineIndex >= lines.length) {
        throw new Error(`Missing N M line for case ${String(c)}`);
      }
      const parts = lines[lineIndex]!.trim().split(/\s+/);
      if (parts.length !== 2) {
        throw new Error(`Case ${String(c)}: expected two integers N M, got "${lines[lineIndex]!}"`);
      }
      const n = Number(parts[0]!);
      const m = Number(parts[1]!);
      lineIndex += 1;

      if (!Number.isInteger(n) || n < 1 || n > 500000) {
        throw new Error(`Case ${String(c)}: N must be between 1 and 500000, got ${String(n)}`);
      }
      if (!Number.isInteger(m) || m < 0 || m > 1000000) {
        throw new Error(`Case ${String(c)}: M must be between 0 and 1000000, got ${String(m)}`);
      }

      // Read A
      if (lineIndex >= lines.length) {
        throw new Error(`Case ${String(c)}: missing permutation A`);
      }
      const aTokens = lines[lineIndex]!.trim().split(/\s+/);
      lineIndex += 1;
      if (aTokens.length !== n) {
        throw new Error(`Case ${String(c)}: permutation A should have ${String(n)} elements, got ${String(aTokens.length)}`);
      }
      const aSet = new Set<number>();
      for (let i = 0; i < n; i += 1) {
        const val = Number(aTokens[i]!);
        if (!Number.isInteger(val) || val < 1 || val > n) {
          throw new Error(`Case ${String(c)}: A[${String(i)}] = ${String(val)} is out of range [1, ${String(n)}]`);
        }
        if (aSet.has(val)) {
          throw new Error(`Case ${String(c)}: A has duplicate value ${String(val)}`);
        }
        aSet.add(val);
      }

      // Read B
      if (lineIndex >= lines.length) {
        throw new Error(`Case ${String(c)}: missing permutation B`);
      }
      const bTokens = lines[lineIndex]!.trim().split(/\s+/);
      lineIndex += 1;
      if (bTokens.length !== n) {
        throw new Error(`Case ${String(c)}: permutation B should have ${String(n)} elements, got ${String(bTokens.length)}`);
      }
      const bSet = new Set<number>();
      for (let i = 0; i < n; i += 1) {
        const val = Number(bTokens[i]!);
        if (!Number.isInteger(val) || val < 1 || val > n) {
          throw new Error(`Case ${String(c)}: B[${String(i)}] = ${String(val)} is out of range [1, ${String(n)}]`);
        }
        if (bSet.has(val)) {
          throw new Error(`Case ${String(c)}: B has duplicate value ${String(val)}`);
        }
        bSet.add(val);
      }

      // Read M locks
      for (let i = 0; i < m; i += 1) {
        if (lineIndex >= lines.length) {
          throw new Error(`Case ${String(c)}: missing lock pair ${String(i + 1)}`);
        }
        const lockParts = lines[lineIndex]!.trim().split(/\s+/);
        lineIndex += 1;
        if (lockParts.length !== 2) {
          throw new Error(`Case ${String(c)}: lock ${String(i + 1)} should have 2 values`);
        }
        const x = Number(lockParts[0]!);
        const y = Number(lockParts[1]!);
        if (!Number.isInteger(x) || x < 1 || x > n) {
          throw new Error(`Case ${String(c)}: lock X = ${String(x)} out of range`);
        }
        if (!Number.isInteger(y) || y < 1 || y > n) {
          throw new Error(`Case ${String(c)}: lock Y = ${String(y)} out of range`);
        }
        if (x === y) {
          throw new Error(`Case ${String(c)}: lock pair has X == Y == ${String(x)}`);
        }
      }
    }
  }
};

export default validator;
