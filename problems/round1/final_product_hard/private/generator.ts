import type { GeneratedCase, ProblemGenerator } from "../../../../src/contracts/problem";
import solution from "../solution/solution";

function seededRandom(seed: number): () => number {
  let state: number = seed;
  return (): number => {
    state = (state * 1664525 + 1013904223) & 0xffffffff;
    return (state >>> 0) / 0x100000000;
  };
}

function randomBigInt(rng: () => number, min: bigint, max: bigint): bigint {
  const range: number = Number(max - min) + 1;
  return min + BigInt(Math.floor(rng() * range));
}

function randomLogScale(rng: () => number, min: bigint, max: bigint): bigint {
  const logMin: number = Math.log(Number(min) || 1);
  const logMax: number = Math.log(Number(max));
  const logVal: number = logMin + rng() * (logMax - logMin);
  let val: bigint = BigInt(Math.round(Math.exp(logVal)));
  if (val < min) val = min;
  if (val > max) val = max;
  return val;
}

const MAX_A: bigint = 100000000000000n; // 10^14
const MAX_B: bigint = 100000000000000n; // 10^14
const MAX_N: bigint = 10000000000000000n; // 10^16

interface TestCase {
  a: bigint;
  b: bigint;
  n: bigint;
}

/** Build a highly composite number from small primes, staying <= limit. */
function buildComposite(
  rng: () => number,
  primes: bigint[],
  limit: bigint
): bigint {
  let val: bigint = 1n;
  for (const p of primes) {
    if (val * p > limit) break;
    const maxExp: number = Math.floor(Math.log(Number(limit / val)) / Math.log(Number(p)));
    if (maxExp < 1) continue;
    const exp: number = Math.max(1, Math.floor(rng() * (maxExp + 1)));
    for (let i = 0; i < exp; i += 1) {
      if (val * p > limit) break;
      val *= p;
    }
  }
  return val;
}

const generator: ProblemGenerator = {
  generate(): GeneratedCase {
    const rng = seededRandom(98765);
    const cases: TestCase[] = [];

    // === Sample cases (4) ===
    cases.push({ a: 1n, b: 7n, n: 3n });
    cases.push({ a: 10n, b: 15n, n: 2n });
    cases.push({ a: 1000n, b: 21n, n: 2n });
    cases.push({ a: 50000n, b: 3628800n, n: 50n });

    // === Edge cases ===
    cases.push({ a: 1n, b: 1n, n: 1n }); // trivial
    cases.push({ a: 1n, b: 1n, n: MAX_N }); // all multipliers 1, huge N
    cases.push({ a: MAX_A, b: 1n, n: 1n }); // B=1, A large
    cases.push({ a: MAX_A, b: 1n, n: MAX_N }); // B=1, both large
    cases.push({ a: 1n, b: 2n, n: 1n }); // A=1, B=prime, N=1
    cases.push({ a: 1n, b: 2n, n: MAX_N }); // A=1, B=prime, huge N
    cases.push({ a: MAX_A, b: MAX_A, n: 1n }); // A=B, N=1
    cases.push({ a: MAX_A, b: MAX_A, n: MAX_N }); // A=B, huge N
    cases.push({ a: MAX_A, b: 2n, n: MAX_N }); // A >> B
    cases.push({ a: 1n, b: 99999999999973n, n: 1n }); // A=1, B=large prime

    // === B = prime ===
    const largePrimes: bigint[] = [
      2n, 3n, 5n, 7n, 11n, 13n, 97n,
      999999999999937n, // near 10^15 but need <= 10^14... use smaller
      99999999999973n,  // large prime near 10^14
      9999999999971n,   // ~10^13 prime
      99999999977n,     // ~10^11 prime
    ];
    for (const p of largePrimes) {
      if (p <= MAX_B) {
        cases.push({ a: p, b: p, n: randomLogScale(rng, 1n, MAX_N) });
      }
    }
    // B=prime, A < B
    cases.push({ a: 1n, b: 99999999999973n, n: 100n });
    cases.push({ a: 50000000000000n, b: 99999999999973n, n: 1000000n });

    // === B = prime power ===
    // 2^46 = 70368744177664 < 10^14
    cases.push({ a: 1n, b: 70368744177664n, n: 1n });
    cases.push({ a: 70368744177664n, b: 70368744177664n, n: MAX_N });
    cases.push({ a: 256n, b: 70368744177664n, n: 100n });
    // 3^29 = 68630377364883 < 10^14
    cases.push({ a: 1n, b: 68630377364883n, n: 1n });
    cases.push({ a: 68630377364883n, b: 68630377364883n, n: 999n });
    cases.push({ a: 81n, b: 68630377364883n, n: 50n });

    // === B = product of 2 primes ===
    cases.push({ a: 1n, b: 2n * 99999999999973n, n: 5n }); // too large? 2*99999999999973 > 10^14
    // Use: 2 * 49999999999969 if prime, or just pick known values
    cases.push({ a: 6n, b: 6n, n: 3n }); // 2*3
    cases.push({ a: 15n, b: 15n, n: MAX_N }); // 3*5
    cases.push({ a: 1n, b: 9999999999973n * 2n, n: 10n }); // 2 * large prime (~2*10^13)

    // === B = highly composite (many factors) ===
    // 2^10 * 3^6 * 5^3 * 7^2 = 1024 * 729 * 125 * 49 = 4,572,288,000
    cases.push({ a: 1n, b: 4572288000n, n: 1n });
    cases.push({ a: 4572288000n, b: 4572288000n, n: MAX_N });
    cases.push({ a: 100n, b: 4572288000n, n: 5n });
    cases.push({ a: 1000n, b: 4572288000n, n: 100n });
    cases.push({ a: 67620n, b: 4572288000n, n: 1000000000000n }); // sqrt(B) ~ 67620

    // 2^6 * 3^4 * 5^2 * 7 * 11 * 13 = 64*81*25*7*11*13 = 12,882,600 (many distinct primes)
    cases.push({ a: 12882600n, b: 12882600n, n: 2n });
    cases.push({ a: 1n, b: 12882600n, n: 2n });
    cases.push({ a: 100n, b: 12882600n, n: 50n });

    // === Perfect square, perfect cube ===
    // 2^20 * 3^10 = 1048576 * 59049 = 61917364224
    cases.push({ a: 248800n, b: 61917364224n, n: 7n }); // sqrt ~ 248830
    cases.push({ a: 61917364224n, b: 61917364224n, n: 3n });
    // Perfect cube: 2^12 * 3^9 = 4096 * 19683 = 80621568
    cases.push({ a: 432n, b: 80621568n, n: 10n }); // cbrt ~ 432
    cases.push({ a: 80621568n, b: 80621568n, n: MAX_N });

    // === A/B relationships ===
    // A < smallest prime factor of B
    cases.push({ a: 1n, b: 97n * 89n * 83n, n: 5n }); // B=715939, smallest pf=83, A=1
    cases.push({ a: 82n, b: 97n * 89n * 83n, n: 5n }); // A < 83

    // A = sqrt(B) approximately
    cases.push({ a: 10000000n, b: 100000000000000n, n: 3n }); // sqrt(10^14) = 10^7

    // A >> B
    cases.push({ a: MAX_A, b: 12n, n: 5n });
    cases.push({ a: MAX_A, b: 7n, n: MAX_N });

    // === Very large N with small B ===
    cases.push({ a: 1n, b: 6n, n: MAX_N });
    cases.push({ a: 6n, b: 6n, n: MAX_N });
    cases.push({ a: 2n, b: 6n, n: MAX_N });
    cases.push({ a: 3n, b: 6n, n: MAX_N });
    cases.push({ a: 1n, b: 30n, n: MAX_N });
    cases.push({ a: 30n, b: 30n, n: MAX_N });

    // === Very small N with large B ===
    cases.push({ a: MAX_A, b: MAX_A, n: 1n });
    cases.push({ a: 1n, b: MAX_A, n: 1n });

    // === N=1 special cases ===
    cases.push({ a: 50n, b: 100n, n: 1n });
    cases.push({ a: 100n, b: 100n, n: 1n });
    cases.push({ a: 1n, b: 100n, n: 1n });

    // === Random cases with structured B (composite from small primes) ===
    const smallPrimes: bigint[] = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n];
    for (let r = 0; r < 25; r += 1) {
      const numPrimes: number = 2 + Math.floor(rng() * 4); // 2-5 primes
      const usedPrimes: bigint[] = [];
      for (let i = 0; i < numPrimes; i += 1) {
        usedPrimes.push(smallPrimes[Math.floor(rng() * smallPrimes.length)]!);
      }
      const b: bigint = buildComposite(rng, usedPrimes, MAX_B);
      const a: bigint = randomLogScale(rng, 1n, b < MAX_A ? b : MAX_A);
      const n: bigint = randomLogScale(rng, 1n, MAX_N);
      cases.push({ a, b, n });
    }

    // === Random cases at various scales ===
    // Small scale
    for (let r = 0; r < 10; r += 1) {
      const b: bigint = randomBigInt(rng, 1n, 100n);
      const a: bigint = randomBigInt(rng, 1n, 100n);
      const n: bigint = randomBigInt(rng, 1n, 100n);
      cases.push({ a, b, n });
    }

    // Medium scale
    for (let r = 0; r < 10; r += 1) {
      const b: bigint = randomLogScale(rng, 1n, 1000000n);
      const a: bigint = randomLogScale(rng, 1n, 1000000n);
      const n: bigint = randomLogScale(rng, 1n, 1000000000n);
      cases.push({ a, b, n });
    }

    // Large scale (but keep B moderate so sqrt(B) factoring is fast)
    for (let r = 0; r < 10; r += 1) {
      const b: bigint = randomLogScale(rng, 1n, 10000000000n); // up to 10^10
      const a: bigint = randomLogScale(rng, 1n, MAX_A);
      const n: bigint = randomLogScale(rng, 1n, MAX_N);
      cases.push({ a, b, n });
    }

    // Large B (a few cases with B near 10^14 -- these are slower)
    for (let r = 0; r < 5; r += 1) {
      const b: bigint = buildComposite(rng, [2n, 3n, 5n, 7n, 11n], MAX_B);
      const a: bigint = randomLogScale(rng, 1n, MAX_A);
      const n: bigint = randomLogScale(rng, 1n, MAX_N);
      cases.push({ a, b, n });
    }

    // Very large B with sqrt-level A
    for (let r = 0; r < 3; r += 1) {
      const b: bigint = buildComposite(rng, [2n, 3n, 5n, 7n], MAX_B);
      const sqrtB: bigint = BigInt(Math.floor(Math.sqrt(Number(b))));
      const a: bigint = sqrtB > 0n ? sqrtB : 1n;
      const n: bigint = randomLogScale(rng, 1n, MAX_N);
      cases.push({ a, b, n });
    }

    // Ensure we don't exceed T=150. Trim or pad.
    while (cases.length > 150) {
      cases.pop();
    }

    // Clamp all values to valid ranges
    for (const c of cases) {
      if (c.a < 1n) c.a = 1n;
      if (c.a > MAX_A) c.a = MAX_A;
      if (c.b < 1n) c.b = 1n;
      if (c.b > MAX_B) c.b = MAX_B;
      if (c.n < 1n) c.n = 1n;
      if (c.n > MAX_N) c.n = MAX_N;
    }

    // Build input
    const inputLines: string[] = [String(cases.length)];
    for (const c of cases) {
      inputLines.push(`${String(c.a)} ${String(c.b)} ${String(c.n)}`);
    }
    const input: string = `${inputLines.join("\n")}\n`;

    // Use the official solution to generate output
    const output: string = solution(input);

    return { input, output };
  }
};

export default generator;
