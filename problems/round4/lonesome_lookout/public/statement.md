# Lonesome Lookout

To help keep his GPUs safe, Santa has enlisted the aid of the Nutcracker Army to keep watch over his workshop, represented as a grid of $R$ rows and $C$ columns.

When stationed at any cell in the grid, a Nutcracker guard will have lines of sight on its entire row and column. A guard is *lonesome* if it cannot see any other guards.

There are already $N$ guards stationed at distinct cells, the i-th of which is at row $X_i$ and column $Y_i$. The guards are not necessarily all lonesome.

Santa is considering stationing more guards across the remaining $R \cdot C - N$ empty cells, and reckons there are $2^{(R \cdot C - N)}$ possible configurations (for each empty cell, he can either add a guard there or not). Let $f(k)$ denote the number of these configuration(s) containing exactly $k$ lonesome guards, modulo $10^9 + 7$. Santa needs you to find each $f(k)$ for $k = 0, ..., \min(R, C)$.

To limit the output size, please instead print the value of $g(0) \oplus g(1) \oplus \dots \oplus g(\min(R, C))$, where $g(k) := (f(k) + 1220) \cdot (k + 2025)$ and $\oplus$ is the bitwise XOR operator.

## Constraints

- `1 <= T <= 80`
- `1 <= R, C <= 10^6`
- `0 <= N <= min(R*C, 10^6)`
- `1 <= X_i <= R`
- `1 <= Y_i <= C`
- All coordinates (X_i, Y_i) in a given test case are distinct.

## Input Format

Input begins with an integer `T`, the number of test cases. The first line of each case contains three integers `R`, `C`, and `N`. `N` lines follow, the i-th of which contains two integers `X_i` and `Y_i`.

## Output Format

For the i-th test case, print `Case #i:` followed by a single integer, the value of $g(0) \oplus g(1) \oplus \dots \oplus g(\min(R, C))$.

## Sample Explanation

In the first sample case, the base configuration with N=3 guards is depicted below. Only the middle guard is lonesome.

There are 7 configurations that yield k = 0 lonesome guards. There is 1 configuration that yields k = 1 lonesome guard (not changing the base configuration). There are 0 configurations that yield k = 2 lonesome guards.

Thus, f(0) = 7, f(1) = 1, f(2) = 0, and:
- g(0) = (7 + 1220) * (0 + 2025) = 2,484,675
- g(1) = (1 + 1220) * (1 + 2025) = 2,473,746
- g(2) = (0 + 1220) * (2 + 2025) = 2,472,940

The final answer is 2,484,675 XOR 2,473,746 XOR 2,472,940 = 2,485,565.
