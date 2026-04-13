import type { ProblemValidator } from "../../../../src/contracts/problem";

const validator: ProblemValidator = {
  validate(input: string): void {
    const lines: readonly string[] = input.trim().split("\n").map((l) => l.trim());
    const t: number = Number(lines[0]!);

    if (!Number.isInteger(t) || t < 1 || t > 115) {
      throw new Error(`T must be between 1 and 115, got ${String(t)}`);
    }

    let lineIndex: number = 1;
    for (let c = 1; c <= t; c += 1) {
      if (lineIndex >= lines.length) throw new Error(`Missing N Q L for case ${String(c)}`);
      const parts = lines[lineIndex]!.split(/\s+/);
      lineIndex += 1;
      if (parts.length !== 3) {
        throw new Error(`Case ${String(c)}: expected N Q L on one line, got ${String(parts.length)} values`);
      }
      const n: number = Number(parts[0]!);
      const q: number = Number(parts[1]!);
      const l: number = Number(parts[2]!);

      if (!Number.isInteger(n) || n < 1 || n > 200000) {
        throw new Error(`Case ${String(c)}: N must be between 1 and 200000, got ${String(n)}`);
      }
      if (!Number.isInteger(q) || q < 1 || q > 200000) {
        throw new Error(`Case ${String(c)}: Q must be between 1 and 200000, got ${String(q)}`);
      }
      if (!Number.isInteger(l) || l < 3) {
        throw new Error(`Case ${String(c)}: L must be at least 3, got ${String(l)}`);
      }

      if (lineIndex >= lines.length) throw new Error(`Missing robot positions for case ${String(c)}`);
      const posParts = lines[lineIndex]!.split(/\s+/);
      lineIndex += 1;
      if (posParts.length !== n) {
        throw new Error(`Case ${String(c)}: expected ${String(n)} robot positions, got ${String(posParts.length)}`);
      }
      const positions = new Set<number>();
      for (let i = 0; i < n; i++) {
        const x = Number(posParts[i]!);
        if (!Number.isInteger(x) || x <= 1 || x >= l) {
          throw new Error(`Case ${String(c)}: robot position must be in (1, ${String(l)}), got ${String(x)}`);
        }
        if (positions.has(x)) {
          throw new Error(`Case ${String(c)}: duplicate robot position ${String(x)}`);
        }
        positions.add(x);
      }

      for (let i = 0; i < q; i++) {
        if (lineIndex >= lines.length) throw new Error(`Case ${String(c)}: missing query ${String(i + 1)}`);
        const qParts = lines[lineIndex]!.split(/\s+/);
        lineIndex += 1;
        const type = Number(qParts[0]!);
        if (type === 1) {
          if (qParts.length !== 2) {
            throw new Error(`Case ${String(c)}, query ${String(i + 1)}: type 1 expects 1 argument`);
          }
          const x = Number(qParts[1]!);
          if (!Number.isInteger(x) || x <= 1 || x >= l) {
            throw new Error(`Case ${String(c)}, query ${String(i + 1)}: wall position must be in (1, ${String(l)}), got ${String(x)}`);
          }
        } else if (type === 2) {
          if (qParts.length !== 3) {
            throw new Error(`Case ${String(c)}, query ${String(i + 1)}: type 2 expects 2 arguments`);
          }
          const r = Number(qParts[1]!);
          const s = Number(qParts[2]!);
          if (!Number.isInteger(r) || r < 1 || r > n) {
            throw new Error(`Case ${String(c)}, query ${String(i + 1)}: robot index must be in [1, ${String(n)}], got ${String(r)}`);
          }
          if (!Number.isInteger(s) || s < 1) {
            throw new Error(`Case ${String(c)}, query ${String(i + 1)}: time must be >= 1, got ${String(s)}`);
          }
        } else {
          throw new Error(`Case ${String(c)}, query ${String(i + 1)}: unknown query type ${String(type)}`);
        }
      }
    }
  }
};

export default validator;
