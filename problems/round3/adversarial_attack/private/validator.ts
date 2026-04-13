import type { ProblemValidator } from "../../../../src/contracts/problem";

function uncompress(s: string): number {
  let total = 0;
  const len = s.length;
  let i = 0;
  while (i < len) {
    let numStr = "";
    while (i < len && s[i]! >= "0" && s[i]! <= "9") {
      numStr += s[i]!;
      i += 1;
    }
    if (numStr === "") {
      total += 1;
      i += 1;
    } else {
      total += parseInt(numStr, 10);
      i += 1;
    }
  }
  return total;
}

const validator: ProblemValidator = {
  validate(input: string): void {
    const lines: readonly string[] = input.trim().split("\n").map((l) => l.trim());
    const t: number = Number(lines[0]!);

    if (!Number.isInteger(t) || t < 1 || t > 90) {
      throw new Error(`T must be between 1 and 90, got ${String(t)}`);
    }

    let lineIndex = 1;
    for (let c = 1; c <= t; c += 1) {
      if (lineIndex >= lines.length) {
        throw new Error(`Missing N K line for case ${String(c)}`);
      }
      const parts = lines[lineIndex]!.split(/\s+/);
      if (parts.length !== 2) {
        throw new Error(`Case ${String(c)}: expected two integers N K, got "${lines[lineIndex]!}"`);
      }
      const n = Number(parts[0]!);
      const k = Number(parts[1]!);
      lineIndex += 1;

      if (!Number.isInteger(n) || n < 1 || n > 2000) {
        throw new Error(`Case ${String(c)}: N must be between 1 and 2000, got ${String(n)}`);
      }
      if (!Number.isInteger(k) || k < 1 || k > 1000000) {
        throw new Error(`Case ${String(c)}: K must be between 1 and 10^6, got ${String(k)}`);
      }

      for (let i = 0; i < n; i += 1) {
        if (lineIndex >= lines.length) {
          throw new Error(`Case ${String(c)}: missing word ${String(i + 1)}`);
        }
        const word = lines[lineIndex]!;
        lineIndex += 1;

        if (word.length < 1 || word.length > 2000) {
          throw new Error(
            `Case ${String(c)}, word ${String(i + 1)}: compressed length must be 1..2000, got ${String(word.length)}`
          );
        }
        if (!/^[a-z0-9]+$/.test(word)) {
          throw new Error(
            `Case ${String(c)}, word ${String(i + 1)}: must contain only lowercase letters and digits`
          );
        }

        const uncompressedLen = uncompress(word);
        if (uncompressedLen < 1 || uncompressedLen > 1000000) {
          throw new Error(
            `Case ${String(c)}, word ${String(i + 1)}: uncompressed length must be 1..10^6, got ${String(uncompressedLen)}`
          );
        }
      }
    }
  }
};

export default validator;
