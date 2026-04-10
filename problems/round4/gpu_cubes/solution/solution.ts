import type { ProblemSolution } from "../../../../src/contracts/problem";
import { buildGpuCubesOutput } from "./core";

const solution: ProblemSolution = (input: string): string => {
  return buildGpuCubesOutput(input);
};

export default solution;
