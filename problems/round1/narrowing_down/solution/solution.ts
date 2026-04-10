import type { ProblemSolution } from "../../../../src/contracts/problem";

const solution: ProblemSolution = (input: string): string => {
  const lines: readonly string[] = input.trim().split("\n");
  const t: number = Number(lines[0]!);
  const outputLines: string[] = [];
  let lineIndex: number = 1;

  for (let test = 1; test <= t; test += 1) {
    const n: number = Number(lines[lineIndex]!);
    lineIndex += 1;
    const a: readonly number[] = lines[lineIndex]!.split(" ").map(Number);
    lineIndex += 1;

    const s: number[] = new Array<number>(n + 1);
    s[0] = 0;
    for (let i = 1; i <= n; i += 1) {
      s[i] = (s[i - 1]! ^ a[i - 1]!);
    }

    const cnt: Map<number, bigint> = new Map();
    let res: bigint = 0n;

    for (let l = n; l >= 1; l -= 1) {
      const sL: number = s[l]!;
      cnt.set(sL, (cnt.get(sL) ?? 0n) + 1n);

      const cntXor: bigint = cnt.get(s[l - 1]!) ?? 0n;
      const span: bigint = BigInt(n - l + 1);
      res += (span * (span + 1n)) / 2n;
      res -= (cntXor * (cntXor + 1n)) / 2n;
    }

    outputLines.push(`Case #${String(test)}: ${String(res)}`);
  }

  return `${outputLines.join("\n")}\n`;
};

export default solution;
