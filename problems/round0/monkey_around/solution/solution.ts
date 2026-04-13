import type { ProblemSolution } from "../../../../src/contracts/problem";

const solution: ProblemSolution = (input: string): string => {
  const lines: readonly string[] = input.trim().split("\n");
  const t: number = Number(lines[0]!);
  const outputLines: string[] = [];
  let lineIndex: number = 1;

  for (let test = 1; test <= t; test += 1) {
    const n: number = Number(lines[lineIndex]!);
    lineIndex += 1;
    const a: number[] = lines[lineIndex]!.trim().split(/\s+/).map(Number);
    lineIndex += 1;

    // Parse A into groups of rotated identity permutations (iterative)
    const groups: Array<[number, number]> = []; // [size, shift]
    let i: number = 0;
    while (i < a.length) {
      if (a[i] === 1) {
        // Unshifted: ascending from 1
        while (i < a.length - 1 && a[i + 1] === a[i]! + 1) {
          i += 1;
        }
        groups.push([a[i]!, 0]);
      } else {
        // Shifted: starts at some value > 1
        const start: number = a[i]!;
        let biggest: number = a[i]!;
        while (a[i] !== 1) {
          biggest = a[i]!;
          i += 1;
        }
        while (a[i] !== start - 1) {
          i += 1;
        }
        groups.push([biggest, start - 1]);
      }
      i += 1;
    }

    // Reconstruct operations in reverse order
    let shifts: number = 0;
    const sol: Array<number[]> = [];
    for (let g = groups.length - 1; g >= 0; g -= 1) {
      const [size, shift] = groups[g]!;
      let sNeeded: number = shifts % size;
      sNeeded = size - sNeeded;
      sNeeded += shift;
      sNeeded %= size;
      for (let j = 0; j < sNeeded; j += 1) {
        sol.push([2]);
      }
      sol.push([1, size]);
      shifts += sNeeded;
    }
    sol.reverse();

    outputLines.push(`Case #${String(test)}: ${String(sol.length)}`);
    for (const op of sol) {
      outputLines.push(op.join(" "));
    }
  }

  return `${outputLines.join("\n")}\n`;
};

export default solution;
