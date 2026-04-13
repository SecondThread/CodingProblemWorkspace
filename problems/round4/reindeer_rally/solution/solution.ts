import type { ProblemSolution } from "../../../../src/contracts/problem";

/**
 * Port of the C++ reference solution for the Team Assignments / Reindeer Rally problem.
 *
 * Algorithm overview:
 *   1. Collect all reindeer (ignoring -1 backups) with their weight mod M and original IDs.
 *   2. Use a DP over "bundles" (binary-decomposed counts per remainder class) to decide
 *      which r reindeer to leave out so that the total penalty is minimized.
 *   3. Group the chosen reindeer into teams of M using:
 *      - First, greedily form teams from reindeer sharing the same remainder mod M.
 *      - Then, for the leftover (each remainder has < M items), use the divide routine
 *        which finds M items summing to 0 mod M (Cauchy-Davenport for primes,
 *        recursive decomposition for composites).
 *   4. Possibly drop the last team if forming fewer teams gives better net effectiveness.
 */

const solution: ProblemSolution = (input: string): string => {
  const tokens: string[] = input.trim().split(/\s+/);
  let pos = 0;
  const next = (): string => tokens[pos++]!;
  const nextInt = (): number => Number(next());

  // Sieve: trace[i] = smallest prime factor of i
  const MAX_M = 10001;
  const trace: Int32Array = new Int32Array(MAX_M);
  for (let i = 2; i < MAX_M; i++) {
    if (trace[i] !== 0) continue;
    for (let j = 1; j * i < MAX_M; j++) {
      if (trace[i * j] === 0) trace[i * j] = i;
    }
  }

  const T: number = nextInt();
  const outputLines: string[] = [];

  for (let z = 1; z <= T; z++) {
    const N: number = nextInt();
    const M: number = nextInt();
    const A: number = nextInt();
    const B: number = nextInt();

    // Read weights; store [weight % M, id]
    const arr: number[][] = [];
    for (let i = 0; i <= N; i++) {
      arr.push(new Array(M + 2).fill(0));
    }

    const x: [number, number][] = []; // [val%M, id]
    for (let i = 1; i <= N; i++) {
      for (let j = 1; j <= M + 1; j++) {
        const w: number = nextInt();
        arr[i]![j] = w;
        if (w !== -1) {
          x.push([((w % M) + M) % M, (i - 1) * (M + 1) + j]);
        }
      }
    }

    const n: number = x.length;
    const k: number = Math.floor(n / M);
    const r: number = n % M;

    // Group by remainder mod M
    const bucket: [number, number][][] = Array.from({ length: M }, () => []);
    for (const v of x) {
      bucket[v[0]]!.push(v);
    }

    // Binary decomposition of counts for DP
    interface Bundle {
      cnt: number;
      sum: number;
    }
    const bundles: Bundle[][] = Array.from({ length: M }, () => []);

    for (let i = 0; i < M; i++) {
      if (bucket[i]!.length === 0) continue;
      let count: number = Math.min(r, bucket[i]!.length);
      let kk = 1;
      while (kk <= count) {
        bundles[i]!.push({ cnt: kk, sum: (kk * i) % M });
        count -= kk;
        kk *= 2;
      }
      if (count > 0) {
        bundles[i]!.push({ cnt: count, sum: (count * i) % M });
      }
    }

    // DP: dp[j] is a bitset of size M indicating which total-mod values are
    // reachable using exactly j items to exclude.
    // We represent each bitset as a Uint32Array of ceil(M/32) words.
    const W: number = (M + 31) >> 5;
    const dp: Uint32Array[] = [];
    const firstGroup: Int16Array[] = [];
    for (let j = 0; j <= r; j++) {
      dp.push(new Uint32Array(W));
      const fg = new Int16Array(M);
      fg.fill(-1);
      firstGroup.push(fg);
    }
    dp[0]![0 >> 5] |= 1 << (0 & 31); // dp[0] bit 0 = 1
    firstGroup[0]![0] = -2;

    // Helper functions for bitset operations
    const bsTest = (bs: Uint32Array, bit: number): boolean => {
      return (bs[bit >> 5]! & (1 << (bit & 31))) !== 0;
    };

    const bsNone = (bs: Uint32Array): boolean => {
      for (let w = 0; w < W; w++) {
        if (bs[w] !== 0) return false;
      }
      return true;
    };

    const bsShiftLeft = (bs: Uint32Array, shift: number, out: Uint32Array): void => {
      // Shift left by `shift` bits, wrapping around at M bits
      // out = (bs << shift) | (bs >> (M - shift)), masked to M bits
      if (shift === 0) {
        out.set(bs);
        return;
      }
      // Clear out
      out.fill(0);

      // First: straight shift left by `shift`
      const wordShift = shift >> 5;
      const bitShift = shift & 31;
      for (let w = 0; w < W; w++) {
        if (bs[w] === 0) continue;
        const destW = w + wordShift;
        if (destW < W) {
          out[destW] |= (bs[w]! << bitShift) >>> 0;
        }
        if (bitShift > 0 && destW + 1 < W) {
          out[destW + 1] |= bs[w]! >>> (32 - bitShift);
        }
        // Handle wrap-around bits that go past M
        if (destW >= W) {
          // These bits wrapped
        }
      }

      // Now handle wrap-around: bits at positions >= M should wrap to position - M
      // Also, right shift by (M - shift) and OR into out
      const rShift = M - shift;
      const rWordShift = rShift >> 5;
      const rBitShift = rShift & 31;
      for (let w = 0; w < W; w++) {
        if (bs[w] === 0) continue;
        const destW = w - rWordShift;
        if (rBitShift === 0) {
          if (destW >= 0 && destW < W) {
            out[destW] |= bs[w]!;
          }
        } else {
          if (destW >= 0 && destW < W) {
            out[destW] |= bs[w]! >>> rBitShift;
          }
          if (destW - 1 >= 0 && destW - 1 < W) {
            out[destW - 1] |= (bs[w]! << (32 - rBitShift)) >>> 0;
          }
        }
      }

      // Mask out bits >= M
      const topWord = (M - 1) >> 5;
      const topBit = (M - 1) & 31;
      if (topWord < W) {
        out[topWord] &= (1 << (topBit + 1)) - 1 !== 0 ? ((1 << (topBit + 1)) - 1) >>> 0 : 0xffffffff;
        for (let w = topWord + 1; w < W; w++) {
          out[w] = 0;
        }
      }
    };

    // Proper cyclic left shift for the DP
    const bsCyclicShift = (bs: Uint32Array, shift: number): Uint32Array => {
      if (shift === 0) return new Uint32Array(bs);
      const result = new Uint32Array(W);

      // For each set bit in bs at position p, set bit (p + shift) % M in result
      for (let w = 0; w < W; w++) {
        if (bs[w] === 0) continue;
        let word = bs[w]!;
        let base = w << 5;
        while (word !== 0) {
          const lsb = word & (-word);
          const bit = base + (31 - Math.clz32(lsb));
          if (bit < M) {
            const newBit = (bit + shift) % M;
            result[newBit >> 5] |= 1 << (newBit & 31);
          }
          word ^= lsb;
        }
      }
      return result;
    };

    // DP over bundles
    for (let i = 0; i < M; i++) {
      for (const bundle of bundles[i]!) {
        const { cnt, sum } = bundle;
        for (let j = r; j >= cnt; j--) {
          if (bsNone(dp[j - cnt]!)) continue;

          let shifted: Uint32Array;
          if (sum === 0) {
            shifted = new Uint32Array(dp[j - cnt]!);
          } else {
            shifted = bsCyclicShift(dp[j - cnt]!, sum);
          }

          // new_states = shifted & (~dp[j])
          let hasNew = false;
          for (let w = 0; w < W; w++) {
            const newBits = shifted[w]! & ~dp[j]![w]!;
            if (newBits !== 0) hasNew = true;
          }

          if (!hasNew) continue;

          // Update dp[j] and firstGroup[j]
          for (let mod = 0; mod < M; mod++) {
            if ((shifted[mod >> 5]! & (1 << (mod & 31))) !== 0 &&
                (dp[j]![mod >> 5]! & (1 << (mod & 31))) === 0) {
              dp[j]![mod >> 5] |= 1 << (mod & 31);
              firstGroup[j]![mod] = i;
            }
          }
        }
      }
    }

    // Find sum of all values mod M
    let modAll = 0;
    for (const [val] of x) {
      modAll = (modAll + val) % M;
    }

    // Find target: which r items to exclude to minimize penalty
    let smallestMod = M;
    let target = 0;
    for (let mod = 0; mod < M; mod++) {
      if (bsTest(dp[r]!, mod)) {
        const remainingMod = (modAll - mod + M) % M;
        if (remainingMod < smallestMod) {
          smallestMod = remainingMod;
          target = mod;
        }
      }
    }

    const v1 = BigInt(A) * BigInt(k - 1);
    const v2 = BigInt(A) * BigInt(k) - BigInt(B) * BigInt(smallestMod);

    let maxRes: bigint = v1 > v2 ? v1 : v2;
    let actualK: number = k;

    // Trace back which items to exclude
    const cntUsed: number[] = new Array(M).fill(0);
    let currJ = r;
    let currMod = target;

    while (currJ > 0) {
      const ii = firstGroup[currJ]![currMod]!;
      if (ii < 0) break;
      let found = false;

      for (const bundle of bundles[ii]!) {
        const { cnt, sum } = bundle;
        if (currJ >= cnt) {
          let prevMod = (currMod - sum) % M;
          if (prevMod < 0) prevMod += M;
          const prevJ = currJ - cnt;

          if (firstGroup[prevJ]![prevMod] !== -1) {
            cntUsed[ii] += cnt;
            currJ = prevJ;
            currMod = prevMod;
            found = true;
            break;
          }
        }
      }
      if (!found) break;
    }

    // Mark excluded items
    const notChosen: Set<string> = new Set();
    for (let i = 0; i < M; i++) {
      for (let kk = 0; kk < cntUsed[i]!; kk++) {
        const item = bucket[i]![kk]!;
        notChosen.add(`${item[0]},${item[1]}`);
      }
    }

    const chosenArray: [number, number][] = [];
    for (const e of x) {
      if (!notChosen.has(`${e[0]},${e[1]}`)) {
        chosenArray.push(e);
      }
    }

    // Group chosen items by remainder
    const v: [number, number][][] = Array.from({ length: M + 1 }, () => []);
    for (const e of chosenArray) {
      v[e[0]]!.push(e);
    }

    // Form teams
    const res: [number, number][][] = Array.from({ length: k + 1 }, () => []);
    let group = 0;

    // First: teams of M items with same remainder
    for (let i = 0; i < M; i++) {
      const sz = v[i]!.length;
      const fullTeams = Math.floor(sz / M);
      for (let j = 1; j <= fullTeams; j++) {
        group++;
        for (let l = 0; l < M; l++) {
          res[group]!.push(v[i]![M * (j - 1) + l]!);
        }
      }
      // Remove used items
      v[i] = v[i]!.slice(fullTeams * M);
    }

    // Collect remaining items
    const allBag: [number, number][] = [];
    for (let i = 0; i < M; i++) {
      for (const j of v[i]!) {
        allBag.push(j);
      }
    }

    // processEasyCase: check if any remainder class has >= m items
    function processEasyCase(
      resArr: [number, number][],
      bag: [number, number][],
      m: number
    ): { bag: [number, number][]; found: boolean } {
      const rr: [number, number][][] = Array.from({ length: m }, () => []);
      for (const item of bag) {
        rr[item[0] % m]!.push(item);
      }

      let index = -1;
      for (let i = 0; i < m; i++) {
        if (rr[i]!.length >= m) {
          index = i;
          break;
        }
      }

      const newBag: [number, number][] = [];

      if (index === -1) {
        for (let i = 0; i < m; i++) {
          for (const j of rr[i]!) newBag.push(j);
        }
        return { bag: newBag, found: false };
      }

      for (let i = 0; i < m; i++) {
        if (i === index) {
          for (let j = 0; j < rr[i]!.length; j++) {
            if (j < m) {
              resArr.push(rr[i]![j]!);
            } else {
              newBag.push(rr[i]![j]!);
            }
          }
        } else {
          for (const j of rr[i]!) {
            newBag.push(j);
          }
        }
      }
      return { bag: newBag, found: true };
    }

    // dividePrime: for prime m, find m items summing to 0 mod m from 2m-1 items
    function dividePrime(
      resArr: [number, number][],
      bag: [number, number][],
      m: number
    ): [number, number][] {
      {
        const ec = processEasyCase(resArr, bag, m);
        if (ec.found) return ec.bag;
        bag = ec.bag;
      }

      // bucket[i] has 2 items (i-th pair from bag)
      const bkt: [number, number][][] = Array.from({ length: m }, () => []);
      for (let i = 0; i < bag.length; i++) {
        bkt[i % m]!.push(bag[i]!);
      }

      // DP using bitsets to find a selection summing to 0 mod m
      // bs[i][j] = bitset of reachable mod values using one item from each of buckets 0..i,
      //   where j indicates which item was chosen from bucket i
      const bs: Uint32Array[][] = Array.from({ length: m }, () => [
        new Uint32Array((m + 31) >> 5),
        new Uint32Array((m + 31) >> 5)
      ]);

      const ww = (m + 31) >> 5;

      // Base case: bucket 0
      for (let i = 0; i <= 1; i++) {
        if (i < bkt[0]!.length) {
          const val = bkt[0]![i]![0] % m;
          bs[0]![i]![val >> 5] |= 1 << (val & 31);
        }
      }

      for (let i = 1; i < m; i++) {
        for (let j = 0; j < bkt[i]!.length; j++) {
          const u = bkt[i]![j]![0] % m;
          for (let kk = 0; kk <= 1; kk++) {
            if (kk >= bkt[i - 1]!.length) continue;
            // bs[i][j] |= cyclicShift(bs[i-1][kk], u)
            const prev = bs[i - 1]![kk]!;
            for (let w = 0; w < ww; w++) {
              if (prev[w] === 0) continue;
              let word = prev[w]!;
              let base = w << 5;
              while (word !== 0) {
                const lsb = word & (-word);
                const bit = base + (31 - Math.clz32(lsb));
                if (bit < m) {
                  const newBit = (bit + u) % m;
                  bs[i]![j]![newBit >> 5] |= 1 << (newBit & 31);
                }
                word ^= lsb;
              }
            }
          }
        }
      }

      // Trace back
      let chosen = 0;
      let val = 0;

      // The last item in bag is bag[m-1] (bucket m-1, index 0 always since bag has 2m-1 items)
      resArr.push(bag[m - 1]!);

      const remain: [number, number][] = [];

      for (let i = m - 1; i >= 1; i--) {
        const u = bkt[i]![chosen]![0] % m;
        val = (val + m - u) % m;

        if (bsTest(bs[i - 1]![0]!, val)) {
          chosen = 0;
        } else {
          chosen = 1;
        }
        remain.push(bag[(chosen ^ 1) * m + i - 1]!);
        resArr.push(bag[chosen * m + i - 1]!);
      }

      return remain;
    }

    // divide: general case for composite m
    function divide(
      resArr: [number, number][],
      bag: [number, number][],
      m: number
    ): [number, number][] {
      {
        const ec = processEasyCase(resArr, bag, m);
        if (ec.found) return ec.bag;
        bag = ec.bag;
      }

      if (m === trace[m]!) {
        return dividePrime(resArr, bag, m);
      }

      const a = trace[m]!;
      const b = m / a;

      let curBag: [number, number][] = [];
      const bktRes: [number, number][][] = Array.from({ length: 2 * b - 1 }, () => []);

      let cur = 0;

      for (let i = 0; i < 2 * b - 1; i++) {
        while (curBag.length < 2 * a - 1) {
          curBag.push(bag[cur]!);
          cur++;
        }
        curBag = divide(bktRes[i]!, curBag, a);
      }
      bag = curBag;

      const bucketOfRemainder: number[][] = Array.from({ length: b }, () => []);
      const bucketForB: [number, number][] = [];

      for (let i = 0; i < 2 * b - 1; i++) {
        let sum = 0;
        for (const j of bktRes[i]!) {
          sum += j[0];
        }
        const val = Math.floor(sum / a) % b;
        // Actually: sum of (weight % m) values, each < m. The sub-team has `a` items
        // summing to 0 mod a. So the sum is divisible by a. (sum/a) % b gives the
        // contribution to the b-level.
        // But we need to be more careful with the modular arithmetic.
        // The C++ code uses: int val = (sum / a) % b;
        // sum here is the sum of (weight % m) values in the sub-team.
        // Since the sub-team sums to 0 mod a, sum is divisible by a.
        // Wait, actually sum of (val%m) for each item. The divide(a) ensures
        // the sum of items is 0 mod a. But items store val%m, not val%a.
        // Let me reconsider: the items store [weight%m, id].
        // In processEasyCase, we do i[0] % m. So items are already %m.
        // For the sub-problem with factor a, we need items with val%a.
        // But actually the C++ code re-buckets by i[0] % m in processEasyCase,
        // and by i % m in dividePrime... wait, the items always store weight%M (the global M).
        // Let me re-read the C++ more carefully.

        // Actually in the C++ code, the items in `bag` always have their first element
        // as weight%M (the original M). The processEasyCase uses i[0] % m (local m),
        // and dividePrime uses bucket[i][j][0] % m. So items always have weight%M stored,
        // but the local routines take them mod the local m parameter.

        // For the composite case: after dividing by factor a, each sub-team of a items
        // has sum (of weight%M values) divisible by a. The val = (sum/a) % b represents
        // the "second level" remainder.

        // Actually, let me reconsider. The items store weight % M. When we do
        // processEasyCase with parameter m (a local m which could be a factor),
        // it groups by item[0] % m. For the prime case, it also uses item[0] % m.
        // This works because if M = a*b, and we first solve mod a, the sub-team
        // sums to 0 mod a. Then (sum/a) % b tells us the contribution at the b level.

        const actualSum = bktRes[i]!.reduce((s, j) => s + j[0], 0);
        const vv = ((actualSum / a) | 0) % b;
        bucketOfRemainder[vv]!.push(i);
        bucketForB.push([vv, 0]);
      }

      const resB: [number, number][] = [];
      let remainB: [number, number][] = [];
      remainB = divide(resB, bucketForB, b);

      for (const item of resB) {
        const u = bucketOfRemainder[item[0]]!.pop()!;
        for (const j of bktRes[u]!) {
          resArr.push(j);
        }
      }
      for (const item of remainB) {
        const u = bucketOfRemainder[item[0]]!.pop()!;
        for (const j of bktRes[u]!) {
          bag.push(j);
        }
      }

      return bag;
    }

    // Form remaining teams using divide
    let curIdx = 0;
    let bag: [number, number][] = [];
    while (group < k - 1) {
      group++;
      while (bag.length < 2 * M - 1) {
        bag.push(allBag[curIdx]!);
        curIdx++;
      }
      bag = divide(res[group]!, bag, M);
    }

    // Final remaining team
    if (group < k) {
      group++;
      for (let i = curIdx; i < allBag.length; i++) {
        bag.push(allBag[i]!);
      }
      res[group] = bag;
    }

    // Check if fewer teams is better
    if (v1 > v2) {
      actualK = k - 1;
    }

    // Build output
    const lines: string[] = [];
    lines.push(`Case #${z}: ${maxRes.toString()} ${actualK}`);
    for (let i = 1; i <= actualK; i++) {
      lines.push(res[i]!.map((j) => j[1]).join(" "));
    }

    outputLines.push(lines.join("\n"));
  }

  return `${outputLines.join("\n")}\n`;
};

export default solution;
