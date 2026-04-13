import type { ProblemValidator } from "../../../../src/contracts/problem";

function parseIntegerToken(token: string, label: string): number {
  if (!/^-?\d+$/.test(token)) {
    throw new Error(`Expected ${label} to be an integer, received: ${token}`);
  }
  return Number(token);
}

const validator: ProblemValidator = {
  validate(input: string): void {
    const trimmedInput: string = input.trim();

    if (trimmedInput.length === 0) {
      throw new Error("Input must not be empty.");
    }

    const lines: readonly string[] = trimmedInput.split("\n").map((line) => line.trim());
    const testCaseCount: number = parseIntegerToken(lines[0] ?? "", "test case count");

    if (testCaseCount < 1 || testCaseCount > 100) {
      throw new Error(
        `Test case count must be between 1 and 100, received: ${String(testCaseCount)}`
      );
    }

    let lineIndex: number = 1;

    for (let caseNum = 1; caseNum <= testCaseCount; caseNum += 1) {
      if (lineIndex >= lines.length) {
        throw new Error(`Missing header line for case ${String(caseNum)}.`);
      }

      const headerTokens: readonly string[] = (lines[lineIndex] ?? "")
        .split(/\s+/)
        .filter((t) => t.length > 0);
      lineIndex += 1;

      if (headerTokens.length !== 2) {
        throw new Error(
          `Case ${String(caseNum)}: expected 2 integers (N M), but received ${String(headerTokens.length)} tokens.`
        );
      }

      const n: number = parseIntegerToken(headerTokens[0] ?? "", `N for case ${String(caseNum)}`);
      const m: number = parseIntegerToken(headerTokens[1] ?? "", `M for case ${String(caseNum)}`);

      if (n < 3 || n > 100) {
        throw new Error(
          `N for case ${String(caseNum)} must be between 3 and 100, received: ${String(n)}`
        );
      }

      if (m < n - 1) {
        throw new Error(
          `M for case ${String(caseNum)} must be at least N-1 (${String(n - 1)}) for a connected graph, received: ${String(m)}`
        );
      }

      // Read C values
      if (lineIndex >= lines.length) {
        throw new Error(`Missing C values line for case ${String(caseNum)}.`);
      }

      const cTokens: readonly string[] = (lines[lineIndex] ?? "")
        .split(/\s+/)
        .filter((t) => t.length > 0);
      lineIndex += 1;

      if (cTokens.length !== n) {
        throw new Error(
          `Case ${String(caseNum)}: expected ${String(n)} C values, but received ${String(cTokens.length)}.`
        );
      }

      for (let i = 0; i < n; i += 1) {
        const c: number = parseIntegerToken(
          cTokens[i] ?? "",
          `C[${String(i)}] for case ${String(caseNum)}`
        );
        if (c < 0 || c >= n) {
          throw new Error(
            `C[${String(i)}] for case ${String(caseNum)} must be in [0, ${String(n - 1)}], received: ${String(c)}`
          );
        }
      }

      // Read edges
      const adj: number[][] = Array.from({ length: n }, () => []);
      const edgeSet: Set<string> = new Set();

      for (let i = 0; i < m; i += 1) {
        if (lineIndex >= lines.length) {
          throw new Error(
            `Missing edge ${String(i + 1)} for case ${String(caseNum)}.`
          );
        }

        const edgeTokens: readonly string[] = (lines[lineIndex] ?? "")
          .split(/\s+/)
          .filter((t) => t.length > 0);
        lineIndex += 1;

        if (edgeTokens.length !== 2) {
          throw new Error(
            `Case ${String(caseNum)}, edge ${String(i + 1)}: expected 2 integers, received ${String(edgeTokens.length)}.`
          );
        }

        const u: number = parseIntegerToken(
          edgeTokens[0] ?? "",
          `edge ${String(i + 1)} u for case ${String(caseNum)}`
        );
        const v: number = parseIntegerToken(
          edgeTokens[1] ?? "",
          `edge ${String(i + 1)} v for case ${String(caseNum)}`
        );

        if (u < 1 || u > n || v < 1 || v > n) {
          throw new Error(
            `Case ${String(caseNum)}, edge ${String(i + 1)}: vertices must be in [1, ${String(n)}], received: ${String(u)} ${String(v)}`
          );
        }

        if (u === v) {
          throw new Error(
            `Case ${String(caseNum)}, edge ${String(i + 1)}: self-loop detected (${String(u)} ${String(v)}).`
          );
        }

        const edgeKey: string = `${Math.min(u, v)},${Math.max(u, v)}`;
        if (edgeSet.has(edgeKey)) {
          throw new Error(
            `Case ${String(caseNum)}, edge ${String(i + 1)}: duplicate edge (${String(u)} ${String(v)}).`
          );
        }
        edgeSet.add(edgeKey);

        adj[u - 1].push(v - 1);
        adj[v - 1].push(u - 1);
      }

      // Check connectivity via BFS
      const visited: boolean[] = new Array(n).fill(false);
      const queue: number[] = [0];
      visited[0] = true;
      let visitCount = 1;
      let qi = 0;

      while (qi < queue.length) {
        const cur: number = queue[qi++];
        for (const nb of adj[cur]) {
          if (!visited[nb]) {
            visited[nb] = true;
            visitCount += 1;
            queue.push(nb);
          }
        }
      }

      if (visitCount !== n) {
        throw new Error(
          `Case ${String(caseNum)}: graph is not connected (reached ${String(visitCount)} of ${String(n)} nodes).`
        );
      }

      // Check cactus property: each edge belongs to at most one simple cycle.
      // A graph is a cactus iff it's connected and M <= 2*(N-1) - (N-1) + N - 1,
      // more precisely: every biconnected component is either a single edge or a simple cycle.
      // Use DFS to find biconnected components and verify each is an edge or cycle.
      const disc: number[] = new Array(n).fill(-1);
      const low: number[] = new Array(n).fill(-1);
      let timer = 0;
      const edgeStack: Array<[number, number]> = [];
      let isCactus = true;

      function dfsBCC(u: number, parent: number): void {
        disc[u] = low[u] = timer++;
        for (const v of adj[u]) {
          if (disc[v] === -1) {
            edgeStack.push([u, v]);
            dfsBCC(v, u);
            low[u] = Math.min(low[u], low[v]);

            if (low[v] >= disc[u]) {
              // Found a biconnected component
              const component: Set<number> = new Set();
              let edgeCount = 0;
              while (true) {
                const e = edgeStack.pop()!;
                component.add(e[0]);
                component.add(e[1]);
                edgeCount++;
                if (e[0] === u && e[1] === v) break;
              }
              // BCC is valid if it's a single edge (edgeCount=1) or a simple cycle (edgeCount = nodeCount)
              if (edgeCount !== 1 && edgeCount !== component.size) {
                isCactus = false;
              }
            }
          } else if (v !== parent && disc[v] < disc[u]) {
            edgeStack.push([u, v]);
            low[u] = Math.min(low[u], disc[v]);
          }
        }
      }

      dfsBCC(0, -1);

      if (!isCactus) {
        throw new Error(
          `Case ${String(caseNum)}: graph is not a cactus (some biconnected component has edges that belong to multiple cycles).`
        );
      }
    }
  }
};

export default validator;
