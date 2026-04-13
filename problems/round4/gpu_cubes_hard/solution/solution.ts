import type { ProblemSolution } from "../../../../src/contracts/problem";

const ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:,<.>/?'\"`~\\";

interface CubeCase {
  readonly n: number;
  readonly adjacency: readonly (readonly boolean[])[];
}

function parseCases(input: string): readonly CubeCase[] {
  const lines = input.replace(/\r\n/g, "\n").trim().split("\n");
  const t = Number(lines[0]!);
  const cases: CubeCase[] = [];
  let idx = 1;

  for (let c = 0; c < t; c++) {
    const n = Number(lines[idx]!);
    idx++;
    const adj: boolean[][] = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => false)
    );

    for (let row = 1; row < n; row++) {
      const vals = lines[idx]!.split(" ").map(Number);
      idx++;
      for (let col = 0; col < row; col++) {
        if (vals[col] === 1) {
          adj[row]![col] = true;
          adj[col]![row] = true;
        }
      }
    }

    cases.push({ n, adjacency: adj });
  }

  return cases;
}

function solveCase(caseData: CubeCase): string[] {
  const n = caseData.n;
  const a = caseData.adjacency;
  const m = 47;

  // Create 3D array ans[m][m][m] filled with spaces
  const ans: string[][][] = Array.from({ length: m }, () =>
    Array.from({ length: m }, () => Array.from({ length: m }, () => " "))
  );

  const path = [0, 1, 2, 3, 1, 4, 0, 2, 4, 3, 0];
  const len = path.length;

  for (let g = 0; g < len; g++) {
    const group = path[g]!;
    const x = g * 4;

    for (let i = 0; i < 19; i++) {
      const color = group * 19 + i;
      if (color >= n) continue;

      const height = 2 * i + 2;

      // Horizontal bar along z at y=height, fixed x
      for (let z = 2; z <= 38; z++) {
        ans[x]![height]![z] = ALPHABET[color]!;
      }

      // Connection points
      ans[x + 1]![height]![height] = ALPHABET[color]!;
      ans[x + 2]![height]![height] = ALPHABET[color]!;

      // Vertical bar along y at x+2, z=height
      for (let y = 2; y <= 38; y++) {
        ans[x + 2]![y]![height] = ALPHABET[color]!;
      }

      // Same-group adjacency at x+1
      for (let i1 = 0; i1 < 19; i1++) {
        const color1 = group * 19 + i1;
        if (color1 < n) {
          if (a[color]![color1]) {
            ans[x + 1]![i1 * 2 + 2]![height] = ALPHABET[color]!;
          }
        }

        // Next-group adjacency at x+3
        if (g < len - 1) {
          const color2 = path[g + 1]! * 19 + i1;
          if (color2 < n) {
            if (a[color]![color2]) {
              ans[x + 3]![i1 * 2 + 2]![height] = ALPHABET[color]!;
            }
          }
        }
      }
    }
  }

  // Connect group 0 instances (path positions 0, 6, 10) via z=40 corridor
  for (let i = 0; i < 19; i++) {
    const color = 0 * 19 + i;
    if (color >= n) continue;
    const height = 2 * i + 2;

    for (const tmp of [0, 6, 10]) {
      const x = tmp * 4;
      ans[x]![height]![39] = ALPHABET[color]!;
      ans[x]![height]![40] = ALPHABET[color]!;
    }

    for (let x = 0; x < m; x++) {
      ans[x]![height]![40] = ALPHABET[color]!;
    }
  }

  // Connect group 1 instances (path positions 1, 4) via z=0 corridor
  for (let i = 0; i < 19; i++) {
    const color = 1 * 19 + i;
    if (color >= n) continue;
    const height = 2 * i + 2;

    for (const tmp of [1, 4]) {
      const x = tmp * 4;
      ans[x]![height]![1] = ALPHABET[color]!;
      ans[x]![height]![0] = ALPHABET[color]!;
    }

    for (let x = 4 * 1; x <= 4 * 4; x++) {
      ans[x]![height]![0] = ALPHABET[color]!;
    }
  }

  // Connect group 4 instances (path positions 5, 8) via z=0 corridor
  for (let i = 0; i < 19; i++) {
    const color = 4 * 19 + i;
    if (color >= n) continue;
    const height = 2 * i + 2;

    for (const tmp of [5, 8]) {
      const x = tmp * 4;
      ans[x]![height]![1] = ALPHABET[color]!;
      ans[x]![height]![0] = ALPHABET[color]!;
    }

    for (let x = 4 * 5; x <= 4 * 8; x++) {
      ans[x]![height]![0] = ALPHABET[color]!;
    }
  }

  // Connect group 2 instances (path positions 2, 7) via y=40 corridor
  for (let i = 0; i < 19; i++) {
    const color = 2 * 19 + i;
    if (color >= n) continue;
    const height = 2 * i + 2;

    for (const tmp of [2, 7]) {
      const x = tmp * 4;
      ans[x + 2]![39]![height] = ALPHABET[color]!;
      ans[x + 2]![40]![height] = ALPHABET[color]!;
    }

    for (let x = 0; x < m; x++) {
      ans[x]![40]![height] = ALPHABET[color]!;
    }
  }

  // Connect group 3 instances (path positions 3, 9) via y=0 corridor
  for (let i = 0; i < 19; i++) {
    const color = 3 * 19 + i;
    if (color >= n) continue;
    const height = 2 * i + 2;

    for (const tmp of [3, 9]) {
      const x = tmp * 4;
      ans[x + 2]![1]![height] = ALPHABET[color]!;
      ans[x + 2]![0]![height] = ALPHABET[color]!;
    }

    for (let x = 0; x < m; x++) {
      ans[x]![0]![height] = ALPHABET[color]!;
    }
  }

  // Output
  const outputLines: string[] = [];
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < m; j++) {
      let row = "";
      for (let k = 0; k < m; k++) {
        row += ans[i]![j]![k]!;
      }
      outputLines.push(row);
    }
  }

  return outputLines;
}

const solution: ProblemSolution = (input: string): string => {
  const cases = parseCases(input);
  const result: string[] = [];

  for (let i = 0; i < cases.length; i++) {
    const caseLines = solveCase(cases[i]!);
    result.push(`Case #${i + 1}: ${47}`);
    result.push(...caseLines);
  }

  return result.join("\n") + "\n";
};

export default solution;
