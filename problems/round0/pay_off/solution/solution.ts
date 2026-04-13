import type { ProblemSolution } from "../../../../src/contracts/problem";

function lowerBound(arr: readonly number[], val: number): number {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (arr[mid]! < val) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return lo;
}

function upperBound(arr: readonly number[], val: number): number {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (arr[mid]! <= val) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return lo;
}

function insertSorted(arr: number[], val: number): void {
  const pos = lowerBound(arr, val);
  arr.splice(pos, 0, val);
}

const solution: ProblemSolution = (input: string): string => {
  const lines: readonly string[] = input.trim().split("\n");
  let lineIndex = 0;
  const T = Number(lines[lineIndex++]!);
  const outputLines: string[] = [];

  for (let cc = 1; cc <= T; cc++) {
    const firstLine = lines[lineIndex++]!.trim().split(/\s+/);
    const N = Number(firstLine[0]!);
    const Q = Number(firstLine[1]!);
    const L = Number(firstLine[2]!);

    const cowPos: number[] = [];
    const posCow = new Map<number, number>();
    const posLine = lines[lineIndex++]!.trim().split(/\s+/);
    for (let i = 0; i < N; i++) {
      cowPos.push(Number(posLine[i]!));
      posCow.set(cowPos[i]!, i + 1);
    }

    const walls: number[] = [1, L];

    const queryCow: number[][] = [];
    for (let i = 0; i < N; i++) queryCow.push([]);
    const queryLeft: number[] = new Array(Q);
    const queryRight: number[] = new Array(Q);
    const queryTime: number[] = new Array(Q);
    const queryAns: number[] = new Array(Q).fill(-1);

    for (let i = 0; i < Q; i++) {
      const qLine = lines[lineIndex++]!.trim().split(/\s+/);
      const type = Number(qLine[0]!);
      if (type === 1) {
        const x = Number(qLine[1]!);
        insertSorted(walls, x);
      }
      if (type === 2) {
        const c = Number(qLine[1]!) - 1;
        const t = Number(qLine[2]!);
        const it = lowerBound(walls, cowPos[c]!);
        queryLeft[i] = walls[it - 1]!;
        queryRight[i] = walls[it]!;
        queryTime[i] = t;
        queryCow[c]!.push(i);
      }
    }

    const cows: number[] = [];

    for (let cow = N - 1; cow >= 0; cow--) {
      const queries = queryCow[cow]!;
      for (const query of queries) {
        let t = queryTime[query]!;
        const gap = queryRight[query]! - queryLeft[query]!;
        const left = queryLeft[query]!;
        const right = queryRight[query]!;
        const cp = cowPos[cow]!;

        if (t >= gap) {
          const it = lowerBound(cows, right);
          if (it > 0 && cows[it - 1]! > left) {
            queryAns[query] = posCow.get(cows[it - 1]!)!;
          } else {
            queryAns[query] = 0;
          }
        } else {
          queryAns[query] = 0;
        }

        t = t % gap;
        if (t <= cp - left) {
          const threshold = 2 * t - cp + 2 * left;
          const it = upperBound(cows, threshold);
          if (it > 0 && cows[it - 1]! > left) {
            queryAns[query] = posCow.get(cows[it - 1]!)!;
          }
        } else {
          const it = lowerBound(cows, cp);
          if (it > 0 && cows[it - 1]! > left) {
            queryAns[query] = posCow.get(cows[it - 1]!)!;
          }

          const tRem = t - (cp - left);
          const bound = Math.min(cp + 2 * tRem, right);
          const it2 = upperBound(cows, bound);
          if (it2 > 0 && cows[it2 - 1]! > cp) {
            queryAns[query] = posCow.get(cows[it2 - 1]!)!;
          }
        }
      }
      insertSorted(cows, cowPos[cow]!);
    }

    let ans = 0;
    for (let i = 0; i < Q; i++) {
      if (queryAns[i]! !== -1) {
        ans += queryAns[i]!;
      }
    }
    outputLines.push(`Case #${String(cc)}: ${String(ans)}`);
  }

  return `${outputLines.join("\n")}\n`;
};

export default solution;
