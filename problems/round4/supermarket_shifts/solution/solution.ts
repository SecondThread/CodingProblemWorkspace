import type { ProblemSolution } from "../../../../src/contracts/problem";

function invert(arr: Int32Array): Int32Array {
  const ret = new Int32Array(arr.length);
  for (let i = 0; i < arr.length; i += 1) {
    ret[arr[i]!] = i;
  }
  return ret;
}

function countInversions(arr: Int32Array): number {
  const n = arr.length;
  if (n <= 1) return 0;
  const temp = new Int32Array(n);
  return mergeSortCount(arr, temp, 0, n - 1);
}

function mergeSortCount(arr: Int32Array, temp: Int32Array, left: number, right: number): number {
  if (left >= right) return 0;
  const mid = (left + right) >> 1;
  let count = 0;
  count += mergeSortCount(arr, temp, left, mid);
  count += mergeSortCount(arr, temp, mid + 1, right);
  // Merge
  let i = left;
  let j = mid + 1;
  let k = left;
  while (i <= mid && j <= right) {
    if (arr[i]! <= arr[j]!) {
      temp[k++] = arr[i++]!;
    } else {
      count += mid - i + 1;
      temp[k++] = arr[j++]!;
    }
  }
  while (i <= mid) {
    temp[k++] = arr[i++]!;
  }
  while (j <= right) {
    temp[k++] = arr[j++]!;
  }
  for (let x = left; x <= right; x += 1) {
    arr[x] = temp[x]!;
  }
  return count;
}

const solution: ProblemSolution = (input: string): string => {
  const lines: readonly string[] = input.trim().split("\n");
  let lineIndex = 0;
  const t = Number(lines[lineIndex]!);
  lineIndex += 1;
  const outputLines: string[] = [];

  for (let tc = 1; tc <= t; tc += 1) {
    const firstLine = lines[lineIndex]!.trim().split(/\s+/);
    const N = Number(firstLine[0]!);
    const M = Number(firstLine[1]!);
    lineIndex += 1;

    const wrr = new Int32Array(N);
    const trr = new Int32Array(N);

    const wTokens = lines[lineIndex]!.trim().split(/\s+/);
    lineIndex += 1;
    for (let i = 0; i < N; i += 1) {
      wrr[i] = Number(wTokens[i]!) - 1;
    }

    const tTokens = lines[lineIndex]!.trim().split(/\s+/);
    lineIndex += 1;
    for (let i = 0; i < N; i += 1) {
      trr[i] = Number(tTokens[i]!) - 1;
    }

    const locks: Array<[number, number]> = [];
    for (let i = 0; i < M; i += 1) {
      const lockTokens = lines[lineIndex]!.trim().split(/\s+/);
      lineIndex += 1;
      locks.push([Number(lockTokens[0]!) - 1, Number(lockTokens[1]!) - 1]);
    }

    const invw = invert(wrr);
    const invt = invert(trr);
    const invinvw = invert(invw);
    const invinvt = invert(invt);

    let impossible = false;
    for (let i = 0; i < M; i += 1) {
      const l0 = locks[i]![0];
      const l1 = locks[i]![1];
      if (
        (invinvw[l0]! < invinvw[l1]! && invinvt[l0]! > invinvt[l1]!) ||
        (invinvw[l0]! > invinvw[l1]! && invinvt[l0]! < invinvt[l1]!)
      ) {
        impossible = true;
        break;
      }
    }

    if (impossible) {
      outputLines.push(`Case #${String(tc)}: -1`);
      continue;
    }

    const ord = new Int32Array(N);
    for (let i = 0; i < N; i += 1) {
      ord[i] = invinvt[invw[i]!]!;
    }

    const inversions = countInversions(ord);
    outputLines.push(`Case #${String(tc)}: ${String(inversions)}`);
  }

  return `${outputLines.join("\n")}\n`;
};

export default solution;
