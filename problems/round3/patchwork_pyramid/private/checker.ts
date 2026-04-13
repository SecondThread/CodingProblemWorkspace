import type { CheckerArgs, CheckerResult, ProblemChecker } from "../../../../src/contracts/problem";

function normalizeOutput(text: string): string {
  return text.replace(/\r\n/g, "\n").trimEnd();
}

const checker: ProblemChecker = {
  check(args: CheckerArgs): CheckerResult {
    const inputLines: readonly string[] = args.input.trim().split("\n").map((l) => l.trim());
    const actualLines: readonly string[] = normalizeOutput(args.actualOutput).split("\n");
    const expectedLines: readonly string[] = normalizeOutput(args.expectedOutput).split("\n");

    const T: number = Number(inputLines[0]!);
    let inputIdx: number = 1;
    let actualIdx: number = 0;
    let expectedIdx: number = 0;

    for (let t = 1; t <= T; t += 1) {
      const parts: string[] = inputLines[inputIdx]!.split(/\s+/);
      inputIdx += 1;
      const N: number = Number(parts[0]!);
      const K: number = Number(parts[1]!);

      // Parse expected output to get expected patch count
      const expectedHeader: string | undefined = expectedLines[expectedIdx];
      expectedIdx += 1;
      if (expectedHeader === undefined) {
        return { ok: false, kind: "wrong-answer", message: `Case ${String(t)}: missing expected header` };
      }
      const expectedMatch: RegExpMatchArray | null = expectedHeader.match(/^Case #(\d+): (\d+)$/);
      if (expectedMatch === null) {
        return { ok: false, kind: "presentation-error", message: `Case ${String(t)}: cannot parse expected header "${expectedHeader}"` };
      }
      const expectedPatches: number = Number(expectedMatch[2]!);
      expectedIdx += N; // skip expected grid lines

      // Parse actual output header
      const actualHeader: string | undefined = actualLines[actualIdx];
      actualIdx += 1;
      if (actualHeader === undefined) {
        return { ok: false, kind: "presentation-error", message: `Case ${String(t)}: missing actual header` };
      }
      const actualMatch: RegExpMatchArray | null = actualHeader.match(/^Case #(\d+): (\d+)$/);
      if (actualMatch === null) {
        return { ok: false, kind: "presentation-error", message: `Case ${String(t)}: cannot parse actual header "${actualHeader}"` };
      }
      const actualCaseNum: number = Number(actualMatch[1]!);
      if (actualCaseNum !== t) {
        return { ok: false, kind: "presentation-error", message: `Case ${String(t)}: expected case number ${String(t)} but got ${String(actualCaseNum)}` };
      }
      const statedPatches: number = Number(actualMatch[2]!);

      // Parse grid
      const grid: string[][] = [];
      for (let i = 0; i < N; i += 1) {
        const line: string | undefined = actualLines[actualIdx];
        actualIdx += 1;
        if (line === undefined) {
          return { ok: false, kind: "presentation-error", message: `Case ${String(t)}: missing grid row ${String(i + 1)}` };
        }
        if (line.length !== i + 1) {
          return { ok: false, kind: "presentation-error", message: `Case ${String(t)}: row ${String(i + 1)} should have ${String(i + 1)} characters but has ${String(line.length)}` };
        }
        if (!/^[a-z]+$/.test(line)) {
          return { ok: false, kind: "presentation-error", message: `Case ${String(t)}: row ${String(i + 1)} contains invalid characters` };
        }
        grid.push(line.split(""));
      }

      // Find connected components via BFS
      const visited: boolean[][] = [];
      for (let i = 0; i < N; i += 1) {
        visited.push(new Array<boolean>(i + 1).fill(false));
      }

      const dx: number[] = [0, -1, 0, 1];
      const dy: number[] = [-1, 0, 1, 0];
      let patchCount: number = 0;

      for (let i = 0; i < N; i += 1) {
        for (let j = 0; j <= i; j += 1) {
          if (visited[i]![j]!) continue;
          patchCount += 1;
          const color: string = grid[i]![j]!;
          const queue: [number, number][] = [[i, j]];
          visited[i]![j] = true;
          let size: number = 0;

          while (queue.length > 0) {
            const [ci, cj] = queue.shift()!;
            size += 1;
            for (let d = 0; d < 4; d += 1) {
              const ni: number = ci + dx[d]!;
              const nj: number = cj + dy[d]!;
              if (ni >= 0 && ni < N && nj >= 0 && nj <= ni && !visited[ni]![nj]! && grid[ni]![nj]! === color) {
                visited[ni]![nj] = true;
                queue.push([ni, nj]);
              }
            }
          }

          if (size > K) {
            return { ok: false, kind: "wrong-answer", message: `Case ${String(t)}: patch of color '${color}' starting at (${String(i + 1)},${String(j + 1)}) has size ${String(size)} > K=${String(K)}` };
          }
        }
      }

      // Check adjacent patches have different colors
      for (let i = 0; i < N; i += 1) {
        for (let j = 0; j <= i; j += 1) {
          for (let d = 0; d < 4; d += 1) {
            const ni: number = i + dx[d]!;
            const nj: number = j + dy[d]!;
            if (ni >= 0 && ni < N && nj >= 0 && nj <= ni) {
              // Adjacent cells with different colors: they are in different patches, which is fine
              // But we need to check: if two adjacent cells are in DIFFERENT patches, they must have different colors.
              // Two cells are in different patches if they are not connected by same-color path.
              // Actually, the constraint is: neighboring patches must be different colors.
              // Since patches ARE connected components of same color, two adjacent cells of different color
              // are automatically in different patches with different colors. The only issue would be
              // if two adjacent cells had the same color but were in different patches - but that's impossible
              // by definition (they'd be in the same connected component).
              // So we just need to verify no same-color disconnected components are adjacent, which is
              // automatically satisfied by the connected component definition.
            }
          }
        }
      }

      // Verify stated patches equals actual count
      if (statedPatches !== patchCount) {
        return { ok: false, kind: "wrong-answer", message: `Case ${String(t)}: stated ${String(statedPatches)} patches but grid has ${String(patchCount)} patches` };
      }

      // Verify optimality
      if (statedPatches !== expectedPatches) {
        return { ok: false, kind: "wrong-answer", message: `Case ${String(t)}: got ${String(statedPatches)} patches but expected optimal is ${String(expectedPatches)}` };
      }
    }

    return { ok: true };
  }
};

export default checker;
