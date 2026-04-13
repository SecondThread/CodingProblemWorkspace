import type { GeneratedCase, ProblemGenerator } from "../../../../src/contracts/problem";
import solution from "../solution/solution";

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

function randomChar(rng: () => number, alphabetSize: number = 26): string {
  return String.fromCharCode(97 + randomInt(rng, 0, alphabetSize - 1));
}

function randomWord(rng: () => number, len: number, alphabetSize: number = 26): string {
  const chars: string[] = [];
  for (let i = 0; i < len; i += 1) {
    chars.push(randomChar(rng, alphabetSize));
  }
  return chars.join("");
}

/** Compress a word: runs of repeated characters get compressed with count prefix */
function compress(word: string): string {
  if (word.length === 0) return "";
  const parts: string[] = [];
  let i = 0;
  while (i < word.length) {
    const ch = word[i]!;
    let count = 0;
    while (i < word.length && word[i] === ch) {
      count += 1;
      i += 1;
    }
    if (count === 1) {
      parts.push(ch);
    } else {
      parts.push(String(count) + ch);
    }
  }
  return parts.join("");
}

function uncompressedLength(s: string): number {
  let total = 0;
  const len = s.length;
  let i = 0;
  while (i < len) {
    let numStr = "";
    while (i < len && s[i]! >= "0" && s[i]! <= "9") {
      numStr += s[i]!;
      i += 1;
    }
    if (numStr === "") {
      total += 1;
      i += 1;
    } else {
      total += parseInt(numStr, 10);
      i += 1;
    }
  }
  return total;
}

interface TestCase {
  readonly n: number;
  readonly k: number;
  readonly words: string[];  // compressed words
}

const generator: ProblemGenerator = {
  async generate(): Promise<GeneratedCase> {
    const rng = seededRandom(42424242);
    const cases: TestCase[] = [];

    // --- 6 sample cases ---
    cases.push({ n: 3, k: 9, words: ["sand", "andy", "meta"] });
    cases.push({ n: 2, k: 9, words: ["banana", "anana"] });
    cases.push({ n: 1, k: 5, words: ["apple"] });
    cases.push({ n: 2, k: 10, words: ["1a2a3a", "aab"] });
    cases.push({ n: 2, k: 8, words: ["bora", "bora"] });
    cases.push({ n: 2, k: 10, words: ["tournament", "tour"] });

    // --- Edge cases ---
    // Single word, exactly K
    cases.push({ n: 1, k: 3, words: ["abc"] });
    // Single word, K < word length
    cases.push({ n: 1, k: 2, words: ["abc"] });
    // Single word, K > word length
    cases.push({ n: 1, k: 100, words: ["hi"] });

    // Two identical words
    cases.push({ n: 2, k: 20, words: ["abc", "abc"] });

    // Two words, full overlap (second is prefix of first reversed scenario)
    cases.push({ n: 2, k: 10, words: ["abcde", "cde"] });

    // Two words, no overlap possible
    cases.push({ n: 2, k: 20, words: ["abc", "xyz"] });

    // All same character words - lots of overlaps
    cases.push({ n: 2, k: 20, words: ["5a", "3a"] });
    cases.push({ n: 3, k: 30, words: ["4a", "3a", "5a"] });

    // Compressed words with large repetitions
    cases.push({ n: 2, k: 100, words: ["10a", "5a"] });
    cases.push({ n: 1, k: 1000, words: ["100a"] });

    // Words where overlap is exactly full second word
    cases.push({ n: 2, k: 10, words: ["abcdef", "def"] });

    // Many words, small
    {
      const words: string[] = [];
      for (let i = 0; i < 10; i += 1) {
        words.push(randomWord(rng, randomInt(rng, 1, 5), 3));
      }
      cases.push({ n: words.length, k: 100, words });
    }

    // --- Medium random cases ---
    for (let r = 0; r < 15; r += 1) {
      const n = randomInt(rng, 2, 20);
      const words: string[] = [];
      const alphaSize = randomInt(rng, 2, 10);
      for (let i = 0; i < n; i += 1) {
        const len = randomInt(rng, 1, 30);
        words.push(randomWord(rng, len, alphaSize));
      }
      const totalLen = words.reduce((s, w) => s + w.length, 0);
      const k = randomInt(rng, Math.max(1, totalLen - 10), totalLen + 50);
      cases.push({ n, k, words });
    }

    // --- Cases with overlapping patterns (small alphabet) ---
    for (let r = 0; r < 10; r += 1) {
      const n = randomInt(rng, 2, 10);
      const words: string[] = [];
      for (let i = 0; i < n; i += 1) {
        const len = randomInt(rng, 3, 20);
        words.push(randomWord(rng, len, 2));  // binary alphabet for more overlaps
      }
      const totalLen = words.reduce((s, w) => s + w.length, 0);
      const k = randomInt(rng, totalLen, totalLen + 100);
      cases.push({ n, k, words });
    }

    // --- Cases with compressed words ---
    for (let r = 0; r < 10; r += 1) {
      const n = randomInt(rng, 2, 8);
      const words: string[] = [];
      for (let i = 0; i < n; i += 1) {
        const baseWord = randomWord(rng, randomInt(rng, 2, 15), 4);
        words.push(compress(baseWord));
      }
      const k = randomInt(rng, 10, 200);
      cases.push({ n, k, words });
    }

    // --- Larger cases with moderate N ---
    for (let r = 0; r < 10; r += 1) {
      const n = randomInt(rng, 10, 50);
      const words: string[] = [];
      const alphaSize = randomInt(rng, 2, 5);
      for (let i = 0; i < n; i += 1) {
        const len = randomInt(rng, 1, 15);
        words.push(randomWord(rng, len, alphaSize));
      }
      const totalLen = words.reduce((s, w) => s + w.length, 0);
      const k = randomInt(rng, totalLen, totalLen + 200);
      cases.push({ n, k, words });
    }

    // --- Stress cases with larger K ---
    for (let r = 0; r < 5; r += 1) {
      const n = randomInt(rng, 2, 15);
      const words: string[] = [];
      for (let i = 0; i < n; i += 1) {
        const len = randomInt(rng, 5, 50);
        words.push(randomWord(rng, len, 3));
      }
      const k = randomInt(rng, 500, 5000);
      cases.push({ n, k, words });
    }

    // --- Cases with compressed large words ---
    for (let r = 0; r < 3; r += 1) {
      const n = randomInt(rng, 2, 5);
      const words: string[] = [];
      for (let i = 0; i < n; i += 1) {
        const repCount = randomInt(rng, 50, 500);
        const ch = randomChar(rng, 3);
        const suffix = randomWord(rng, randomInt(rng, 1, 5), 3);
        words.push(String(repCount) + ch + suffix);
      }
      const k = randomInt(rng, 100, 2000);
      cases.push({ n, k, words });
    }

    // --- N=1 edge cases ---
    cases.push({ n: 1, k: 1, words: ["a"] });
    cases.push({ n: 1, k: 1000000, words: ["1000000a"] });

    // --- Two words with exact containment ---
    cases.push({ n: 2, k: 15, words: ["abcabc", "cab"] });
    cases.push({ n: 2, k: 15, words: ["aaabbb", "bbbccc"] });

    // Fill remaining slots with random medium cases
    const remaining = 90 - cases.length;
    for (let r = 0; r < remaining; r += 1) {
      const n = randomInt(rng, 2, 30);
      const words: string[] = [];
      const alphaSize = randomInt(rng, 2, 8);
      for (let i = 0; i < n; i += 1) {
        const len = randomInt(rng, 1, 20);
        words.push(randomWord(rng, len, alphaSize));
      }
      const totalLen = words.reduce((s, w) => s + w.length, 0);
      const k = randomInt(rng, Math.max(1, totalLen - 5), Math.min(1000000, totalLen + 500));
      cases.push({ n, k, words });
    }

    // Build input
    const inputLines: string[] = [String(cases.length)];
    for (const c of cases) {
      inputLines.push(`${String(c.n)} ${String(c.k)}`);
      for (const w of c.words) {
        inputLines.push(w);
      }
    }

    const input = inputLines.join("\n") + "\n";
    const output = await Promise.resolve(solution(input));

    return { input, output: output as string };
  }
};

export default generator;
