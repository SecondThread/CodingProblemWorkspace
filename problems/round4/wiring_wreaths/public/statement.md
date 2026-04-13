# Wiring Wreaths

Santa is setting up his decorations at the North Pole. He plans to connect $N$ wreaths (numbered $1..N$) using $M$ wires, the i-th of which connects wreaths $A_i$ and $B_i$ in both directions. Wreaths may be wired in cycles, but each wire belongs to at most one cycle. Dreaming of a warmer climate, he realized that he accidentally just made a [cactus graph](https://en.wikipedia.org/wiki/Cactus_graph). Wreath $i$ is also decorated with $C_i$ lights, where $C_i$ is between 0 and $N-1$ (inclusive) and not necessarily distinct.

Santa wants to put his GPUs to the test, so he's decided to compute an expensive function $f(s, t)$ based off all the simple paths from $s \to t$:

- For a simple path $P = [v_1, v_2, ...]$, let $\text{mex}(P) := \text{mex}(\{C_{v_1}, C_{v_2}, ...\})$ be the minimum excluded value of wreath light counts on $P$ (i.e. the minimum integer in $[0, N]$ not equal to any $C_i$ for any wreath $i$ on path $P$).
- Let $f(s, t) := \text{max}(\text{mex}(P))$ across all simple paths $P$ from $s$ to $t$.

Please help evaluate the sum of $f(s, t)$ across all unordered pairs of wreaths.

## Constraints

- `1 <= T <= 100`
- `3 <= N <= 100`
- `1 <= A_i, B_i <= N`; `A_i != B_i`
- `0 <= C_i < N`
- All unordered pairs (A_i, B_i) are distinct.
- The given wiring is a cactus graph (all wreaths are connected, and any two simple cycles have at most one wreath in common).

## Input Format

Input begins with an integer `T`, the number of test cases. The first line of each case contains two integers `N` and `M`. The second line of each case contains `N` integers `C_1, ..., C_N`. `M` lines follow, the i-th of which contains two integers `A_i` and `B_i`.

## Output Format

For the i-th test case, print `Case #i:` followed by a single integer, the sum of $f(s, t)$ across all unordered pairs of wreaths.

## Sample Explanation

The first sample case has 4 wreaths with lights [0, 1, 2, 0].

- f(1,2) = 3: the path 1 -> 3 -> 2 yields a maximal mex({0, 2, 1}) = 3
- f(1,3) = 3: the path 1 -> 2 -> 3 yields a maximal mex({0, 1, 2}) = 3
- f(1,4) = 3: the path 1 -> 3 -> 2 -> 4 yields a maximal mex({0, 1, 2, 0}) = 3
- f(2,3) = 3: the path 2 -> 1 -> 3 yields a maximal mex({1, 0, 2}) = 3
- f(2,4) = 2: the only simple path 2 -> 4 yields mex({1, 0}) = 2
- f(3,4) = 3: the path 3 -> 1 -> 2 -> 4 yields a maximal mex({2, 0, 1, 0}) = 3

The answer is 3+3+3+3+2+3 = 17.
