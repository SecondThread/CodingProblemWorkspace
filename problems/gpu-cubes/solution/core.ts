export interface GpuCubesCase {
  readonly adjacency: readonly (readonly boolean[])[];
  readonly colorCount: number;
}

const ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function parseGpuCubesCases(input: string): readonly GpuCubesCase[] {
  const lines: readonly string[] = input
    .replace(/\r\n/g, "\n")
    .trim()
    .split("\n");
  const testCaseCount: number = Number(lines[0]!);
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
      const rowValues: readonly number[] = lines[lineIndex]!.split(" ").map((value) => Number(value));
      lineIndex += 1;

      for (let column = 0; column < row; column += 1) {
        if (rowValues[column] === 1) {
          adjacency[row]![column] = true;
          adjacency[column]![row] = true;
        }
      }
    }

    cases.push({
      adjacency,
      colorCount
    });
  }

  return cases;
}

export function buildGpuCubesOutput(input: string): string {
  const cases: readonly GpuCubesCase[] = parseGpuCubesCases(input);
  const outputLines: string[] = [];

  for (let caseIndex = 0; caseIndex < cases.length; caseIndex += 1) {
    const caseData: GpuCubesCase = cases[caseIndex]!;
    const volumeLines: readonly string[] = buildSingleCaseVolume(caseData);
    outputLines.push(`Case #${String(caseIndex + 1)}: ${String(Math.max(caseData.colorCount, 7))}`);
    outputLines.push(...volumeLines);
  }

  return `${outputLines.join("\n")}\n`;
}

function buildSingleCaseVolume(caseData: GpuCubesCase): readonly string[] {
  const size: number = Math.max(caseData.colorCount, 7);
  const halfColorCount: number = Math.floor(caseData.colorCount / 2);
  const volume: string[][][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => Array.from({ length: size }, () => " "))
  );

  for (let color = 0; color < halfColorCount; color += 1) {
    const x: number = color * 2;

    for (let y = 0; y < caseData.colorCount; y += 1) {
      volume[x]![y]![0] = ALPHABET[color]!;
    }
  }

  for (let color = 0; color < halfColorCount; color += 1) {
    const y: number = color * 2;

    for (let x = 0; x < caseData.colorCount; x += 1) {
      volume[x]![y]![2] = ALPHABET[color]!;
    }
  }

  for (let color = halfColorCount; color < caseData.colorCount; color += 1) {
    const x: number = (color - halfColorCount) * 2;

    for (let y = 0; y < caseData.colorCount; y += 1) {
      volume[x]![y]![4] = ALPHABET[color]!;
    }
  }

  for (let color = halfColorCount; color < caseData.colorCount; color += 1) {
    const y: number = (color - halfColorCount) * 2;

    for (let x = 0; x < caseData.colorCount; x += 1) {
      volume[x]![y]![6] = ALPHABET[color]!;
    }
  }

  for (let left = 0; left < caseData.colorCount; left += 1) {
    for (let right = 0; right < caseData.colorCount; right += 1) {
      if (!caseData.adjacency[left]![right]) {
        continue;
      }

      if (left < halfColorCount && right < halfColorCount) {
        volume[left * 2]![right * 2]![1] = ALPHABET[right]!;
      } else if ((left < halfColorCount) !== (right < halfColorCount)) {
        if (left >= halfColorCount) {
          volume[(left - halfColorCount) * 2]![right * 2]![3] = ALPHABET[right]!;
        }
      } else {
        volume[(left - halfColorCount) * 2]![(right - halfColorCount) * 2]![5] = ALPHABET[right]!;
      }
    }
  }

  const lines: string[] = [];

  for (let z = 0; z < size; z += 1) {
    for (let x = 0; x < size; x += 1) {
      lines.push(volume[x]!.map((column) => column[z]!).join(""));
    }
  }

  return lines;
}

export function getGpuCubesAlphabet(): string {
  return ALPHABET;
}

