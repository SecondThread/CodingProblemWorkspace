import type { ProblemSolution } from "../../../../src/contracts/problem";

const solution: ProblemSolution = (input: string): string => {
  const lines: readonly string[] = input.trim().split("\n");
  const t: number = Number(lines[0]!);
  const outputLines: string[] = [];
  let lineIndex: number = 1;

  for (let test = 1; test <= t; test += 1) {
    const n: number = Number(lines[lineIndex]!);
    lineIndex += 1;
    const a: number[] = lines[lineIndex]!.split(" ").map(Number);
    lineIndex += 1;
    const b: number[] = lines[lineIndex]!.split(" ").map(Number);
    lineIndex += 1;

    const where: number[] = new Array(n + 1).fill(-1);
    for (let i = 0; i < n; i += 1) {
      where[a[i]!] = i;
    }

    const ord: number[] = [];
    for (let i = 0; i < n; i += 1) {
      ord.push(i);
    }
    ord.sort((x, y) => b[x]! - b[y]!);

    let impossible: boolean = false;
    const ans: Array<[number, number]> = [];

    for (let i = 0; i < n; i += 1) {
      const c: number = ord[i]!;
      if (b[c]! < a[c]!) {
        impossible = true;
        break;
      }
      if (b[c]! > n || where[b[c]!] === undefined || where[b[c]!] === -1) {
        impossible = true;
        break;
      }
      if (b[c]! === a[c]!) {
        continue;
      }
      ans.push([where[b[c]!]!, c]);
    }

    if (impossible) {
      outputLines.push(`Case #${String(test)}: -1`);
    } else {
      outputLines.push(`Case #${String(test)}: ${String(ans.length)}`);
      for (const [x, y] of ans) {
        outputLines.push(`${String(x + 1)} ${String(y + 1)}`);
      }
    }
  }

  return `${outputLines.join("\n")}\n`;
};

export default solution;
