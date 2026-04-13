import type { ProblemValidator } from "../../../../src/contracts/problem";

function parseIntegerToken(token: string, label: string): number {
  if (!/^-?\d+$/.test(token)) {
    throw new Error(`Expected ${label} to be an integer, received: ${token}`);
  }
  return Number(token);
}

class UnionFind {
  private readonly par: Int32Array;
  private readonly sz: Int32Array;

  constructor(n: number) {
    this.par = new Int32Array(n);
    this.sz = new Int32Array(n).fill(1);
    for (let i = 0; i < n; i += 1) this.par[i] = i;
  }

  find(x: number): number {
    let r = x;
    while (this.par[r] !== r) r = this.par[r]!;
    let c = x;
    while (c !== r) {
      const next = this.par[c]!;
      this.par[c] = r;
      c = next;
    }
    return r;
  }

  unite(x: number, y: number): boolean {
    let rx = this.find(x);
    let ry = this.find(y);
    if (rx === ry) return false;
    if (this.sz[rx]! < this.sz[ry]!) {
      const t = rx;
      rx = ry;
      ry = t;
    }
    this.par[ry] = rx;
    this.sz[rx] = this.sz[rx]! + this.sz[ry]!;
    return true;
  }
}

const validator: ProblemValidator = {
  validate(input: string): void {
    const trimmedInput: string = input.trim();
    if (trimmedInput.length === 0) {
      throw new Error("Input must not be empty.");
    }

    const lines: readonly string[] = trimmedInput.split("\n").map((line) => line.trim());
    const t: number = parseIntegerToken(lines[0] ?? "", "T");

    if (t < 1 || t > 45) {
      throw new Error(`T must be between 1 and 45, received: ${String(t)}`);
    }

    let lineIndex = 1;

    for (let caseNum = 1; caseNum <= t; caseNum += 1) {
      if (lineIndex >= lines.length) {
        throw new Error(`Missing N line for case ${String(caseNum)}.`);
      }

      const n: number = parseIntegerToken(lines[lineIndex]!.trim(), `N for case ${String(caseNum)}`);
      lineIndex += 1;

      if (n < 1 || n > 100000) {
        throw new Error(
          `N for case ${String(caseNum)} must be between 1 and 10^5, received: ${String(n)}`
        );
      }

      const uf = new UnionFind(n + 1);

      for (let e = 0; e < n - 1; e += 1) {
        if (lineIndex >= lines.length) {
          throw new Error(`Missing edge ${String(e + 1)} for case ${String(caseNum)}.`);
        }

        const tokens: readonly string[] = lines[lineIndex]!.trim().split(/\s+/);
        lineIndex += 1;

        if (tokens.length !== 2) {
          throw new Error(
            `Case ${String(caseNum)}, edge ${String(e + 1)}: expected 2 integers, received ${String(tokens.length)} tokens.`
          );
        }

        const u: number = parseIntegerToken(tokens[0]!, `u for case ${String(caseNum)} edge ${String(e + 1)}`);
        const v: number = parseIntegerToken(tokens[1]!, `v for case ${String(caseNum)} edge ${String(e + 1)}`);

        if (u < 1 || u > n) {
          throw new Error(
            `Case ${String(caseNum)}, edge ${String(e + 1)}: u must be in [1, ${String(n)}], received: ${String(u)}`
          );
        }

        if (v < 1 || v > n) {
          throw new Error(
            `Case ${String(caseNum)}, edge ${String(e + 1)}: v must be in [1, ${String(n)}], received: ${String(v)}`
          );
        }

        if (u === v) {
          throw new Error(
            `Case ${String(caseNum)}, edge ${String(e + 1)}: self-loop detected (u = v = ${String(u)}).`
          );
        }

        if (!uf.unite(u, v)) {
          throw new Error(
            `Case ${String(caseNum)}, edge ${String(e + 1)}: adding edge (${String(u)}, ${String(v)}) creates a cycle.`
          );
        }
      }
    }
  }
};

export default validator;
