import type { ProblemValidator } from "../../../../src/contracts/problem";

const validator: ProblemValidator = {
  validate(input: string): void {
    const lines = input.replace(/\r\n/g, "\n").trim().split("\n").map((l) => l.trim());

    if (lines.length === 0 || (lines.length === 1 && lines[0] === "")) {
      throw new Error("Input must not be empty.");
    }

    const t = Number(lines[0]!);

    if (!Number.isInteger(t) || t < 1 || t > 200) {
      throw new Error(`T must be between 1 and 200, got ${String(t)}.`);
    }

    let lineIndex = 1;
    let largeNCount = 0;

    for (let c = 1; c <= t; c++) {
      if (lineIndex >= lines.length) {
        throw new Error(`Missing first line for case ${String(c)}.`);
      }

      const parts = lines[lineIndex]!.split(/\s+/);
      lineIndex++;

      if (parts.length !== 2) {
        throw new Error(
          `Case ${String(c)}: expected 2 values (N M) on first line, got ${String(parts.length)}.`
        );
      }

      const n = Number(parts[0]!);
      if (!Number.isInteger(n) || n < 1 || n > 1000) {
        throw new Error(`Case ${String(c)}: N must be between 1 and 1000, got ${parts[0]!}.`);
      }

      if (n > 500) {
        largeNCount++;
      }

      let m: bigint;
      try {
        m = BigInt(parts[1]!);
      } catch {
        throw new Error(`Case ${String(c)}: M is not a valid integer: ${parts[1]!}.`);
      }

      if (m < 1n || m > 1000000000000n) {
        throw new Error(
          `Case ${String(c)}: M must be between 1 and 10^12, got ${String(m)}.`
        );
      }

      if (lineIndex >= lines.length) {
        throw new Error(`Missing A values line for case ${String(c)}.`);
      }

      const aTokens = lines[lineIndex]!.split(/\s+/).filter((t) => t.length > 0);
      lineIndex++;

      if (aTokens.length !== n) {
        throw new Error(
          `Case ${String(c)}: expected ${String(n)} A values, got ${String(aTokens.length)}.`
        );
      }

      for (let j = 0; j < n; j++) {
        let aVal: bigint;
        try {
          aVal = BigInt(aTokens[j]!);
        } catch {
          throw new Error(
            `Case ${String(c)}: A_${String(j + 1)} is not a valid integer: ${aTokens[j]!}.`
          );
        }

        if (aVal < 1n || aVal > 1000000000000n) {
          throw new Error(
            `Case ${String(c)}: A_${String(j + 1)} must be between 1 and 10^12, got ${String(aVal)}.`
          );
        }
      }
    }

    if (largeNCount > 11) {
      throw new Error(
        `At most 11 test cases may have N > 500, but found ${String(largeNCount)}.`
      );
    }

    if (lineIndex !== lines.length) {
      throw new Error(
        `Input contains ${String(lines.length - lineIndex)} extra line(s) after the final test case.`
      );
    }
  }
};

export default validator;
