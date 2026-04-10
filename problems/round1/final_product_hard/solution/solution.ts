import type { ProblemSolution } from "../../../../src/contracts/problem";

const MOD: bigint = 1000000007n;

function getFactors(n: bigint): bigint[] {
  const factors: bigint[] = [];
  for (let f = 1n; f * f <= n; f += 1n) {
    if (n % f === 0n) {
      factors.push(f);
      if (f * f !== n) {
        factors.push(n / f);
      }
    }
  }
  return factors;
}

function getPrimeFactors(n: bigint): bigint[] {
  const primes: bigint[] = [];
  let remaining: bigint = n;
  for (let f = 2n; f * f <= remaining; f += 1n) {
    if (remaining % f === 0n) {
      primes.push(f);
      while (remaining % f === 0n) {
        remaining /= f;
      }
    }
  }
  if (remaining !== 1n) {
    primes.push(remaining);
  }
  return primes;
}

function getPrimeFactorizationFast(
  n: bigint,
  candidatePrimes: readonly bigint[]
): Map<bigint, number> {
  const factorization: Map<bigint, number> = new Map();
  let remaining: bigint = n;
  for (const p of candidatePrimes) {
    let cnt: number = 0;
    while (remaining % p === 0n) {
      remaining /= p;
      cnt += 1;
    }
    factorization.set(p, cnt);
  }
  return factorization;
}

function fact(n: number): bigint {
  let ans: bigint = 1n;
  for (let i = 1; i <= n; i += 1) {
    ans = (ans * BigInt(i)) % MOD;
  }
  return ans;
}

function pwr(a: bigint, e: bigint): bigint {
  let result: bigint = 1n;
  let base: bigint = a % MOD;
  let exp: bigint = e;
  while (exp > 0n) {
    if (exp & 1n) {
      result = (result * base) % MOD;
    }
    base = (base * base) % MOD;
    exp >>= 1n;
  }
  return result;
}

function combSmallDelta(n: bigint, k: bigint): bigint {
  const delta: number = Number(n - k);
  const den: bigint = fact(delta);
  const invDen: bigint = pwr(den, MOD - 2n);
  let num: bigint = 1n;
  for (let i: bigint = k + 1n; i <= n; i += 1n) {
    num = (num * (i % MOD)) % MOD;
  }
  return (num * invDen) % MOD;
}

function distribute(n: number, k: bigint): bigint {
  return combSmallDelta(BigInt(n) + k - 1n, k - 1n);
}

function numSequences(
  product: bigint,
  n: bigint,
  candidatePrimes: readonly bigint[]
): bigint {
  const factorization: Map<bigint, number> = getPrimeFactorizationFast(
    product,
    candidatePrimes
  );
  let ans: bigint = 1n;
  for (const [, exponent] of factorization) {
    ans = (ans * distribute(exponent, n)) % MOD;
  }
  return ans;
}

function solve(a: bigint, b: bigint, n: bigint): bigint {
  const allFactors: bigint[] = getFactors(b);
  const candidatePrimes: readonly bigint[] = getPrimeFactors(b);
  let ans: bigint = 0n;
  for (const productFirstN of allFactors) {
    if (productFirstN > a) {
      continue;
    }
    const productLastN: bigint = b / productFirstN;
    ans =
      (ans +
        ((numSequences(productFirstN, n, candidatePrimes) *
          numSequences(productLastN, n, candidatePrimes)) %
          MOD)) %
      MOD;
  }
  return ans;
}

const solution: ProblemSolution = (input: string): string => {
  const lines: readonly string[] = input.trim().split("\n");
  const t: number = Number(lines[0]!);
  const outputLines: string[] = [];

  for (let test = 1; test <= t; test += 1) {
    const parts: readonly string[] = lines[test]!.split(" ");
    const a: bigint = BigInt(parts[0]!);
    const b: bigint = BigInt(parts[1]!);
    const n: bigint = BigInt(parts[2]!);
    outputLines.push(`Case #${String(test)}: ${String(solve(a, b, n))}`);
  }

  return `${outputLines.join("\n")}\n`;
};

export default solution;
