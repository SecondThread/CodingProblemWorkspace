import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { ProblemSolution } from "../../../../src/contracts/problem";

const TOTAL_SUBSTRING_LENGTH = 2025;

function lcs(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  let prev = new Int16Array(n + 1);
  let curr = new Int16Array(n + 1);

  for (let i = 1; i <= m; i += 1) {
    const c = s1.charCodeAt(i - 1);
    for (let j = 1; j <= n; j += 1) {
      if (c === s2.charCodeAt(j - 1)) {
        curr[j] = (prev[j - 1] as number) + 1;
      } else {
        const a = prev[j] as number;
        const b = curr[j - 1] as number;
        curr[j] = a > b ? a : b;
      }
    }
    const tmp = prev;
    prev = curr;
    curr = tmp;
    curr.fill(0);
  }

  return prev[n] as number;
}

function lcsFast(s1: string, s2: string, size: number): number {
  const m = s1.length < size ? s1.length : size;
  const n = s2.length < size ? s2.length : size;
  let prev = new Int16Array(n + 1);
  let curr = new Int16Array(n + 1);

  for (let i = 1; i <= m; i += 1) {
    const c = s1.charCodeAt(i - 1);
    for (let j = 1; j <= n; j += 1) {
      if (c === s2.charCodeAt(j - 1)) {
        curr[j] = (prev[j - 1] as number) + 1;
      } else {
        const a = prev[j] as number;
        const b = curr[j - 1] as number;
        curr[j] = a > b ? a : b;
      }
    }
    const tmp = prev;
    prev = curr;
    curr = tmp;
    curr.fill(0);
  }

  return prev[n] as number;
}

// Compute character frequency overlap score (fast pre-filter)
function charFreqScore(inputFreq: Int32Array, extracted: string, size: number): number {
  const limit = Math.min(extracted.length, size);
  const freq = new Int32Array(128);
  for (let i = 0; i < limit; i += 1) {
    freq[extracted.charCodeAt(i)] += 1;
  }
  // Count min overlap
  let score = 0;
  for (let c = 0; c < 128; c += 1) {
    score += Math.min(inputFreq[c] as number, freq[c] as number);
  }
  return score;
}

function solveCase(
  possibleStartLocations: readonly number[],
  multiplesOf3or5: readonly number[],
  preExtracted: readonly string[],
  inputString: string,
  problemText: string
): string {
  const numLocations = possibleStartLocations.length;
  const preExtractSize = preExtracted[0]!.length;

  // Compute input character frequency for pre-filter
  const inputFreq = new Int32Array(128);
  const inputLenForFreq = Math.min(inputString.length, preExtractSize);
  for (let i = 0; i < inputLenForFreq; i += 1) {
    inputFreq[inputString.charCodeAt(i)] += 1;
  }

  // Pass 0: character frequency pre-filter (very fast)
  const freqScores = new Int16Array(numLocations);
  for (let idx = 0; idx < numLocations; idx += 1) {
    freqScores[idx] = charFreqScore(inputFreq, preExtracted[idx]!, preExtractSize);
  }
  let maxFreqScore = 0;
  for (let i = 0; i < numLocations; i += 1) {
    if (freqScores[i]! > maxFreqScore) maxFreqScore = freqScores[i]!;
  }
  // Keep only those within 6 of max freq score
  const freqThreshold = maxFreqScore - 6;

  // Pass 1: fast LCS filter (size 30) on freq-filtered candidates
  const fastSize = 30;
  const fastScores = new Int16Array(numLocations);
  fastScores.fill(-1);

  for (let idx = 0; idx < numLocations; idx += 1) {
    if (freqScores[idx]! < freqThreshold) continue;
    fastScores[idx] = lcsFast(inputString, preExtracted[idx]!, fastSize);
  }

  let maxFastScore = 0;
  for (let i = 0; i < numLocations; i += 1) {
    if (fastScores[i]! > maxFastScore) maxFastScore = fastScores[i]!;
  }

  // Pass 2: medium LCS filter (size 100)
  const mediumSize = 100;
  const mediumScores = new Int16Array(numLocations);
  mediumScores.fill(-1);

  for (let idx = 0; idx < numLocations; idx += 1) {
    if (fastScores[idx]! < 0 || maxFastScore - fastScores[idx]! > 5) continue;

    let extracted = "";
    for (let i = 0; i < mediumSize && i < multiplesOf3or5.length; i += 1) {
      const index = possibleStartLocations[idx]! + multiplesOf3or5[i]!;
      if (index < problemText.length) {
        extracted += problemText[index]!;
      }
    }
    mediumScores[idx] = lcsFast(inputString, extracted, mediumSize);
  }

  let maxMediumScore = 0;
  for (let i = 0; i < numLocations; i += 1) {
    if (mediumScores[i]! > maxMediumScore) maxMediumScore = mediumScores[i]!;
  }

  // Count medium pass candidates
  let mediumPassCount = 0;
  for (let i = 0; i < numLocations; i += 1) {
    if (mediumScores[i]! >= 0 && maxMediumScore - mediumScores[i]! <= 5) {
      mediumPassCount += 1;
    }
  }

  if (mediumPassCount > 15) {
    return "SKIP";
  }

  // Pass 3: full LCS
  const finalScores: Array<{ location: number; score: number }> = [];
  let bestScore = -1;
  let bestLocation = -1;

  for (let idx = 0; idx < numLocations; idx += 1) {
    if (fastScores[idx]! < 0 || maxFastScore - fastScores[idx]! > 5) continue;
    if (mediumScores[idx]! < 0 || maxMediumScore - mediumScores[idx]! > 10) continue;

    let extracted = "";
    for (let i = 0; i < multiplesOf3or5.length; i += 1) {
      const index = possibleStartLocations[idx]! + multiplesOf3or5[i]!;
      if (index < problemText.length) {
        extracted += problemText[index]!;
      }
    }

    const lcsLength = lcs(inputString, extracted);
    finalScores.push({ location: possibleStartLocations[idx]!, score: lcsLength });
    if (lcsLength > bestScore) {
      bestScore = lcsLength;
      bestLocation = possibleStartLocations[idx]!;
    }
  }

  // Check ambiguity
  let candidatesWithin4 = 0;
  for (const fs of finalScores) {
    if (bestScore - fs.score <= 4) {
      candidatesWithin4 += 1;
    }
  }

  if (candidatesWithin4 > 1) {
    return "SKIP";
  }

  if (bestLocation !== -1) {
    const endIndex = Math.min(bestLocation + TOTAL_SUBSTRING_LENGTH, problemText.length);
    return problemText.substring(bestLocation, endIndex);
  }

  return "SKIP";
}

const solution: ProblemSolution = (input: string): string => {
  const problemText = readFileSync(join(process.cwd(), "public", "ProblemText.txt"), "utf-8");

  // Compute multiples of 3 or 5 in [0, 2025)
  const multiplesOf3or5: number[] = [];
  for (let i = 0; i < TOTAL_SUBSTRING_LENGTH; i += 1) {
    if (i % 3 === 0 || i % 5 === 0) {
      multiplesOf3or5.push(i);
    }
  }

  // Find all valid start locations (word boundaries)
  const possibleStartLocations: number[] = [];
  for (let i = 1; i < problemText.length - TOTAL_SUBSTRING_LENGTH; i += 1) {
    if (problemText[i - 1] === " " && problemText[i] !== " ") {
      possibleStartLocations.push(i);
    }
  }

  // Pre-extract chars for fast pass (size 30) for all locations
  const extractSize = 30;
  const preExtracted: string[] = new Array(possibleStartLocations.length);
  for (let idx = 0; idx < possibleStartLocations.length; idx += 1) {
    let s = "";
    for (let i = 0; i < extractSize && i < multiplesOf3or5.length; i += 1) {
      const index = possibleStartLocations[idx]! + multiplesOf3or5[i]!;
      if (index < problemText.length) {
        s += problemText[index]!;
      }
    }
    preExtracted[idx] = s;
  }

  const lines = input.split("\n");
  let lineIndex = 0;
  const T = parseInt(lines[lineIndex]!, 10);
  lineIndex += 1;

  const results: string[] = [];

  for (let t = 1; t <= T; t += 1) {
    const _n = parseInt(lines[lineIndex]!, 10);
    lineIndex += 1;
    const inputString = lines[lineIndex]!;
    lineIndex += 1;

    const result = solveCase(
      possibleStartLocations,
      multiplesOf3or5,
      preExtracted,
      inputString,
      problemText
    );
    results.push(`Case #${String(t)}: ${result}`);
  }

  return results.join("\n") + "\n";
};

export default solution;
