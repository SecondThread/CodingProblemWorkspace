import type { ProblemValidator } from "../../../../src/contracts/problem";

function parseIntegerToken(token: string, label: string): number {
  if (!/^-?\d+$/.test(token)) {
    throw new Error(`Expected ${label} to be an integer, received: "${token}"`);
  }
  return Number(token);
}

const validator: ProblemValidator = {
  validate(input: string): void {
    const trimmed: string = input.trim();
    if (trimmed.length === 0) {
      throw new Error("Input must not be empty.");
    }

    const lines: readonly string[] = trimmed.split("\n").map((l) => l.trim());
    let lineIndex = 0;

    const T: number = parseIntegerToken(lines[lineIndex++] ?? "", "T");
    if (T < 1 || T > 70) {
      throw new Error(`T must be between 1 and 70, received: ${T}`);
    }

    for (let t = 1; t <= T; t++) {
      const headerLine: string = lines[lineIndex++] ?? "";
      const headerTokens: string[] = headerLine.split(/\s+/).filter((s) => s.length > 0);

      if (headerTokens.length !== 4) {
        throw new Error(
          `Case ${t}: header must have 4 values (N M A B), received ${headerTokens.length}.`
        );
      }

      const N: number = parseIntegerToken(headerTokens[0]!, `N for case ${t}`);
      const M: number = parseIntegerToken(headerTokens[1]!, `M for case ${t}`);
      const A: number = parseIntegerToken(headerTokens[2]!, `A for case ${t}`);
      const B: number = parseIntegerToken(headerTokens[3]!, `B for case ${t}`);

      if (N < 1 || N > 200000) {
        throw new Error(`Case ${t}: N must be between 1 and 200000, received: ${N}`);
      }
      if (M < 1 || M > 10000) {
        throw new Error(`Case ${t}: M must be between 1 and 10000, received: ${M}`);
      }
      if (A < 1 || A > 1e9) {
        throw new Error(`Case ${t}: A must be between 1 and 10^9, received: ${A}`);
      }
      if (B < 1 || B > 1e9) {
        throw new Error(`Case ${t}: B must be between 1 and 10^9, received: ${B}`);
      }

      let totalReindeer = 0;

      for (let i = 1; i <= N; i++) {
        const rowLine: string = lines[lineIndex++] ?? "";
        const rowTokens: string[] = rowLine.split(/\s+/).filter((s) => s.length > 0);

        if (rowTokens.length !== M + 1) {
          throw new Error(
            `Case ${t}, team ${i}: expected ${M + 1} values, received ${rowTokens.length}.`
          );
        }

        for (let j = 0; j < M + 1; j++) {
          const w: number = parseIntegerToken(rowTokens[j]!, `W[${i},${j + 1}] in case ${t}`);

          if (j < M) {
            // Regular reindeer: 1 <= w <= 10^9
            if (w < 1 || w > 1e9) {
              throw new Error(
                `Case ${t}: W[${i},${j + 1}] must be between 1 and 10^9, received: ${w}`
              );
            }
            totalReindeer++;
          } else {
            // Backup reindeer: w = -1 or 1 <= w <= 10^9
            if (w !== -1 && (w < 1 || w > 1e9)) {
              throw new Error(
                `Case ${t}: W[${i},${j + 1}] (backup) must be -1 or between 1 and 10^9, received: ${w}`
              );
            }
            if (w !== -1) {
              totalReindeer++;
            }
          }
        }
      }

      if (totalReindeer > 200000) {
        throw new Error(
          `Case ${t}: total reindeer count ${totalReindeer} exceeds 200000.`
        );
      }

      if (totalReindeer < M) {
        throw new Error(
          `Case ${t}: total reindeer count ${totalReindeer} is less than M=${M}.`
        );
      }

      // Constraint from the C++ code: r <= k where n = k*M + r
      const kk: number = Math.floor(totalReindeer / M);
      const rr: number = totalReindeer % M;
      if (rr > kk) {
        throw new Error(
          `Case ${t}: remainder r=${rr} exceeds k=${kk} (n=${totalReindeer}, M=${M}). Need r <= k.`
        );
      }
    }

    if (lineIndex !== lines.length) {
      throw new Error(`Input has ${lines.length - lineIndex} extra lines after the last test case.`);
    }
  }
};

export default validator;
