import type { GeneratedCase, ProblemGenerator } from "../../../../src/contracts/problem";
import solution from "../solution/solution";

const generator: ProblemGenerator = {
  generate(): GeneratedCase {
    const cases: string[] = [];

    // Sample case 1: N=7 K=2 M=2
    cases.push("7 2 2");
    cases.push("4 1 5 7 2");
    cases.push("3 2 3 4");

    // Sample case 2: N=5 K=1 M=2
    cases.push("5 1 2");
    cases.push("3 1 2 3");
    cases.push("3 1 4 5");

    // Sample case 3: N=5 K=1 M=1
    cases.push("5 1 1");
    cases.push("5 1 2 3 4 5");

    // Sample case 4: N=5 K=4 M=1
    cases.push("5 4 1");
    cases.push("5 1 2 3 4 5");

    // Sample case 5: N=5 K=1 M=1
    cases.push("5 1 1");
    cases.push("5 3 4 5 1 2");

    const T: number = 5;
    const inputLines: string[] = [String(T)];
    let caseLineIndex: number = 0;

    for (let t = 0; t < T; t += 1) {
      const headerLine: string = cases[caseLineIndex]!;
      inputLines.push(headerLine);
      caseLineIndex += 1;

      const M: number = Number(headerLine.split(" ")[2]!);
      for (let m = 0; m < M; m += 1) {
        inputLines.push(cases[caseLineIndex]!);
        caseLineIndex += 1;
      }
    }

    const input: string = `${inputLines.join("\n")}\n`;
    const output: string = solution(input) as string;

    return { input, output };
  }
};

export default generator;
