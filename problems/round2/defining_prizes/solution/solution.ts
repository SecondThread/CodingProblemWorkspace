import type { ProblemSolution } from "../../../../src/contracts/problem";

function check(groups: readonly number[], stock: readonly number[], k: number): boolean {
  let need = 0;
  for (let i = k; i < groups.length; i += 1) need += groups[i]!;
  let s: number = stock.length - 1;
  let deficit = 0;
  for (let i = k; i < groups.length; i += 1) {
    if (s < 0) return false;
    deficit = Math.max(0, need + deficit - stock[s]!);
    s -= 1;
    need -= groups[i]!;
  }
  while (s >= 0) {
    deficit -= stock[s]!;
    s -= 1;
  }
  return deficit <= 0;
}

function solve(n: number, m: number, scoreArr: number[], stockArr: number[]): number {
  scoreArr.sort((a, b) => a - b);
  stockArr.sort((a, b) => a - b);

  const groups: number[] = [];
  let last: number = scoreArr[0]!;
  let cnt = 0;
  for (let i = 0; i < n; i += 1) {
    if (scoreArr[i] === last) {
      cnt += 1;
    } else {
      groups.push(cnt);
      cnt = 1;
      last = scoreArr[i]!;
    }
  }
  groups.push(cnt);

  let l = 0;
  let r: number = groups.length;
  while (l < r) {
    const mid: number = l + Math.floor((r - l) / 2);
    if (check(groups, stockArr, mid)) {
      r = mid;
    } else {
      l = mid + 1;
    }
  }

  let res = 0;
  for (let i = l; i < groups.length; i += 1) res += groups[i]!;
  return res;
}

const solution: ProblemSolution = (input: string): string => {
  const lines: readonly string[] = input.trim().split("\n").map((l) => l.trim());
  const t: number = Number(lines[0]!);
  let lineIndex = 1;
  const results: string[] = [];

  for (let c = 1; c <= t; c += 1) {
    const [n, m] = lines[lineIndex]!.split(" ").map(Number) as [number, number];
    lineIndex += 1;
    const scoreArr: number[] = lines[lineIndex]!.split(" ").map(Number);
    lineIndex += 1;
    const stockArr: number[] = lines[lineIndex]!.split(" ").map(Number);
    lineIndex += 1;
    const ans: number = solve(n, m, scoreArr, stockArr);
    results.push(`Case #${String(c)}: ${String(ans)}`);
  }

  return `${results.join("\n")}\n`;
};

export default solution;
