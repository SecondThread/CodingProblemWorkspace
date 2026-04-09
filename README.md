# CodingProblemWorkspace

Strictly typed TypeScript workspace for coding problems.

## Layout

Keep the project small:

- `src/` contains the runner, judge helpers, and problem registry.
- `src/problems/` contains one TypeScript module per problem.
- `problems/<problem-id>/` contains the problem statement plus sample and hidden data files.
- `test/` contains Node built-in tests.

The `problems/` directory is intentional here because each problem now needs its own statement, sample input/output, hidden input/output, and generated artifacts.

## Watermelon Example

`codeforces-4a` shows the full workflow:

- Solver: `src/problems/codeforces-4a.ts`
- Statement: `problems/codeforces-4a/problem.md`
- Sample data: `problems/codeforces-4a/sample-input.txt` and `sample-output.txt`
- Hidden data: `problems/codeforces-4a/hidden-input.txt` and `hidden-output.txt`

The hidden dataset is exhaustive for Watermelon: every valid `w` from `1` through `100`.

## Commands

Install dependencies:

```bash
npm install
```

Build:

```bash
npm run build
```

Solve one input:

```bash
printf '8\n' | npm run solve -- codeforces-4a
```

Judge the sample:

```bash
npm run judge -- codeforces-4a sample
```

Judge the hidden dataset:

```bash
npm run judge -- codeforces-4a hidden
```

Regenerate hidden files for a problem:

```bash
npm run generate -- codeforces-4a
```

Run tests:

```bash
npm test
```

## Docker

Build and run through Docker with the wrapper:

```bash
./run.sh judge codeforces-4a sample
./run.sh judge codeforces-4a hidden
printf '8\n' | ./run.sh solve codeforces-4a
```

## Adding Another Problem

1. Add `problems/<problem-id>/problem.md`, `sample-input.txt`, and `sample-output.txt`.
2. Add `src/problems/<problem-id>.ts` exporting a `ProblemDefinition`.
3. Register it in `src/problem-registry.ts`.
4. If you want hidden coverage, implement `buildHiddenCaseSet()` and run `npm run generate -- <problem-id>`.
5. If exact output comparison is not enough, add a custom `judgeOutput()` for that problem.

Hidden files store one full test case per block separated by `<<CASE>>`, so multi-line cases are still easy to generate and judge.
