import type { ProblemValidator } from "../../../../src/contracts/problem";

const validator: ProblemValidator = {
  validate(input: string): void {
    const lines: readonly string[] = input.trim().split("\n").map((l) => l.trim());
    const t: number = Number(lines[0]!);

    if (!Number.isInteger(t) || t < 1 || t > 65) {
      throw new Error(`T must be between 1 and 65, got ${String(t)}`);
    }

    let lineIndex: number = 1;
    for (let c = 1; c <= t; c++) {
      if (lineIndex >= lines.length) throw new Error(`Missing N M for case ${String(c)}`);
      const parts = lines[lineIndex]!.split(/\s+/);
      if (parts.length !== 2) {
        throw new Error(`Case ${String(c)}: expected "N M" on line ${String(lineIndex + 1)}`);
      }
      const n = Number(parts[0]!);
      const m = Number(parts[1]!);
      lineIndex++;

      if (!Number.isInteger(n) || n < 2 || n > 200000) {
        throw new Error(`Case ${String(c)}: N must be between 2 and 200000, got ${String(n)}`);
      }
      if (!Number.isInteger(m) || m < 1 || m > 200000) {
        throw new Error(`Case ${String(c)}: M must be between 1 and 200000, got ${String(m)}`);
      }

      const edgeSet = new Set<string>();
      for (let e = 1; e <= m; e++) {
        if (lineIndex >= lines.length) {
          throw new Error(`Case ${String(c)}: missing edge ${String(e)}`);
        }
        const edgeParts = lines[lineIndex]!.split(/\s+/);
        if (edgeParts.length !== 2) {
          throw new Error(`Case ${String(c)}, edge ${String(e)}: expected "A B"`);
        }
        const a = Number(edgeParts[0]!);
        const b = Number(edgeParts[1]!);
        lineIndex++;

        if (!Number.isInteger(a) || a < 1 || a > n) {
          throw new Error(`Case ${String(c)}, edge ${String(e)}: A must be between 1 and ${String(n)}, got ${String(a)}`);
        }
        if (!Number.isInteger(b) || b < 1 || b > n) {
          throw new Error(`Case ${String(c)}, edge ${String(e)}: B must be between 1 and ${String(n)}, got ${String(b)}`);
        }
        if (a === b) {
          throw new Error(`Case ${String(c)}, edge ${String(e)}: self-loop not allowed (A=B=${String(a)})`);
        }
        const lo = Math.min(a, b);
        const hi = Math.max(a, b);
        const key = `${lo},${hi}`;
        if (edgeSet.has(key)) {
          throw new Error(`Case ${String(c)}, edge ${String(e)}: duplicate edge (${String(lo)}, ${String(hi)})`);
        }
        edgeSet.add(key);
      }
    }
  }
};

export default validator;
