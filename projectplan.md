# Project Plan

## Goal

Build a TypeScript-first workspace for authoring and testing coding problems. Each problem should have:

- `public/statement.md`
- `public/sample-input.txt`
- `public/sample-output.txt`
- `solution/solution.ts`
- `private/generator.ts`
- `private/validator.ts`
- `private/checker.ts`
- `private/input.txt`
- `private/output.txt`

The runner should let the solution see the files in `public/` when it executes, but it should not expose anything in `private/`.

## Recommendation

The cleanest approach is:

1. Keep every problem self-contained in its own folder under `problems/`.
2. Split each problem into `public/`, `solution/`, and `private/`.
3. Store both public sample files and hidden full-data files as plain text.
4. Use Hacker Cup-style combined case files, with one `public/sample-input.txt` and one `public/sample-output.txt`.
5. Treat `private/generator.ts` as the source of truth for rebuilding `private/input.txt` and `private/output.txt`.
6. Run solutions inside a temporary sandbox directory that contains only the solution runtime wrapper and the `public/` directory.
7. Execute problem-owned TypeScript modules through a dedicated worker so the runner can stay small and typed without special Jest loaders.

This gives you deterministic Jest tests, readable fixtures in git, and a real separation between what the solution is allowed to see and what the harness uses privately.

## Proposed Repository Layout

```text
.
├── projectplan.md
├── package.json
├── tsconfig.json
├── jest.config.ts
├── src/
│   ├── contracts/
│   │   └── problem.ts
│   ├── runner/
│   │   ├── discoverProblems.ts
│   │   ├── generateProblemData.ts
│   │   ├── runSolutionInSandbox.ts
│   │   ├── validateProblemData.ts
│   │   └── checkSolutionOutput.ts
│   ├── testing/
│   │   └── buildProblemTests.ts
│   └── utils/
│       ├── fs.ts
│       └── paths.ts
└── problems/
    └── watermelon/
        ├── public/
        │   ├── statement.md
        │   ├── sample-input.txt
        │   └── sample-output.txt
        ├── solution/
        │   └── solution.ts
        └── private/
            ├── generator.ts
            ├── validator.ts
            ├── checker.ts
            ├── input.txt
            └── output.txt
```

I recommend keeping the hidden full-data text files inside `private/` even though they are not executable code. They belong to the same visibility boundary as the generator, validator, and checker.

## Problem Contract

Each problem file should follow a small, explicit contract. The shared types belong in `src/contracts/problem.ts`.

```ts
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
```

Recommended file exports:

- `solution/solution.ts`: default export of type `ProblemSolution`
- `private/generator.ts`: default export of type `ProblemGenerator`
- `private/validator.ts`: default export of type `ProblemValidator`
- `private/checker.ts`: default export of type `ProblemChecker`

## Visibility Model

When a solution runs, it should be able to see:

- its stdin input
- its stdout target
- `public/statement.md`
- `public/sample-input.txt`
- `public/sample-output.txt`

When a solution runs, it should not be able to see:

- anything in `private/`

Implementation recommendation:

1. The runner creates a temporary directory for each execution.
2. The runner places the compiled solution wrapper there.
3. The runner copies only the `public/` directory into that temp directory.
4. The runner sets the process working directory to the temp directory.
5. The runner feeds either sample input or full input through stdin.

This is better than just importing `solution/solution.ts` directly into the test process, because direct imports would give the solution easy access to the rest of the repository.

## How The Pieces Interact

### `private/generator.ts`

- Produces deterministic full-case text for `private/input.txt` and `private/output.txt`
- Should not depend on the solution implementation
- Should be callable from a command like `npm run generate -- watermelon`

### `private/validator.ts`

- Validates that an input file is well-formed
- Should run against both `public/sample-input.txt` and `private/input.txt`
- Should throw a typed error with a useful message when invalid

### `solution/solution.ts`

- Takes raw input text and returns raw output text
- Should be a small pure function where possible
- Should trust the validated input format instead of re-checking statement bounds
- Should not know anything about generator, validator, checker, or hidden data

### `private/checker.ts`

- Accepts `input`, `expectedOutput`, and `actualOutput`
- Returns a `CheckerResult`
- Supports exact matching today and leaves room for tolerant or custom judging later

## Example Problem: Codeforces 4A `watermelon`

Use `problems/watermelon/` as the first concrete example.

Problem summary:

- Input: first line `T`, then `T` integers `w`
- Output: one line per case in the form `Case #x: YES` or `Case #x: NO`

That means the correct rule is:

- `YES` when `w % 2 === 0 && w > 2`
- `NO` otherwise

Recommended example files:

```text
problems/watermelon/
├── public/
│   ├── statement.md         # problem statement
│   ├── sample-input.txt     # combined Hacker Cup-style sample cases
│   └── sample-output.txt    # combined Case #x answers
├── solution/
│   └── solution.ts
└── private/
    ├── generator.ts
    ├── validator.ts
    ├── checker.ts
    ├── input.txt            # combined hidden cases
    └── output.txt           # combined hidden answers
```

Why this is a good starter problem:

- the parsing is trivial
- the validator is simple but still useful
- the checker can start as exact-match with whitespace normalization
- the hidden full case can catch incorrect solutions like "always print YES for even numbers"

Recommended module behavior:

### `problems/watermelon/solution/solution.ts`

- Parse Hacker Cup-style input with `T` test cases
- Return one line per case as `Case #x: YES` or `Case #x: NO`
- Use the same `w > 2 && w % 2 === 0` rule for each case
- Do not re-check the `1 <= w <= 100` constraint in the solution; the validator owns that

### `problems/watermelon/private/validator.ts`

- Trim the input
- Confirm the first token is the test case count
- Confirm there are exactly `T` case values after it
- Confirm each case value is in the range `1 <= w <= 100`
- Throw a typed validation error if any check fails

### `problems/watermelon/private/generator.ts`

- For the initial example, generate deterministic hidden data
- Write combined hidden cases into `private/input.txt`
- Write combined `Case #x: ...` answers into `private/output.txt`

This is intentionally small. The goal of the first example is to prove the runner design, not to stress performance.

### `problems/watermelon/private/checker.ts`

- Trim trailing whitespace from expected and actual output
- Compare exact `Case #x: ...` output lines after normalization
- Return a readable wrong-answer message when they differ

This checker shape is enough for 4A and still matches the more general checker contract.

## Jest Testing Strategy

Each problem should get two core tests:

1. `sample case passes`
2. `full data case passes`

Each test should enforce all of the following:

- the input passes `private/validator.ts`
- the solution process starts successfully
- the solution exits successfully
- the solution does not time out
- the checker accepts the produced output

Recommended behavior:

- The sample test reads `public/sample-input.txt` and checks against `public/sample-output.txt`.
- The full test reads `private/input.txt` and checks against `private/output.txt`.
- The runner should fail fast with a clear message if any required file is missing.

Important recommendation:

- Do not regenerate `private/input.txt` and `private/output.txt` during ordinary Jest runs.
- Keep full data committed to the repo for stable, reviewable, deterministic tests.
- Use a separate generation command to refresh those files when needed.

That separation keeps tests predictable and prevents accidental fixture drift.

## Runner Design

The runner should stay small and boring. A good execution flow is:

1. Discover the problem directory.
2. Invoke `private/generator.ts`, `private/validator.ts`, and `private/checker.ts` through a dedicated TypeScript worker.
3. Read the text fixtures from disk.
4. Validate the input text.
5. Start the solution in an isolated temp directory.
6. Pipe the target input through stdin.
7. Capture stdout, stderr, exit code, and runtime.
8. Pass the result to `private/checker.ts`.
9. Convert failures into Jest assertion messages.

The runner should also own:

- per-test timeouts
- temp directory cleanup
- stdout normalization rules
- file existence checks
- structured error messages

## TypeScript Standards

Use strict settings by default. Recommended compiler rules:

- `"strict": true`
- `"noImplicitReturns": true`
- `"noUncheckedIndexedAccess": true`
- `"exactOptionalPropertyTypes": true`
- `"noFallthroughCasesInSwitch": true`
- `"useUnknownInCatchVariables": true`
- `"noPropertyAccessFromIndexSignature": true`

Code style recommendation:

- avoid `any`
- require explicit types for exported functions and exported objects
- prefer `readonly` fields in shared contracts
- keep problem modules small and single-purpose
- prefer Node built-ins over extra dependencies when possible

## Suggested Scripts

```json
{
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "jest",
    "test:problem": "jest --runInBand --",
    "generate": "tsx src/cli/generate.ts",
    "verify": "npm run typecheck && npm run test"
  }
}
```

`tsx` is a good fit for small TypeScript CLIs without adding much ceremony.

## Authoring Workflow

1. Create `problems/<slug>/`.
2. Add `public/statement.md`, `public/sample-input.txt`, and `public/sample-output.txt`.
3. Implement `solution/solution.ts`, `private/generator.ts`, `private/validator.ts`, and `private/checker.ts`.
4. Run the generator to write `private/input.txt` and `private/output.txt`.
5. Run Jest and confirm both sample and full-data tests pass.

For the first pass, use `problems/watermelon/` as the template problem and make sure:

1. the sample test runs on a combined Hacker Cup-style sample file
2. the hidden full-data test runs on a combined hidden file
3. the solution process can read `public/` files but cannot read anything in `private/`

## Implementation Phases

### Phase 1: Bootstrap

- create `package.json`
- add TypeScript, Jest, `ts-jest`, `@types/jest`, and `tsx`
- add strict `tsconfig.json`
- add base Jest config for Node

### Phase 2: Shared Contracts

- add `src/contracts/problem.ts`
- add path utilities and problem discovery
- add typed error helpers

### Phase 3: Runner

- implement sandboxed solution execution
- implement validation and checking pipeline
- normalize stdout and error reporting

### Phase 4: Problem Template

- create one example problem folder
- prove the file layout and contracts feel ergonomic
- adjust naming only after using it once

### Phase 5: Test Harness

- build dynamic Jest tests for every problem directory
- verify both sample and full-data paths
- make failures readable enough to debug quickly

## Final Recommendation

The key design choice is to keep problem folders simple and uniform while making the runner responsible for isolation. That gives you a project that is easy to author, easy to review, and strict enough to prevent accidental leakage of hidden problem data into solution runs.
