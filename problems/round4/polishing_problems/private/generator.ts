import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { GeneratedCase, ProblemGenerator } from "../../../../src/contracts/problem";

const SUBSTRING_LENGTH = 2025;
const NUM_TESTCASES = 7;

// --- Seeded PRNG matching Kotlin's Random behavior ---
// We use a simple LCG. The Kotlin Random(seed) uses a specific algorithm,
// but we just need deterministic reproducibility within our TS generator.
// We do NOT need to match the Kotlin RNG exactly since we generate our own test data.

function seededRandom(seed: number): { nextInt(bound: number): number; nextLong(min: bigint, max: bigint): bigint; nextBoolean(): boolean } {
  let state = seed & 0xffffffff;

  function next(): number {
    state = (state * 1664525 + 1013904223) & 0xffffffff;
    return (state >>> 0) / 0x100000000;
  }

  return {
    nextInt(bound: number): number {
      return Math.floor(next() * bound);
    },
    nextLong(min: bigint, max: bigint): bigint {
      // Generate a random bigint in [min, max)
      const range = max - min;
      // Use multiple random calls for large ranges
      const hi = BigInt(Math.floor(next() * 0x100000000)) << 32n;
      const lo = BigInt(Math.floor(next() * 0x100000000));
      const val = (hi | lo) % range;
      return min + (val < 0n ? val + range : val);
    },
    nextBoolean(): boolean {
      return next() < 0.5;
    }
  };
}

// --- Miller-Rabin primality test for BigInt ---

function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = 1n;
  base = base % mod;
  if (base < 0n) base += mod;
  while (exp > 0n) {
    if (exp & 1n) {
      result = (result * base) % mod;
    }
    exp >>= 1n;
    base = (base * base) % mod;
  }
  return result;
}

function millerRabinTest(n: bigint, a: bigint): boolean {
  if (n % a === 0n) return n === a;

  let d = n - 1n;
  let r = 0;
  while (d % 2n === 0n) {
    d >>= 1n;
    r += 1;
  }

  let x = modPow(a, d, n);
  if (x === 1n || x === n - 1n) return true;

  for (let i = 0; i < r - 1; i += 1) {
    x = (x * x) % n;
    if (x === n - 1n) return true;
  }

  return false;
}

function isPrime(n: bigint): boolean {
  if (n < 2n) return false;
  if (n < 4n) return true;
  if (n % 2n === 0n || n % 3n === 0n) return false;
  // Deterministic Miller-Rabin for numbers < 3,317,044,064,679,887,385,961,981
  const witnesses = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];
  for (const a of witnesses) {
    if (!millerRabinTest(n, a)) return false;
  }
  return true;
}

function findNextPrimes(start: bigint, count: number): bigint[] {
  const primes: bigint[] = [];
  let current = start;
  while (primes.length < count) {
    if (isPrime(current)) {
      primes.push(current);
    }
    current += 1n;
  }
  return primes;
}

function scrambleAndDelete(
  substring: string,
  rng: { nextInt(bound: number): number; nextLong(min: bigint, max: bigint): bigint; nextBoolean(): boolean }
): string {
  // Generate random starting point for primes
  const maxRange = 10_000_000_000_000_000n; // 10^16
  const startNum = rng.nextLong(1n, maxRange + 1n);

  // Find next 10000 primes
  const primes = findNextPrimes(startNum, 10000);

  // Swap characters at prime-pair positions
  const chars = substring.split("");
  for (let i = 0; i < primes.length; i += 2) {
    const pos1 = Number(primes[i]! % BigInt(SUBSTRING_LENGTH));
    const pos2 = Number(primes[i + 1]! % BigInt(SUBSTRING_LENGTH));
    if (pos1 < chars.length && pos2 < chars.length) {
      const temp = chars[pos1]!;
      chars[pos1] = chars[pos2]!;
      chars[pos2] = temp;
    }
  }

  // Apply 50% random deletion
  const result: string[] = [];
  for (const ch of chars) {
    if (rng.nextBoolean()) {
      result.push(ch);
    }
  }

  return result.join("");
}

const generator: ProblemGenerator = {
  async generate(): Promise<GeneratedCase> {
    const problemText = readFileSync(
      join(process.cwd(), "problems", "round4", "polishing_problems", "public", "ProblemText.txt"),
      "utf-8"
    );

    const rng = seededRandom(478);
    const maxStartIndex = problemText.length - SUBSTRING_LENGTH;

    const inputLines: string[] = [String(NUM_TESTCASES)];
    const outputLines: string[] = [];

    for (let i = 1; i <= NUM_TESTCASES; i += 1) {
      // Find a valid start location (word boundary)
      let startIndex = rng.nextInt(maxStartIndex + 1);

      if (i === 1) {
        // First case matches the sample
        startIndex = problemText.indexOf("Your friends, Dijkstr");
      } else {
        // Keep choosing until startIndex is first non-space character after a space
        while (
          startIndex === 0 ||
          problemText[startIndex - 1] !== " " ||
          problemText[startIndex] === " "
        ) {
          startIndex = rng.nextInt(maxStartIndex + 1);
        }
      }

      const substring = problemText.substring(startIndex, startIndex + SUBSTRING_LENGTH);
      outputLines.push(`Case #${String(i)}: ${substring}`);

      const damaged = scrambleAndDelete(substring, rng);
      inputLines.push(String(damaged.length));
      inputLines.push(damaged);
    }

    const input = inputLines.join("\n") + "\n";

    return {
      input,
      output: outputLines.join("\n") + "\n"
    };
  }
};

export default generator;
