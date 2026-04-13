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

function getRand(rng: () => number, n: number): string {
  let s = "";
  for (let i = 0; i < 2 * n; i += 1) {
    s += String(randomInt(rng, 0, 1));
  }
  return s;
}

function getPair(rng: () => number, n: number): string {
  let s = "";
  for (let i = 0; i < n; i += 1) {
    s += randomInt(rng, 0, 1) === 1 ? "01" : "10";
  }
  return s;
}

/** All zeros */
function allZeros(n: number): string {
  return "0".repeat(2 * n);
}

/** All ones */
function allOnes(n: number): string {
  return "1".repeat(2 * n);
}

/** Already sorted: k zeros then (2n-k) ones */
function sorted(n: number, k: number): string {
  return "0".repeat(k) + "1".repeat(2 * n - k);
}

/** Reverse sorted: all ones then all zeros */
function reverseSorted(n: number, k: number): string {
  return "1".repeat(2 * n - k) + "0".repeat(k);
}

/** Alternating 0101... */
function alternating01(n: number): string {
  let s = "";
  for (let i = 0; i < 2 * n; i += 1) s += String(i % 2);
  return s;
}

/** Alternating 1010... */
function alternating10(n: number): string {
  let s = "";
  for (let i = 0; i < 2 * n; i += 1) s += String(1 - (i % 2));
  return s;
}

/** Single 1 in a sea of 0s at position pos */
function singleOne(n: number, pos: number): string {
  const arr = new Array(2 * n).fill("0");
  arr[pos] = "1";
  return arr.join("");
}

/** Single 0 in a sea of 1s at position pos */
function singleZero(n: number, pos: number): string {
  const arr = new Array(2 * n).fill("1");
  arr[pos] = "0";
  return arr.join("");
}

/** Half zeros half ones, interleaved in blocks of size blockSize */
function blocks(n: number, blockSize: number): string {
  const arr: string[] = [];
  let cur = "0";
  for (let i = 0; i < 2 * n; i += 1) {
    arr.push(cur);
    if ((i + 1) % blockSize === 0) cur = cur === "0" ? "1" : "0";
  }
  return arr.join("");
}

const MX = 150;

interface TestCase {
  readonly n: number;
  readonly s: string;
}

const generator: ProblemGenerator = {
  async generate(): Promise<GeneratedCase> {
    const rng = seededRandom(123456789);
    const cases: TestCase[] = [];

    // --- Edge cases: N=3 (minimum) ---
    cases.push({ n: 3, s: "000000" });       // all zeros
    cases.push({ n: 3, s: "111111" });       // all ones
    cases.push({ n: 3, s: "000111" });       // already sorted
    cases.push({ n: 3, s: "111000" });       // reverse sorted
    cases.push({ n: 3, s: "010101" });       // alternating
    cases.push({ n: 3, s: "101010" });       // alternating reversed
    cases.push({ n: 3, s: "100000" });       // single 1 at start
    cases.push({ n: 3, s: "000001" });       // single 1 at end
    cases.push({ n: 3, s: "011111" });       // single 0 at start
    cases.push({ n: 3, s: "111110" });       // single 0 at end

    // --- Small N adversarial patterns ---
    for (const n of [4, 5, 6, 7, 8]) {
      cases.push({ n, s: alternating01(n) });
      cases.push({ n, s: alternating10(n) });
      cases.push({ n, s: reverseSorted(n, n) });  // n zeros at end, n ones at start
      cases.push({ n, s: singleOne(n, 0) });       // 1 at position 0
      cases.push({ n, s: singleZero(n, 2 * n - 1) }); // 0 at last position
    }

    // --- Mid-range N with adversarial patterns ---
    for (const n of [20, 50, 75, 100]) {
      cases.push({ n, s: allZeros(n) });
      cases.push({ n, s: allOnes(n) });
      cases.push({ n, s: alternating01(n) });
      cases.push({ n, s: reverseSorted(n, n) });
      cases.push({ n, s: blocks(n, 3) });  // block size 3
      cases.push({ n, s: singleOne(n, 0) });
    }

    // --- Max N adversarial patterns ---
    cases.push({ n: MX, s: allZeros(MX) });
    cases.push({ n: MX, s: allOnes(MX) });
    cases.push({ n: MX, s: sorted(MX, MX) });
    cases.push({ n: MX, s: reverseSorted(MX, MX) });
    cases.push({ n: MX, s: alternating01(MX) });
    cases.push({ n: MX, s: alternating10(MX) });
    cases.push({ n: MX, s: singleOne(MX, 0) });
    cases.push({ n: MX, s: singleZero(MX, 2 * MX - 1) });
    cases.push({ n: MX, s: blocks(MX, 2) });
    cases.push({ n: MX, s: blocks(MX, 5) });

    // --- Max N random and pair ---
    for (let t = 0; t < 3; t += 1) {
      cases.push({ n: MX, s: getRand(rng, MX) });
    }
    for (let t = 0; t < 3; t += 1) {
      cases.push({ n: MX, s: getPair(rng, MX) });
    }

    // --- Small N random (original coverage) ---
    for (let t = 0; t < 15; t += 1) {
      const n = randomInt(rng, 3, 20);
      cases.push({ n, s: getRand(rng, n) });
    }

    // --- Small N pair ---
    for (let t = 0; t < 15; t += 1) {
      const n = randomInt(rng, 3, 20);
      cases.push({ n, s: getPair(rng, n) });
    }

    // --- Mid-range N random ---
    for (let t = 0; t < 10; t += 1) {
      const n = randomInt(rng, 30, 100);
      cases.push({ n, s: getRand(rng, n) });
    }

    // --- Mid-range N pair ---
    for (let t = 0; t < 10; t += 1) {
      const n = randomInt(rng, 30, 100);
      cases.push({ n, s: getPair(rng, n) });
    }

    // --- Mixed random/pair at various sizes ---
    for (let t = 0; t < 10; t += 1) {
      const n = randomInt(rng, 3, MX);
      cases.push({
        n,
        s: randomInt(rng, 0, 1) === 1 ? getRand(rng, n) : getPair(rng, n),
      });
    }

    // Trim to T <= 80 if needed
    const finalCases = cases.slice(0, 80);

    const inputLines: string[] = [String(finalCases.length)];
    for (const c of finalCases) {
      inputLines.push(String(c.n));
      inputLines.push(c.s);
    }
    const input = inputLines.join("\n") + "\n";

    const output = await Promise.resolve(solution(input));
    return { input, output: output as string };
  }
};

export default generator;
