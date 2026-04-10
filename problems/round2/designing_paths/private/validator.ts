import type { ProblemValidator } from "../../../../src/contracts/problem";

function parseIntegerToken(token: string, label: string): number {
  if (!/^\d+$/.test(token)) {
    throw new Error(`Expected ${label} to be a non-negative integer, received: ${token}`);
  }

  return Number(token);
}

const validator: ProblemValidator = {
  validate(input: string): void {
    const lines: readonly string[] = input.replace(/\r\n/g, "\n").trim().split("\n");

    if (lines.length === 0 || (lines.length === 1 && lines[0] === "")) {
      throw new Error("Input must not be empty.");
    }

    const T: number = parseIntegerToken(lines[0] ?? "", "test case count T");

    if (T < 1 || T > 100) {
      throw new Error(`Test case count T must be between 1 and 100, received: ${String(T)}`);
    }

    let lineIndex: number = 1;

    for (let caseIndex = 0; caseIndex < T; caseIndex += 1) {
      const headerLine: string | undefined = lines[lineIndex];
      if (headerLine === undefined) {
        throw new Error(`Missing header line for case ${String(caseIndex + 1)}.`);
      }

      const headerTokens: readonly string[] = headerLine.split(" ").filter((s) => s.length > 0);
      if (headerTokens.length !== 3) {
        throw new Error(
          `Case ${String(caseIndex + 1)} header must have 3 values (N K M), received ${String(headerTokens.length)}.`
        );
      }

      const N: number = parseIntegerToken(headerTokens[0]!, `N for case ${String(caseIndex + 1)}`);
      const K: number = parseIntegerToken(headerTokens[1]!, `K for case ${String(caseIndex + 1)}`);
      const M: number = parseIntegerToken(headerTokens[2]!, `M for case ${String(caseIndex + 1)}`);

      if (N < 2 || N > 500000) {
        throw new Error(`N for case ${String(caseIndex + 1)} must be between 2 and 500000, received: ${String(N)}`);
      }

      if (K < 1 || K >= N) {
        throw new Error(
          `K for case ${String(caseIndex + 1)} must satisfy 1 <= K < N (N=${String(N)}), received: ${String(K)}`
        );
      }

      if (M < 1 || M > 500000) {
        throw new Error(`M for case ${String(caseIndex + 1)} must be between 1 and 500000, received: ${String(M)}`);
      }

      lineIndex += 1;

      let sumL: number = 0;

      for (let routeIndex = 0; routeIndex < M; routeIndex += 1) {
        const routeLine: string | undefined = lines[lineIndex];
        if (routeLine === undefined) {
          throw new Error(`Missing route ${String(routeIndex + 1)} for case ${String(caseIndex + 1)}.`);
        }

        const routeTokens: readonly string[] = routeLine.split(" ").filter((s) => s.length > 0);
        if (routeTokens.length < 1) {
          throw new Error(`Route ${String(routeIndex + 1)} for case ${String(caseIndex + 1)} is empty.`);
        }

        const L: number = parseIntegerToken(
          routeTokens[0]!,
          `L for route ${String(routeIndex + 1)} of case ${String(caseIndex + 1)}`
        );

        if (L < 2 || L > N) {
          throw new Error(
            `L for route ${String(routeIndex + 1)} of case ${String(caseIndex + 1)} must be between 2 and N (${String(N)}), received: ${String(L)}`
          );
        }

        if (routeTokens.length !== L + 1) {
          throw new Error(
            `Route ${String(routeIndex + 1)} of case ${String(caseIndex + 1)} declares L=${String(L)} but has ${String(routeTokens.length - 1)} stops.`
          );
        }

        const seen: Set<number> = new Set();

        for (let j = 1; j <= L; j += 1) {
          const courtValue: number = parseIntegerToken(
            routeTokens[j]!,
            `stop ${String(j)} of route ${String(routeIndex + 1)} of case ${String(caseIndex + 1)}`
          );

          if (courtValue < 1 || courtValue > N) {
            throw new Error(
              `Stop ${String(j)} of route ${String(routeIndex + 1)} of case ${String(caseIndex + 1)} must be between 1 and N (${String(N)}), received: ${String(courtValue)}`
            );
          }

          if (seen.has(courtValue)) {
            throw new Error(
              `Route ${String(routeIndex + 1)} of case ${String(caseIndex + 1)} has duplicate court ${String(courtValue)}.`
            );
          }

          seen.add(courtValue);
        }

        sumL += L;
        lineIndex += 1;
      }

      if (sumL > 1000000) {
        throw new Error(
          `Sum of L_i for case ${String(caseIndex + 1)} exceeds 1000000: ${String(sumL)}`
        );
      }
    }

    if (lineIndex !== lines.length) {
      throw new Error(`Input contains ${String(lines.length - lineIndex)} extra lines after the final test case.`);
    }
  }
};

export default validator;
