import type { CheckerArgs, CheckerResult, ProblemChecker } from "../../../../src/contracts/problem";

const ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:,<.>/?'\"`~\\";

interface CubeCase {
  readonly adjacency: readonly (readonly boolean[])[];
  readonly colorCount: number;
}

type Cell = " " | number;

const FACE_NEIGHBORS: readonly [number, number, number][] = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1]
];

function buildError(message: string): CheckerResult {
  return { kind: "wrong-answer", message, ok: false };
}

function normalizeNewlines(text: string): string {
  return text.replace(/\r\n/g, "\n");
}

function parseInput(input: string): readonly CubeCase[] {
  const lines = normalizeNewlines(input).trim().split("\n");
  const t = Number(lines[0]!);
  const cases: CubeCase[] = [];
  let idx = 1;

  for (let c = 0; c < t; c++) {
    const colorCount = Number(lines[idx]!);
    idx++;
    const adjacency: boolean[][] = Array.from({ length: colorCount }, () =>
      Array.from({ length: colorCount }, () => false)
    );

    for (let color = 0; color < colorCount; color++) {
      adjacency[color]![color] = true;
    }

    for (let row = 1; row < colorCount; row++) {
      const vals = lines[idx]!.split(" ").map(Number);
      idx++;
      for (let col = 0; col < row; col++) {
        if (vals[col] === 1) {
          adjacency[row]![col] = true;
          adjacency[col]![row] = true;
        }
      }
    }

    cases.push({ adjacency, colorCount });
  }

  return cases;
}

interface ParsedCase {
  readonly layers: readonly (readonly string[])[];
  readonly size: number;
}

interface ParsedOutput {
  readonly parsedCases: readonly ParsedCase[];
}

function parseOutput(actualOutput: string, inputCases: readonly CubeCase[]): CheckerResult | ParsedOutput {
  const normalized = normalizeNewlines(actualOutput);
  const lines = normalized.split("\n");

  if (lines.at(-1) === "") {
    lines.pop();
  }

  const parsedCases: ParsedCase[] = [];
  let lineIndex = 0;

  for (let caseIndex = 0; caseIndex < inputCases.length; caseIndex++) {
    const header = lines[lineIndex];

    if (header === undefined) {
      return buildError(`Missing header for case ${caseIndex + 1}.`);
    }

    const headerMatch = header.match(/^Case #(\d+): (\d+)$/);

    if (headerMatch === null) {
      return buildError(`Invalid header format for case ${caseIndex + 1}: "${header}"`);
    }

    if (Number(headerMatch[1]) !== caseIndex + 1) {
      return buildError(`Header case index mismatch: expected Case #${caseIndex + 1}.`);
    }

    const size = Number(headerMatch[2]);
    lineIndex++;

    if (!Number.isInteger(size) || size < 1 || size > 47) {
      return buildError(`Case #${caseIndex + 1} has invalid M=${size}. It must satisfy 1 <= M <= 47.`);
    }

    const layers: string[][] = [];

    for (let layerIdx = 0; layerIdx < size; layerIdx++) {
      const layer: string[] = [];

      for (let rowIdx = 0; rowIdx < size; rowIdx++) {
        const row = lines[lineIndex];
        lineIndex++;

        if (row === undefined) {
          return buildError(`Case #${caseIndex + 1} is missing row ${rowIdx + 1} of layer ${layerIdx + 1}.`);
        }

        if (row.length !== size) {
          return buildError(
            `Case #${caseIndex + 1} row ${rowIdx + 1} of layer ${layerIdx + 1} must have length ${size}, received ${row.length}.`
          );
        }

        layer.push(row);
      }

      layers.push(layer);
    }

    parsedCases.push({ layers, size });
  }

  if (lineIndex !== lines.length) {
    return buildError(`Output contains ${lines.length - lineIndex} extra line(s) after the final case.`);
  }

  return { parsedCases };
}

function validateCase(caseData: CubeCase, parsedCase: ParsedCase, caseIndex: number): CheckerResult {
  const alphabet = ALPHABET.slice(0, caseData.colorCount);
  const allowedChars = new Set([" ", ...alphabet.split("")]);

  // grid[i][j][k] where i=first layer index, j=row, k=column
  // The output is: for each layer i, for each row j, characters k
  const grid: Cell[][][] = Array.from({ length: parsedCase.size }, () =>
    Array.from({ length: parsedCase.size }, () =>
      Array.from({ length: parsedCase.size }, () => " " as Cell)
    )
  );

  const positionsByColor: Array<Array<readonly [number, number, number]>> = Array.from(
    { length: caseData.colorCount },
    () => []
  );

  const touches: boolean[][] = Array.from({ length: caseData.colorCount }, () =>
    Array.from({ length: caseData.colorCount }, () => false)
  );

  // Parse layers: layer index = i (first dim), row = j (second dim), char pos = k (third dim)
  for (let i = 0; i < parsedCase.size; i++) {
    for (let j = 0; j < parsedCase.size; j++) {
      const row = parsedCase.layers[i]![j]!;

      for (let k = 0; k < parsedCase.size; k++) {
        const ch = row[k]!;

        if (!allowedChars.has(ch)) {
          return buildError(`Case #${caseIndex} uses invalid character "${ch}" in the construction.`);
        }

        if (ch === " ") continue;

        const colorIndex = alphabet.indexOf(ch);
        grid[i]![j]![k] = colorIndex;
        positionsByColor[colorIndex]!.push([i, j, k]);
      }
    }
  }

  // Check each color is used at least once
  for (let color = 0; color < caseData.colorCount; color++) {
    if (positionsByColor[color]!.length === 0) {
      return buildError(`Case #${caseIndex} does not place any cube for color ${alphabet[color]}.`);
    }
  }

  // Check connectivity for each color
  for (let color = 0; color < caseData.colorCount; color++) {
    const positions = positionsByColor[color]!;
    const seen = new Set<string>();
    const stack: Array<readonly [number, number, number]> = [positions[0]!];

    while (stack.length > 0) {
      const [x, y, z] = stack.pop()!;
      const key = `${x},${y},${z}`;

      if (seen.has(key)) continue;
      seen.add(key);

      for (const [dx, dy, dz] of FACE_NEIGHBORS) {
        const nx = x + dx;
        const ny = y + dy;
        const nz = z + dz;

        if (nx < 0 || ny < 0 || nz < 0 || nx >= parsedCase.size || ny >= parsedCase.size || nz >= parsedCase.size) {
          continue;
        }

        if (grid[nx]![ny]![nz] === color) {
          stack.push([nx, ny, nz]);
        }
      }
    }

    if (seen.size !== positions.length) {
      return buildError(`Case #${caseIndex} has a disconnected component for color ${alphabet[color]}.`);
    }
  }

  // Check adjacency
  for (let i = 0; i < parsedCase.size; i++) {
    for (let j = 0; j < parsedCase.size; j++) {
      for (let k = 0; k < parsedCase.size; k++) {
        const current = grid[i]![j]![k]!;
        if (current === " ") continue;

        for (const [dx, dy, dz] of FACE_NEIGHBORS) {
          const ni = i + dx;
          const nj = j + dy;
          const nk = k + dz;

          if (ni < 0 || nj < 0 || nk < 0 || ni >= parsedCase.size || nj >= parsedCase.size || nk >= parsedCase.size) {
            continue;
          }

          const neighbor = grid[ni]![nj]![nk]!;
          if (neighbor !== " " && neighbor !== current) {
            touches[current]![neighbor] = true;
          }
        }
      }
    }
  }

  for (let left = 0; left < caseData.colorCount; left++) {
    for (let right = left + 1; right < caseData.colorCount; right++) {
      if (touches[left]![right] !== caseData.adjacency[left]![right]) {
        return buildError(
          `Case #${caseIndex} has incorrect touching status for colors ${alphabet[left]} and ${alphabet[right]}.`
        );
      }
    }
  }

  return { ok: true };
}

const checker: ProblemChecker = {
  check(args: CheckerArgs): CheckerResult {
    const inputCases = parseInput(args.input);
    const parsedOutput = parseOutput(args.actualOutput, inputCases);

    if (!("parsedCases" in parsedOutput)) {
      return parsedOutput;
    }

    for (let caseIndex = 0; caseIndex < inputCases.length; caseIndex++) {
      const result = validateCase(
        inputCases[caseIndex]!,
        parsedOutput.parsedCases[caseIndex]!,
        caseIndex + 1
      );

      if (!result.ok) {
        return result;
      }
    }

    return { ok: true };
  }
};

export default checker;
