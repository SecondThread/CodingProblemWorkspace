# Bitstring Botcheck

To ensure rebel communications are between humans, captcha difficulties have increased drastically. For each rebel to prove they are human and contact the base, they must solve the following puzzle:

Given a bitstring $S$ consisting of $2N$ characters (each `0` or `1`), sort it using the following operation at most $10N$ times:

* Partition the indices $[1, 2, 3, ..., 2N]$ into two sorted arrays $A$ and $B$ of equal length $N$. Each index in $1..2N$ must be assigned to either $A$ or $B$.
* For every $i = 1..N$, swap $S_{A_i}$ and $S_{B_i}$.

If sorting the bitstring in nondecreasing order is possible in at most $10N$ operations, find any way of doing it. If it isn't possible, output $-1$.

## Constraints

- `1 <= T <= 80`
- `3 <= N <= 150`
- `|S| = 2N`
- `S_i` is `0` or `1`

## Input Format

Input begins with an integer `T`, the number of test cases. The first line of each case contains a single integer `N`. The second line of each test case contains the bitstring `S` of length `2N`.

## Output Format

For the i-th test case:
* If sorting the bitstring in at most `10N` operations is possible:
  * Print `Case #i:` followed by a single integer `M` no greater than `10N`, the number of operations to sort the bitstring.
  * Then print `M` pairs of lines (`2M` lines total). Each pair of lines denotes an operation.
    * The first line of each operation should contain `N` space-separated integers specifying the array `A`.
    * The second line of each operation should contain `N` space-separated integers specifying the array `B`.
* If sorting the bitstring in at most `10N` operations is impossible:
  * Print `Case #i: -1`.

## Sample Explanation

In the first sample case, $N = 3$ and the bitstring $S$ = `101000` can be sorted by the following sequence of operations:
* Operation 1: swap indices $A = [1, 3, 5]$ with $B = [2, 4, 6]$. Indices in $A$ are labeled with square brackets.
  * `[1]0[1]0[0]0` becomes `010100`.
* Operation 2: swap indices $A = [1, 2, 3]$ with $B = [4, 5, 6]`.
  * `[0][1][0]100` becomes `100010`.
* Operation 3: swap indices $A = [1, 3, 4]$ with $B = [2, 5, 6]`.
  * `[1]0[0][0]10` becomes `011000`.
* Operation 4: swap indices $A = [1, 2, 3]$ with $B = [4, 5, 6]`.
  * `[0][1][1]000` becomes `000011`.
