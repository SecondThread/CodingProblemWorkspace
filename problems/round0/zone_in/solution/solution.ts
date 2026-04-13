import type { ProblemSolution } from "../../../../src/contracts/problem";

const DR: readonly number[] = [0, -1, 0, 1];
const DC: readonly number[] = [1, 0, -1, 0];

const solution: ProblemSolution = (input: string): string => {
  const lines: readonly string[] = input.trim().split("\n");
  const t: number = Number(lines[0]!);
  const outputLines: string[] = [];
  let lineIndex: number = 1;

  for (let test = 1; test <= t; test += 1) {
    const parts: string[] = lines[lineIndex]!.trim().split(/\s+/);
    const R: number = Number(parts[0]!);
    const C: number = Number(parts[1]!);
    const S: number = Number(parts[2]!);
    lineIndex += 1;

    const grid: Uint8Array = new Uint8Array(R * C);
    const qr: Int32Array = new Int32Array(R * C + 2 * R + 2 * C + 4);
    const qc: Int32Array = new Int32Array(R * C + 2 * R + 2 * C + 4);
    let qHead: number = 0;
    let qTail: number = 0;

    for (let r = 0; r < R; r += 1) {
      const line: string = lines[lineIndex]!;
      lineIndex += 1;
      for (let c = 0; c < C; c += 1) {
        if (line[c] === "#") {
          grid[r * C + c] = 1;
          qr[qTail] = r;
          qc[qTail] = c;
          qTail += 1;
        }
      }
    }

    // Add implicit wall border points
    for (let i = 0; i < R; i += 1) {
      qr[qTail] = i; qc[qTail] = -1; qTail += 1;
      qr[qTail] = i; qc[qTail] = C;  qTail += 1;
    }
    for (let i = 0; i < C; i += 1) {
      qr[qTail] = -1; qc[qTail] = i; qTail += 1;
      qr[qTail] = R;  qc[qTail] = i; qTail += 1;
    }

    // BFS S layers to mark unsafe cells
    let dist: number = 0;
    while (dist < S) {
      const layerEnd: number = qTail;
      while (qHead < layerEnd) {
        const pr: number = qr[qHead]!;
        const pc: number = qc[qHead]!;
        qHead += 1;
        for (let d = 0; d < 4; d += 1) {
          const nr: number = pr + DR[d]!;
          const nc: number = pc + DC[d]!;
          if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue;
          const idx: number = nr * C + nc;
          if (grid[idx] === 1) continue;
          grid[idx] = 1;
          qr[qTail] = nr;
          qc[qTail] = nc;
          qTail += 1;
        }
      }
      dist += 1;
    }

    // Find largest remaining connected component
    let best: number = 0;
    // Reuse queue arrays for flood fill
    for (let r = 0; r < R; r += 1) {
      for (let c = 0; c < C; c += 1) {
        const idx: number = r * C + c;
        if (grid[idx] === 1) continue;
        grid[idx] = 1;
        let size: number = 1;
        let fHead: number = 0;
        let fTail: number = 0;
        qr[fTail] = r;
        qc[fTail] = c;
        fTail += 1;
        while (fHead < fTail) {
          const pr: number = qr[fHead]!;
          const pc: number = qc[fHead]!;
          fHead += 1;
          for (let d = 0; d < 4; d += 1) {
            const nr: number = pr + DR[d]!;
            const nc: number = pc + DC[d]!;
            if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue;
            const nIdx: number = nr * C + nc;
            if (grid[nIdx] === 1) continue;
            grid[nIdx] = 1;
            size += 1;
            qr[fTail] = nr;
            qc[fTail] = nc;
            fTail += 1;
          }
        }
        if (size > best) best = size;
      }
    }

    outputLines.push(`Case #${String(test)}: ${String(best)}`);
  }

  return `${outputLines.join("\n")}\n`;
};

export default solution;
