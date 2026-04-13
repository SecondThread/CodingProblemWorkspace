import type { CheckerArgs, CheckerResult, ProblemChecker } from "../../../../src/contracts/problem";

/**
 * Constructive checker for reindeer_rally.
 *
 * Validates that the contestant's output:
 *   1. Has the correct "Case #i:" prefix for each test case.
 *   2. States effectiveness and K values.
 *   3. Each of the K teams has exactly M reindeer IDs.
 *   4. All IDs are valid (exist as actual reindeer, not -1 backups) and unique.
 *   5. The stated effectiveness equals A*K - B * sum(team_weight mod M).
 *   6. The effectiveness matches the optimal (expected) value.
 */

const checker: ProblemChecker = {
  check(args: CheckerArgs): CheckerResult {
    const inputTokens: string[] = args.input.trim().split(/\s+/);
    const expectedTokens: string[] = args.expectedOutput.trim().split(/\s+/);
    const actualTokens: string[] = args.actualOutput.trim().split(/\s+/);

    let ip = 0;
    let ep = 0;
    let ap = 0;

    const nextInput = (): string => inputTokens[ip++]!;
    const nextExpected = (): string => expectedTokens[ep++]!;
    const nextActual = (): string => {
      if (ap >= actualTokens.length) {
        throw new Error("Unexpected end of contestant output.");
      }
      return actualTokens[ap++]!;
    };

    const T: number = Number(nextInput());

    for (let t = 1; t <= T; t++) {
      const N: number = Number(nextInput());
      const M: number = Number(nextInput());
      const A: number = Number(nextInput());
      const B: number = Number(nextInput());

      // Build map of valid reindeer IDs to their weights
      const weights: Map<number, number> = new Map();
      for (let i = 1; i <= N; i++) {
        for (let j = 1; j <= M + 1; j++) {
          const w: number = Number(nextInput());
          const id: number = (i - 1) * (M + 1) + j;
          if (w !== -1) {
            weights.set(id, w);
          }
        }
      }

      // Read expected output
      nextExpected(); // "Case"
      nextExpected(); // "#t:"
      const expectedEff: bigint = BigInt(nextExpected());
      const expectedK: number = Number(nextExpected());
      // Skip expected team assignments
      for (let i = 0; i < expectedK; i++) {
        for (let j = 0; j < M; j++) {
          nextExpected();
        }
      }

      // Read actual output
      try {
        const caseWord: string = nextActual();
        const caseNum: string = nextActual();

        if (caseWord !== "Case" || caseNum !== `#${t}:`) {
          return {
            ok: false,
            kind: "presentation-error",
            message: `Case ${t}: Expected "Case #${t}:" header, got "${caseWord} ${caseNum}".`
          };
        }

        const actualEffStr: string = nextActual();
        const actualEff: bigint = BigInt(actualEffStr);
        const actualK: number = Number(nextActual());

        if (actualK < 0) {
          return {
            ok: false,
            kind: "wrong-answer",
            message: `Case ${t}: K must be non-negative, got ${actualK}.`
          };
        }

        const usedIds: Set<number> = new Set();
        let totalPenalty = 0n;

        for (let i = 0; i < actualK; i++) {
          let teamSum = 0n;
          for (let j = 0; j < M; j++) {
            const idStr: string = nextActual();
            const id: number = Number(idStr);

            if (!weights.has(id)) {
              return {
                ok: false,
                kind: "wrong-answer",
                message: `Case ${t}: Team ${i + 1} contains invalid reindeer ID ${id}.`
              };
            }

            if (usedIds.has(id)) {
              return {
                ok: false,
                kind: "wrong-answer",
                message: `Case ${t}: Reindeer ID ${id} is used more than once.`
              };
            }
            usedIds.add(id);
            teamSum += BigInt(weights.get(id)!);
          }
          const balance: bigint = ((teamSum % BigInt(M)) + BigInt(M)) % BigInt(M);
          totalPenalty += BigInt(B) * balance;
        }

        const computedEff: bigint = BigInt(A) * BigInt(actualK) - totalPenalty;

        if (computedEff !== actualEff) {
          return {
            ok: false,
            kind: "wrong-answer",
            message: `Case ${t}: Stated effectiveness ${actualEff.toString()} does not match computed ${computedEff.toString()} (A*K - penalty = ${(BigInt(A) * BigInt(actualK)).toString()} - ${totalPenalty.toString()}).`
          };
        }

        if (actualEff !== expectedEff) {
          return {
            ok: false,
            kind: "wrong-answer",
            message: `Case ${t}: Effectiveness ${actualEff.toString()} does not match optimal ${expectedEff.toString()}.`
          };
        }
      } catch (e: unknown) {
        const msg: string = e instanceof Error ? e.message : String(e);
        return {
          ok: false,
          kind: "wrong-answer",
          message: `Case ${t}: Error parsing output: ${msg}`
        };
      }
    }

    return { ok: true };
  }
};

export default checker;
