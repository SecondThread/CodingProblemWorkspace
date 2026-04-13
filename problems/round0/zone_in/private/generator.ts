import type { GeneratedCase, ProblemGenerator } from "../../../../src/contracts/problem";

function seededRandom(seed: number): () => number {
  let state: number = seed;
  return (): number => {
    state = (state * 1664525 + 1013904223) & 0xffffffff;
    return (state >>> 0) / 0x100000000;
  };
}

function randomInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

const DR: readonly number[] = [0, -1, 0, 1];
const DC: readonly number[] = [1, 0, -1, 0];

function solve(R: number, C: number, S: number, gridChars: string[]): number {
  const grid: Uint8Array = new Uint8Array(R * C);
  const maxQ: number = R * C + 2 * R + 2 * C + 4;
  const qr: Int32Array = new Int32Array(maxQ);
  const qc: Int32Array = new Int32Array(maxQ);
  let qHead: number = 0;
  let qTail: number = 0;

  for (let r = 0; r < R; r += 1) {
    const line: string = gridChars[r]!;
    for (let c = 0; c < C; c += 1) {
      if (line[c] === "#") {
        grid[r * C + c] = 1;
        qr[qTail] = r;
        qc[qTail] = c;
        qTail += 1;
      }
    }
  }

  for (let i = 0; i < R; i += 1) {
    qr[qTail] = i; qc[qTail] = -1; qTail += 1;
    qr[qTail] = i; qc[qTail] = C;  qTail += 1;
  }
  for (let i = 0; i < C; i += 1) {
    qr[qTail] = -1; qc[qTail] = i; qTail += 1;
    qr[qTail] = R;  qc[qTail] = i; qTail += 1;
  }

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

  let best: number = 0;
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

  return best;
}

interface TestCase {
  readonly R: number;
  readonly C: number;
  readonly S: number;
  readonly gridRows: readonly string[];
}

function generateGrid(rng: () => number, R: number, C: number, objP: number): string[] {
  const rows: string[] = [];
  for (let r = 0; r < R; r += 1) {
    let row: string = "";
    for (let c = 0; c < C; c += 1) {
      row += rng() < objP ? "#" : ".";
    }
    rows.push(row);
  }
  return rows;
}

const generator: ProblemGenerator = {
  generate(): GeneratedCase {
    const rng = seededRandom(314159);
    const cases: TestCase[] = [];

    // Case 1: large grid, very sparse obstacles, S=1 (original: 4x250000 but we use 100x100)
    {
      const R = 100; const C = 100; const S = 1;
      const gridRows = generateGrid(rng, R, C, 0.000001);
      cases.push({ R, C, S, gridRows });
    }

    // Case 2: medium grid, very sparse, large S (original: 1000x1000 S=50)
    {
      const R = 100; const C = 100; const S = 50;
      const gridRows = generateGrid(rng, R, C, 0.00001);
      cases.push({ R, C, S, gridRows });
    }

    // Case 3: medium grid, sparse, moderate S (original: 1000x1000 S=5)
    {
      const R = 100; const C = 100; const S = 5;
      const gridRows = generateGrid(rng, R, C, 0.001);
      cases.push({ R, C, S, gridRows });
    }

    // Case 4: medium grid, moderate density, S=1 (original: 1000x1000 S=1)
    {
      const R = 100; const C = 100; const S = 1;
      const gridRows = generateGrid(rng, R, C, 0.1);
      cases.push({ R, C, S, gridRows });
    }

    // Edge cases
    // All dots, small S
    {
      const R = 10; const C = 10; const S = 1;
      const gridRows: string[] = [];
      for (let r = 0; r < R; r += 1) gridRows.push("..........".slice(0, C));
      cases.push({ R, C, S, gridRows });
    }

    // All dots, large S that wipes everything
    {
      const R = 10; const C = 10; const S = 10;
      const gridRows: string[] = [];
      for (let r = 0; r < R; r += 1) gridRows.push("..........".slice(0, C));
      cases.push({ R, C, S, gridRows });
    }

    // All walls
    {
      const R = 5; const C = 5; const S = 1;
      const gridRows: string[] = [];
      for (let r = 0; r < R; r += 1) gridRows.push("#####");
      cases.push({ R, C, S, gridRows });
    }

    // 1x1 grid, dot
    {
      cases.push({ R: 1, C: 1, S: 1, gridRows: ["."] });
    }

    // 1x1 grid, wall
    {
      cases.push({ R: 1, C: 1, S: 1, gridRows: ["#"] });
    }

    // Narrow corridor
    {
      const R = 1; const C = 25; const S = 1;
      let row = "";
      for (let c = 0; c < C; c += 1) row += ".";
      cases.push({ R, C, S, gridRows: [row] });
    }

    // Random small/medium cases
    for (let r = 0; r < 55; r += 1) {
      const R: number = randomInt(rng, 5, 25);
      const C: number = randomInt(rng, 5, 25);
      const S: number = randomInt(rng, 1, Math.min(10, Math.max(R, C)));
      const objP: number = rng() * 0.2;
      const gridRows = generateGrid(rng, R, C, objP);
      cases.push({ R, C, S, gridRows });
    }

    // A few larger random cases
    for (let r = 0; r < 5; r += 1) {
      const R: number = randomInt(rng, 50, 100);
      const C: number = randomInt(rng, 50, 100);
      const S: number = randomInt(rng, 1, 15);
      const objP: number = rng() * 0.15;
      const gridRows = generateGrid(rng, R, C, objP);
      cases.push({ R, C, S, gridRows });
    }

    const inputLines: string[] = [String(cases.length)];
    const outputLines: string[] = [];

    for (let i = 0; i < cases.length; i += 1) {
      const tc = cases[i]!;
      inputLines.push(`${String(tc.R)} ${String(tc.C)} ${String(tc.S)}`);
      for (const row of tc.gridRows) inputLines.push(row);
      const answer: number = solve(tc.R, tc.C, tc.S, tc.gridRows as string[]);
      outputLines.push(`Case #${String(i + 1)}: ${String(answer)}`);
    }

    return {
      input: `${inputLines.join("\n")}\n`,
      output: `${outputLines.join("\n")}\n`
    };
  }
};

export default generator;
