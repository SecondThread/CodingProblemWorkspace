import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { GeneratedCase, ProblemGenerator } from "../../../../src/contracts/problem";
import { buildGpuCubesOutput } from "../solution/core";

function readSourceInput(): string {
  return readFileSync(join(process.cwd(), "problems", "gpu-cubes", "private", "source-input.txt"), "utf8");
}

const generator: ProblemGenerator = {
  generate(): GeneratedCase {
    const input: string = readSourceInput();

    return {
      input,
      output: buildGpuCubesOutput(input)
    };
  }
};

export default generator;
