# Final Product (Chapter 2)

_This chapter shares similarities with chapter 1, with key differences highlighted in bold._

Meta employees love two things: building cool products and scaling them up. As a new intern, you just started work on a cool product, but you want to make it even cooler during your internship.

Initially, your empty product has coolness $1$. Each of the next $2 \times N$ days, you'll make a change, multiplying your product's coolness by any positive integer of your choice subject to the following requirements:
- After the first $N$ days, the coolness can be _at most_ $A$ (you're new to the codebase, so you shouldn't scale too quickly).
- After all $2 \times N$ days, your product should have coolness _exactly_ $B$.

Please **calculate how many sequences** of $2 \times N$ changes exist that yield a final product of coolness $B$, while ensuring a coolness of at most $A$ after day $N$. As this number can be quite large, print it modulo $10^9+7$.

## Constraints

- `1 <= T <= 150`
- `1 <= N <= 10^16`
- `1 <= A <= 10^14`
- `1 <= B <= 10^14`

Note: **This chapter allows for much larger input than Chapter 1.**

## Input Format

Input begins with a single integer `T`, the number of test cases. Each case is a single line of three space-separated integers `A`, `B`, and `N`.

## Output Format

For the `i`-th test case, print `Case #i:` followed by a single integer, the number of sequences of `2 * N` nonnegative multipliers satisfying the above requirements, modulo `10^9 + 7`.

## Sample Explanation

In the second test case, there are $12$ sequences which satisfy the requirements of having coolness at most $10$ after day $2$ and exactly $15$ after day $4$. Four of these 12 are:

- $[5, 1, 3, 1]$
- $[5, 1, 1, 3]$
- $[3, 1, 5, 1]$
- $[3, 1, 1, 5]$
