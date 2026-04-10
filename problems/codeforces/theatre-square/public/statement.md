# Theatre Square

This problem is adapted from Codeforces 1A, but the input and output format follow the Hacker Cup convention.

You are given `T` test cases. In each test case, you are given three integers:

- `n`: the length of the square
- `m`: the width of the square
- `a`: the side length of each square flagstone

The square must be covered by square flagstones of size `a x a`. Flagstones may extend past the border of the square, but they must stay aligned with the sides. Determine the minimum number of flagstones needed.

For each test case, print `Case #x: y`, where `y` is the minimum number of flagstones.

## Input Format

- The first line contains one integer `T`.
- Each of the next `T` lines contains three integers `n`, `m`, and `a`.

## Output Format

- Print exactly one line per test case.
- The line for case `i` must be `Case #i: y`.

## Constraints

- `1 <= T`
- `1 <= n, m, a <= 10^9`

