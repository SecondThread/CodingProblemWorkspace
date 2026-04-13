import type { ProblemSolution } from "../../../../src/contracts/problem";

const solution: ProblemSolution = (input: string): string => {
  const lines: readonly string[] = input.trim().split("\n");
  const t: number = Number(lines[0]!);
  const outputLines: string[] = [];
  let lineIndex: number = 1;

  for (let test = 1; test <= t; test += 1) {
    const parts: string[] = lines[lineIndex]!.trim().split(/\s+/);
    lineIndex += 1;
    const N: number = Number(parts[0]!);
    const K: number = Number(parts[1]!);

    // component[i][j] holds the component id for row i, col j (0-indexed)
    const component: number[][] = [];
    for (let i = 0; i < N; i += 1) {
      component.push(new Array<number>(i + 1).fill(0));
    }

    // greedy_row_major: fills a sub-triangle starting at (startRow, startCol) with numRows rows
    // startRow and startCol are 1-indexed in the C++ code; we convert to 0-indexed internally
    const greedyRowMajor = (
      startRow: number,
      startCol: number,
      numRows: number,
      componentStart: number,
      firstComponentLeft: number
    ): number => {
      let cs: number = componentStart;
      let componentLeft: number = firstComponentLeft;
      for (let i = startRow; i <= startRow + numRows - 1; i += 1) {
        for (let j = startCol; j <= startCol + (i - startRow); j += 1) {
          component[i - 1]![j - 1] = cs;
          componentLeft -= 1;
          if (componentLeft === 0) {
            componentLeft = K;
            cs += 1;
          }
        }
      }
      return cs + (componentLeft === K ? 0 : 1);
    };

    const solve = (row: number, componentStart: number): number => {
      if (row <= K) {
        return greedyRowMajor(1, 1, row, componentStart, K);
      }
      if (K % 2 === 1) {
        let cs: number = componentStart;
        const startRow: number = row - K + 1;
        for (let j = 1; j < startRow; j += 1) {
          for (let i = startRow; i <= row; i += 1) {
            component[i - 1]![j - 1] = cs;
          }
          cs += 1;
        }
        cs = greedyRowMajor(startRow, startRow, K, cs, K);
        cs = solve(row - K, cs);
        return cs;
      }

      // K % 2 === 0
      let cs: number = componentStart;
      const startRow: number = Math.max(1, row - 2 * K + 1);
      cs = greedyRowMajor(startRow, startRow, K, cs, K);
      cs = greedyRowMajor(startRow + K, startRow + K, Math.min(K, row - K), cs - 1, Math.floor(K / 2));
      for (let j = 1; j < startRow; j += 1) {
        for (let i = startRow; i < startRow + K; i += 1) {
          component[i - 1]![j - 1] = cs;
        }
        cs += 1;
        for (let i = startRow + K; i <= row; i += 1) {
          component[i - 1]![j - 1] = cs;
        }
        cs += 1;
      }
      for (let i = startRow + K; i <= row; i += 1) {
        for (let j = startRow; j < startRow + K; j += 1) {
          component[i - 1]![j - 1] = cs;
        }
        cs += 1;
      }
      // swap two cells (C++ uses direct 0-indexed array access here)
      const sr1: number = startRow + K - 2;
      const sc1: number = startRow + Math.floor(K / 2) - 1;
      const sr2: number = startRow + K - 1;
      const sc2: number = startRow + K - 2;
      const tmp: number = component[sr1]![sc1]!;
      component[sr1]![sc1] = component[sr2]![sc2]!;
      component[sr2]![sc2] = tmp;

      cs = solve(row - 2 * K, cs);
      return cs;
    };

    let numComponents: number = 0;
    if (K !== 2) {
      numComponents = solve(N, 0);
    } else {
      for (let i = 1; i <= N; i += 1) {
        for (let j = 1; j <= i; j += 2) {
          component[i - 1]![j - 1] = numComponents;
          if (j + 1 <= i) {
            component[i - 1]![j] = numComponents;
          }
          numComponents += 1;
        }
      }
    }

    // Graph coloring phase
    const adj: Set<number>[] = [];
    for (let i = 0; i < numComponents; i += 1) {
      adj.push(new Set<number>());
    }

    const dx: number[] = [0, -1, 0, 1];
    const dy: number[] = [-1, 0, 1, 0];
    for (let i = 0; i < N; i += 1) {
      for (let j = 0; j <= i; j += 1) {
        for (let dir = 0; dir < 4; dir += 1) {
          const x: number = i + dx[dir]!;
          const y: number = j + dy[dir]!;
          if (x >= 0 && x < N && y >= 0 && y <= x && component[i]![j]! !== component[x]![y]!) {
            adj[component[i]![j]!]!.add(component[x]![y]!);
          }
        }
      }
    }

    // Smallest-degree-last ordering
    const componentMap: (number | string)[] = new Array(numComponents).fill(0);
    const order: number[] = [];

    // Make a copy of adj sizes for greedy ordering
    const adjCopy: Set<number>[] = adj.map((s) => new Set(s));

    while (true) {
      let chooseComponent: number = -1;
      for (let i = 0; i < numComponents; i += 1) {
        if (componentMap[i] === 0) {
          if (chooseComponent === -1 || adjCopy[i]!.size < adjCopy[chooseComponent]!.size) {
            chooseComponent = i;
          }
        }
      }
      if (chooseComponent === -1) break;
      order.push(chooseComponent);
      componentMap[chooseComponent] = 1;
      for (const x of adjCopy[chooseComponent]!) {
        adjCopy[x]!.delete(chooseComponent);
      }
    }

    order.reverse();
    for (const u of order) {
      const neighbourColors: Set<string> = new Set<string>();
      for (const v of adj[u]!) {
        const c = componentMap[v];
        if (typeof c === "string") {
          neighbourColors.add(c);
        }
      }
      for (let ci = 0; ci < 6; ci += 1) {
        const c: string = String.fromCharCode(97 + ci); // 'a' to 'f'
        if (!neighbourColors.has(c)) {
          componentMap[u] = c;
          break;
        }
      }
    }

    outputLines.push(`Case #${String(test)}: ${String(numComponents)}`);
    for (let i = 0; i < N; i += 1) {
      let row: string = "";
      for (let j = 0; j <= i; j += 1) {
        row += componentMap[component[i]![j]!] as string;
      }
      outputLines.push(row);
    }
  }

  return `${outputLines.join("\n")}\n`;
};

export default solution;
