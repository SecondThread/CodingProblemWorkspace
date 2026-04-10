import type { CheckerArgs, CheckerResult, ProblemChecker } from "../../../../src/contracts/problem";
import { getGpuCubesAlphabet } from "../solution/core";

interface GpuCubesCase {
  readonly adjacency: readonly (readonly boolean[])[];
  readonly colorCount: number;
}

type Cell = " " | number;

const FACE_NEIGHBORS: readonly [dx: number, dy: number, dz: number][] = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1]
];

function buildError(message: string): CheckerResult {
  return {
    kind: "wrong-answer",
    message,
    ok: false
  };
}

function normalizeNewlines(text: string): string {
  return text.replace(/\r\n/g, "\n");
}

function parseInput(input: string): readonly GpuCubesCase[] {
  const lines: readonly string[] = normalizeNewlines(input).trim().split("\n");
  const testCaseCount: number = Number(lines[0] ?? "0");
  const cases: GpuCubesCase[] = [];
  let lineIndex = 1;

  for (let caseIndex = 0; caseIndex < testCaseCount; caseIndex += 1) {
    const colorCount: number = Number(lines[lineIndex]!);
    lineIndex += 1;
    const adjacency: boolean[][] = Array.from({ length: colorCount }, () =>
      Array.from({ length: colorCount }, () => false)
    );

    for (let color = 0; color < colorCount; color += 1) {
      adjacency[color]![color] = true;
    }

    for (let row = 1; row < colorCount; row += 1) {
      const values: readonly number[] = lines[lineIndex]!.split(" ").map((value) => Number(value));
      lineIndex += 1;

      for (let column = 0; column < row; column += 1) {
        if (values[column] === 1) {
          adjacency[row]![column] = true;
          adjacency[column]![row] = true;
        }
      }
    }

    cases.push({ adjacency, colorCount });
  }

  return cases;
}

function parseOutput(actualOutput: string, inputCases: readonly GpuCubesCase[]): CheckerResult | ParsedOutput {
  const normalized: string = normalizeNewlines(actualOutput);
  const lines: string[] = normalized.split("\n");

  if (lines.at(-1) === "") {
    lines.pop();
  }

  const parsedCases: ParsedCase[] = [];
  let lineIndex = 0;

  for (let caseIndex = 0; caseIndex < inputCases.length; caseIndex += 1) {
    const header: string | undefined = lines[lineIndex];

    if (header === undefined) {
      return buildError(`Missing header for case ${String(caseIndex + 1)}.`);
    }

    const headerMatch: RegExpMatchArray | null = header.match(/^Case #(\d+): (\d+)$/);

    if (headerMatch === null) {
      return buildError(`Invalid header format for case ${String(caseIndex + 1)}: "${header}"`);
    }

    if (Number(headerMatch[1]) !== caseIndex + 1) {
      return buildError(`Header case index mismatch: expected Case #${String(caseIndex + 1)}.`);
    }

    const size: number = Number(headerMatch[2]);
    lineIndex += 1;

    if (!Number.isInteger(size) || size < 1 || size > Math.max(inputCases[caseIndex]!.colorCount, 10)) {
      return buildError(
        `Case #${String(caseIndex + 1)} has invalid M=${String(size)}. It must satisfy 1 <= M <= max(N, 10).`
      );
    }

    const layers: string[][] = [];

    for (let z = 0; z < size; z += 1) {
      const layer: string[] = [];

      for (let x = 0; x < size; x += 1) {
        const row: string | undefined = lines[lineIndex];
        lineIndex += 1;

        if (row === undefined) {
          return buildError(`Case #${String(caseIndex + 1)} is missing row ${String(x + 1)} of layer ${String(z + 1)}.`);
        }

        if (row.length !== size) {
          return buildError(
            `Case #${String(caseIndex + 1)} row ${String(x + 1)} of layer ${String(z + 1)} must have length ${String(size)}, received ${String(row.length)}.`
          );
        }

        layer.push(row);
      }

      layers.push(layer);
    }

    parsedCases.push({ layers, size });
  }

  if (lineIndex !== lines.length) {
    return buildError(`Output contains ${String(lines.length - lineIndex)} extra line(s) after the final case.`);
  }

  return { parsedCases };
}

function validateCase(caseData: GpuCubesCase, parsedCase: ParsedCase, caseIndex: number): CheckerResult {
  const alphabet: string = getGpuCubesAlphabet().slice(0, caseData.colorCount);
  const allowedCharacters: Set<string> = new Set([" ", ...alphabet.split("")]);
  const grid: Cell[][][] = Array.from({ length: parsedCase.size }, () =>
    Array.from({ length: parsedCase.size }, () => Array.from({ length: parsedCase.size }, () => " " as Cell))
  );
  const positionsByColor: Array<Array<readonly [x: number, y: number, z: number]>> = Array.from(
    { length: caseData.colorCount },
    () => []
  );
  const touches: boolean[][] = Array.from({ length: caseData.colorCount }, () =>
    Array.from({ length: caseData.colorCount }, () => false)
  );

  for (let z = 0; z < parsedCase.size; z += 1) {
    for (let x = 0; x < parsedCase.size; x += 1) {
      const row: string = parsedCase.layers[z]![x]!;

      for (let y = 0; y < parsedCase.size; y += 1) {
        const character: string = row[y]!;

        if (!allowedCharacters.has(character)) {
          return buildError(`Case #${String(caseIndex)} uses invalid character "${character}" in the construction.`);
        }

        if (character === " ") {
          continue;
        }

        const colorIndex: number = alphabet.indexOf(character);
        grid[x]![y]![z] = colorIndex;
        positionsByColor[colorIndex]!.push([x, y, z]);
      }
    }
  }

  for (let color = 0; color < caseData.colorCount; color += 1) {
    const positions = positionsByColor[color]!;

    if (positions.length === 0) {
      return buildError(`Case #${String(caseIndex)} does not place any cube for color ${alphabet[color]}.`);
    }

    const seen = new Set<string>();
    const stack: Array<readonly [x: number, y: number, z: number]> = [positions[0]!];

    while (stack.length > 0) {
      const [x, y, z] = stack.pop()!;
      const key: string = `${String(x)},${String(y)},${String(z)}`;

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);

      for (const [dx, dy, dz] of FACE_NEIGHBORS) {
        const nx: number = x + dx;
        const ny: number = y + dy;
        const nz: number = z + dz;

        if (
          nx < 0 ||
          ny < 0 ||
          nz < 0 ||
          nx >= parsedCase.size ||
          ny >= parsedCase.size ||
          nz >= parsedCase.size
        ) {
          continue;
        }

        if (grid[nx]![ny]![nz] === color) {
          stack.push([nx, ny, nz]);
        }
      }
    }

    if (seen.size !== positions.length) {
      return buildError(`Case #${String(caseIndex)} has a disconnected component for color ${alphabet[color]}.`);
    }
  }

  for (let x = 0; x < parsedCase.size; x += 1) {
    for (let y = 0; y < parsedCase.size; y += 1) {
      for (let z = 0; z < parsedCase.size; z += 1) {
        const current: Cell = grid[x]![y]![z]!;

        if (current === " ") {
          continue;
        }

        for (const [dx, dy, dz] of FACE_NEIGHBORS) {
          const nx: number = x + dx;
          const ny: number = y + dy;
          const nz: number = z + dz;

          if (
            nx < 0 ||
            ny < 0 ||
            nz < 0 ||
            nx >= parsedCase.size ||
            ny >= parsedCase.size ||
            nz >= parsedCase.size
          ) {
            continue;
          }

          const neighbor: Cell = grid[nx]![ny]![nz]!;

          if (neighbor !== " " && neighbor !== current) {
            touches[current]![neighbor] = true;
          }
        }
      }
    }
  }

  for (let left = 0; left < caseData.colorCount; left += 1) {
    for (let right = left + 1; right < caseData.colorCount; right += 1) {
      if (touches[left]![right] !== caseData.adjacency[left]![right]) {
        return buildError(
          `Case #${String(caseIndex)} has incorrect touching status for colors ${alphabet[left]} and ${alphabet[right]}.`
        );
      }
    }
  }

  return { ok: true };
}

interface ParsedCase {
  readonly layers: readonly (readonly string[])[];
  readonly size: number;
}

interface ParsedOutput {
  readonly parsedCases: readonly ParsedCase[];
}

const checker: ProblemChecker = {
  check(args: CheckerArgs): CheckerResult {
    const inputCases: readonly GpuCubesCase[] = parseInput(args.input);
    const parsedOutput = parseOutput(args.actualOutput, inputCases);

    if (!("parsedCases" in parsedOutput)) {
      return parsedOutput;
    }

    for (let caseIndex = 0; caseIndex < inputCases.length; caseIndex += 1) {
      const result: CheckerResult = validateCase(
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
