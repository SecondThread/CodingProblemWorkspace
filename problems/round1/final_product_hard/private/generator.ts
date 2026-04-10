import type { GeneratedCase, ProblemGenerator } from "../../../../src/contracts/problem";

const MOD: bigint = 1000000007n;

function getFactors(n: bigint): bigint[] {
  const factors: bigint[] = [];
  for (let f = 1n; f * f <= n; f += 1n) {
    if (n % f === 0n) {
      factors.push(f);
      if (f * f !== n) factors.push(n / f);
    }
  }
  return factors;
}

function getPrimeFactors(n: bigint): bigint[] {
  const primes: bigint[] = [];
  let rem = n;
  for (let f = 2n; f * f <= rem; f += 1n) {
    if (rem % f === 0n) { primes.push(f); while (rem % f === 0n) rem /= f; }
  }
  if (rem !== 1n) primes.push(rem);
  return primes;
}

function pwr(a: bigint, e: bigint): bigint {
  let r = 1n, base = a % MOD, exp = e;
  while (exp > 0n) { if (exp & 1n) r = r * base % MOD; base = base * base % MOD; exp >>= 1n; }
  return r;
}

function fact(n: number): bigint {
  let ans = 1n;
  for (let i = 1; i <= n; i += 1) ans = ans * BigInt(i) % MOD;
  return ans;
}

function combSmallDelta(n: bigint, k: bigint): bigint {
  const delta = Number(n - k);
  const invDen = pwr(fact(delta), MOD - 2n);
  let num = 1n;
  for (let i = k + 1n; i <= n; i += 1n) num = num * (i % MOD) % MOD;
  return num * invDen % MOD;
}

function distribute(n: number, k: bigint): bigint {
  return combSmallDelta(BigInt(n) + k - 1n, k - 1n);
}

function numSeq(product: bigint, n: bigint, primes: readonly bigint[]): bigint {
  let ans = 1n, rem = product;
  for (const p of primes) {
    let cnt = 0;
    while (rem % p === 0n) { rem /= p; cnt += 1; }
    ans = ans * distribute(cnt, n) % MOD;
  }
  return ans;
}

function solve(a: bigint, b: bigint, n: bigint): bigint {
  const factors = getFactors(b);
  const primes = getPrimeFactors(b);
  let ans = 0n;
  for (const f of factors) {
    if (f > a) continue;
    ans = (ans + numSeq(f, n, primes) * numSeq(b / f, n, primes) % MOD) % MOD;
  }
  return ans;
}

const generator: ProblemGenerator = {
  generate(): GeneratedCase {
    const cases: { a: bigint; b: bigint; n: bigint }[] = [
      { a: 1n, b: 7n, n: 3n },
      { a: 10n, b: 15n, n: 2n },
      { a: 1000n, b: 21n, n: 2n },
      { a: 50000n, b: 3628800n, n: 50n },
      { a: 1n, b: 1n, n: 1n },
      { a: 1n, b: 1n, n: 10000000000000000n },
      { a: 100000000000000n, b: 100000000000000n, n: 10000000000000000n },
    ];

    const inputLines: string[] = [String(cases.length)];
    for (const c of cases) inputLines.push(`${String(c.a)} ${String(c.b)} ${String(c.n)}`);

    const outputLines: string[] = cases.map((c, i) =>
      `Case #${String(i + 1)}: ${String(solve(c.a, c.b, c.n))}`
    );

    return {
      input: `${inputLines.join("\n")}\n`,
      output: `${outputLines.join("\n")}\n`
    };
  }
};

export default generator;
