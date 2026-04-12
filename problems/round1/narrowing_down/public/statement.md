# Narrowing Down

Robert Jr. just got a job massaging down feathers so they can fit into winter jackets.

Frequently, Robert is given an array of feathers with initial heights $H_1, ..., H_m$, which he needs to "flatten", i.e. massage until all feather heights in that array become $0$. To do that, he can perform the following operation for cost $1$, as many times as necessary:

- Pick an integer $i$ $(1 \le i < m)$ and any positive integer $x$ and both:
  - change height $H_i$ to $H_i \oplus x$, and
  - change height $H_{i+1}$ to $H_{i+1} \oplus x$

> where $\oplus$ is the bitwise XOR operator.

If it's not possible to make all heights $0$ by applying the operation any number of times, then the cost is the length of the array, $m$.

Given an array $A$, determine the sum of costs to flatten all contiguous subarrays of $A$. Formally, define $f(H)$ to be the minimum number of operations needed to flatten array $H$. Please calculate $\sum f(A_{l..r})$ over all $1 \le l \le r \le N$.

## Constraints

- `1 <= T <= 95`
- `1 <= N <= 1,000,000`
- `0 <= A_i < 2^30`

## Input Format

Input begins with a single integer `T`, the number of test cases. For each test case, the first line is a single integer `N`. The second line contains `N` space-separated integers `A_1, ..., A_N`.

## Output Format

For the `i`-th test case, print `Case #i:` followed by a single integer, the sum of costs of all contiguous subarrays of $A$.

## Sample Explanation

In the first sample, we should consider the subarrays: $[0]$, $[0]$, and $[0, 0]$. Each of these require no operations, for a total cost of $0$.

In the second sample the costs of each subarray are listed below:
- $f(A_{1...1}) = 1$ (because it cannot be flattened, so the cost is $1$, the length of the subarray)
- $f(A_{1...2}) = 1$ (because it can be flattened with a single operation using $i = 1$, and $x = 1$)
- $f(A_{1...3}) = 3$
- $f(A_{2...2}) = 1$
- $f(A_{2...3}) = 1$
- $f(A_{3...3}) = 1$

The total cost is $1 + 1 + 3 + 1 + 1 + 1 = 8$.
