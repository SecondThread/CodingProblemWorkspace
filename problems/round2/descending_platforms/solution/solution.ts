import type { ProblemSolution } from "../../../../src/contracts/problem";

function ceilDiv(a: bigint, b: bigint): bigint {
  return (a + b - 1n) / b;
}

function solveCase(n: number, m: bigint, a: bigint[]): string {
  // Compute prefix sums
  const p: bigint[] = new Array(n);
  p[0] = a[0]!;
  for (let i = 1; i < n; i++) {
    p[i] = a[i]! + p[i - 1]!;
  }

  // Sort indices by P[i]/(i+1) ratio using cross-multiplication
  const order: number[] = Array.from({ length: n }, (_, i) => i);
  order.sort((x, y) => {
    const lhs = p[x]! * BigInt(y + 1);
    const rhs = p[y]! * BigInt(x + 1);
    if (lhs < rhs) return -1;
    if (lhs > rhs) return 1;
    return 0;
  });

  const maxRem = n * n;

  if (n === 1) {
    // Special case: only one platform
    const height = ceilDiv(m, a[0]!);
    return `${String(height)}\n${String(height)}`;
  }

  // 1D DP for unbounded knapsack
  // dp[rem] = max total amazingness achievable using items order[0..N-2]
  // with rem total bricks
  const dp = new Float64Array(maxRem + 1);
  dp.fill(-1);
  dp[0] = 0;

  // Process items from order[0] to order[N-2] (unbounded knapsack)
  // For reconstruction, we need to know which items were used.
  // Store the last item added at each state.
  const from = new Int16Array(maxRem + 1);
  from.fill(-1);

  // We need to process items in order. For unbounded knapsack with multiple
  // item types, we process each item type and iterate forward.
  // dp[rem] = max amazingness using any combination of items order[0..N-2]
  // where item order[x] has weight (order[x]+1) and value p[order[x]]

  // Actually, the C++ code processes items from x=N-2 down to 0, and each
  // item is unbounded. The recurrence is:
  //   dp[x][rem] = max(dp[x+1][rem], dp[x][rem-w] + val)
  // This is standard unbounded knapsack. With 1D array, process each item
  // and iterate rem forward.

  // Reset for proper 1D unbounded knapsack
  dp.fill(0); // dp[rem] = 0 for all rem initially (base case: no items used)

  // For reconstruction, we need to track which items contribute.
  // Store for each (item_index, rem) whether the item was used.
  // That's too much memory. Instead, after finding optimal rem, re-derive.

  // Phase 1: compute optimal dp values
  for (let x = n - 2; x >= 0; x--) {
    const idx = order[x]!;
    const w = idx + 1;
    const val = Number(p[idx]!);
    for (let rem = w; rem <= maxRem; rem++) {
      const candidate = dp[rem - w]! + val;
      if (candidate > dp[rem]!) {
        dp[rem] = candidate;
      }
    }
  }

  // Find optimal total bricks
  const lastIdx = order[n - 1]!;
  const lastVal = p[lastIdx]!;
  const lastW = BigInt(lastIdx + 1);

  let bestTotal = BigInt("9007199254740991");
  let bestRem = 0;
  for (let i = 0; i <= maxRem; i++) {
    const remVal = m - BigInt(Math.round(dp[i]!));
    let total = BigInt(i);
    if (remVal > 0n) {
      total += ceilDiv(remVal, lastVal) * lastW;
    }
    if (total < bestTotal || (total === bestTotal && i < bestRem)) {
      bestTotal = total;
      bestRem = i;
    }
  }

  // Phase 2: Reconstruct which items were used
  // Re-run the DP, but this time track which item was last used at each rem.
  // We need a separate reconstruction pass.
  const dpRecon = new Float64Array(maxRem + 1);
  dpRecon.fill(0);
  // lastUsed[rem] = index into order array of the last item that improved dp[rem]
  const lastUsed = new Int16Array(maxRem + 1);
  lastUsed.fill(-1);

  for (let x = n - 2; x >= 0; x--) {
    const idx = order[x]!;
    const w = idx + 1;
    const val = Number(p[idx]!);
    for (let rem = w; rem <= maxRem; rem++) {
      const candidate = dpRecon[rem - w]! + val;
      if (candidate > dpRecon[rem]!) {
        dpRecon[rem] = candidate;
        lastUsed[rem] = x;
      }
    }
  }

  // Trace back to find opt counts
  const opt: bigint[] = new Array(n).fill(0n);
  let r = bestRem;
  while (r > 0 && lastUsed[r]! !== -1) {
    const x = lastUsed[r]!;
    const idx = order[x]!;
    const w = idx + 1;
    opt[idx] = opt[idx]! + 1n;
    r -= w;
  }

  // Handle last item
  const remVal = m - BigInt(Math.round(dpRecon[bestRem]!));
  if (remVal > 0n) {
    opt[lastIdx] = ceilDiv(remVal, lastVal);
  }

  // Convert to actual heights: opt[i] are increments; prefix sum from end
  for (let i = n - 2; i >= 0; i--) {
    opt[i] = opt[i]! + opt[i + 1]!;
  }

  const totalBricks = opt.reduce((s, v) => s + v, 0n);
  return `${String(totalBricks)}\n${opt.map(String).join(" ")}`;
}

const solution: ProblemSolution = (input: string): string => {
  const lines = input.trim().split("\n").map((l) => l.trim());
  const t = Number(lines[0]!);
  let lineIndex = 1;
  const results: string[] = [];

  for (let c = 1; c <= t; c++) {
    const parts = lines[lineIndex]!.split(/\s+/);
    const n = Number(parts[0]!);
    const m = BigInt(parts[1]!);
    lineIndex++;
    const aTokens = lines[lineIndex]!.split(/\s+/);
    const a: bigint[] = aTokens.map((v) => BigInt(v));
    lineIndex++;
    results.push(`Case #${String(c)}: ${solveCase(n, m, a)}`);
  }

  return results.join("\n") + "\n";
};

export default solution;
