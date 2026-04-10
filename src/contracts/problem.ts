export interface GeneratedCase {
  readonly input: string;
  readonly output: string;
}

export interface ProblemGenerator {
  generate(): Promise<GeneratedCase> | GeneratedCase;
}

export interface ProblemValidator {
  validate(input: string): Promise<void> | void;
}

export interface CheckerArgs {
  readonly input: string;
  readonly expectedOutput: string;
  readonly actualOutput: string;
}

export type CheckerResult =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly message: string;
      readonly kind: "wrong-answer" | "presentation-error" | "runtime-error";
    };

export interface ProblemChecker {
  check(args: CheckerArgs): Promise<CheckerResult> | CheckerResult;
}

export type ProblemSolution = (input: string) => Promise<string> | string;

