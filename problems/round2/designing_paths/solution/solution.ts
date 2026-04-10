import type { ProblemSolution } from "../../../../src/contracts/problem";

function build(
  routes: readonly number[],
  zeroNode: number,
  ix: number,
  lo: number,
  hi: number,
  zeroEdges: number[][]
): void {
  if (lo === hi) {
    zeroEdges[zeroNode + ix]!.push(routes[lo]!);
    return;
  }
  zeroEdges[zeroNode + ix]!.push(zeroNode + ix * 2 + 1);
  zeroEdges[zeroNode + ix]!.push(zeroNode + ix * 2 + 2);
  const mid: number = (lo + hi) >> 1;
  build(routes, zeroNode, ix * 2 + 1, lo, mid, zeroEdges);
  build(routes, zeroNode, ix * 2 + 2, mid + 1, hi, zeroEdges);
}

function connect(
  connectFrom: number,
  zeroNode: number,
  queryLo: number,
  queryHi: number,
  ix: number,
  lo: number,
  hi: number,
  oneEdges: number[][]
): void {
  if (queryHi < lo || hi < queryLo) {
    return;
  }
  if (queryLo <= lo && hi <= queryHi) {
    oneEdges[connectFrom]!.push(zeroNode + ix);
    return;
  }
  const mid: number = (lo + hi) >> 1;
  connect(connectFrom, zeroNode, queryLo, queryHi, ix * 2 + 1, lo, mid, oneEdges);
  connect(connectFrom, zeroNode, queryLo, queryHi, ix * 2 + 2, mid + 1, hi, oneEdges);
}

function solveCase(lines: readonly string[], lineIndex: number): { result: bigint; nextLineIndex: number } {
  const header: readonly string[] = lines[lineIndex]!.split(" ");
  lineIndex += 1;
  const N: number = Number(header[0]!);
  const K: number = Number(header[1]!);
  const M: number = Number(header[2]!);

  const routes: number[][] = [];
  let numberOfNodes: number = N;
  const zeroNodeRoute: number[] = [];

  for (let i = 0; i < M; i += 1) {
    const tokens: readonly string[] = lines[lineIndex]!.split(" ");
    lineIndex += 1;
    const R: number = Number(tokens[0]!);
    const route: number[] = [];
    for (let j = 0; j < R; j += 1) {
      route.push(Number(tokens[j + 1]!) - 1);
    }
    routes.push(route);
    zeroNodeRoute.push(numberOfNodes);
    numberOfNodes += 4 * R;
  }

  const zeroEdges: number[][] = Array.from({ length: numberOfNodes }, () => []);
  const oneEdges: number[][] = Array.from({ length: numberOfNodes }, () => []);

  for (let i = 0; i < M; i += 1) {
    const route: readonly number[] = routes[i]!;
    const routeLen: number = route.length;
    build(route, zeroNodeRoute[i]!, 0, 0, routeLen - 1, zeroEdges);
    for (let j = 0; j < routeLen - 1; j += 1) {
      const endStop: number = Math.min(j + K, routeLen - 1);
      connect(route[j]!, zeroNodeRoute[i]!, j + 1, endStop, 0, 0, routeLen - 1, oneEdges);
    }
  }

  const dist: Int32Array = new Int32Array(numberOfNodes).fill(-1);
  const dequeBuffer: Int32Array = new Int32Array(numberOfNodes * 2);
  let dHead: number = numberOfNodes;
  let dTail: number = numberOfNodes;

  dequeBuffer[dTail] = 0;
  dTail += 1;
  const distVal: Int32Array = new Int32Array(numberOfNodes * 2);
  distVal[dHead] = 0;

  // Re-implement with a proper deque approach
  // Using two arrays: node and distance
  const qNode: Int32Array = new Int32Array(numberOfNodes * 4);
  const qDist: Int32Array = new Int32Array(numberOfNodes * 4);
  let qHead: number = numberOfNodes * 2;
  let qTail: number = numberOfNodes * 2;

  qNode[qTail] = 0;
  qDist[qTail] = 0;
  qTail += 1;

  while (qHead < qTail) {
    const u: number = qNode[qHead]!;
    const d: number = qDist[qHead]!;
    qHead += 1;

    if (dist[u] !== -1) {
      continue;
    }
    dist[u] = d;

    const ze: readonly number[] = zeroEdges[u]!;
    for (let ei = ze.length - 1; ei >= 0; ei -= 1) {
      const v: number = ze[ei]!;
      if (dist[v] === -1) {
        qHead -= 1;
        qNode[qHead] = v;
        qDist[qHead] = d;
      }
    }

    const oe: readonly number[] = oneEdges[u]!;
    for (let ei = 0; ei < oe.length; ei += 1) {
      const v: number = oe[ei]!;
      if (dist[v] === -1) {
        qNode[qTail] = v;
        qDist[qTail] = d + 1;
        qTail += 1;
      }
    }
  }

  let sum: bigint = 0n;
  for (let i = 0; i < N; i += 1) {
    const distI: number = dist[i]!;
    const value: number = distI === -1 ? -1 : distI;
    sum += BigInt(i + 1) * BigInt(value);
  }

  return { result: sum, nextLineIndex: lineIndex };
}

const solution: ProblemSolution = (input: string): string => {
  const lines: readonly string[] = input.trim().split("\n");
  const T: number = Number(lines[0]!);
  const outputLines: string[] = [];
  let lineIndex: number = 1;

  for (let t = 1; t <= T; t += 1) {
    const { result, nextLineIndex } = solveCase(lines, lineIndex);
    lineIndex = nextLineIndex;
    outputLines.push(`Case #${String(t)}: ${String(result)}`);
  }

  return `${outputLines.join("\n")}\n`;
};

export default solution;
