import * as assert from "node:assert/strict";
import test = require("node:test");
import { readFileSync } from "node:fs";

import { judgeProblem, serializeCaseSet } from "../src/problem-core";
import { getProblem } from "../src/problem-registry";
import { solveWatermelon } from "../src/problems/codeforces-4a";

test("watermelon sample solution matches the sample files", () => {
  const problem = getProblem("codeforces-4a");
  const sampleInput = readFileSync("problems/codeforces-4a/sample-input.txt", "utf8");
  const sampleOutput = readFileSync("problems/codeforces-4a/sample-output.txt", "utf8");

  assert.equal(solveWatermelon(sampleInput), sampleOutput);
  assert.deepEqual(judgeProblem(problem, "sample"), {
    ok: true,
    message: "codeforces-4a sample sample passed",
  });
});

test("watermelon hidden files stay in sync with the generator", () => {
  const problem = getProblem("codeforces-4a");
  if (problem.buildHiddenCaseSet === undefined) {
    throw new Error("Expected codeforces-4a to define buildHiddenCaseSet()");
  }

  const hiddenCases = problem.buildHiddenCaseSet();
  const hiddenInput = readFileSync("problems/codeforces-4a/hidden-input.txt", "utf8");
  const hiddenOutput = readFileSync("problems/codeforces-4a/hidden-output.txt", "utf8");

  assert.equal(hiddenInput, serializeCaseSet(hiddenCases.map((hiddenCase) => hiddenCase.input)));
  assert.equal(
    hiddenOutput,
    serializeCaseSet(hiddenCases.map((hiddenCase) => hiddenCase.expectedOutput)),
  );
});

test("watermelon hidden judge passes the exhaustive case set", () => {
  const problem = getProblem("codeforces-4a");
  assert.deepEqual(judgeProblem(problem, "hidden"), {
    ok: true,
    message: "codeforces-4a hidden passed 100 cases",
  });
});
