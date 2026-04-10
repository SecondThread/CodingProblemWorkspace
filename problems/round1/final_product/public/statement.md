# Final Product (Chapter 1)

_This chapter shares similarities with chapter 2, with key differences highlighted in bold._

Meta employees love two things: building cool products and scaling them up. As a new intern, you just started work on a cool product, but you want to make it even cooler during your internship.

Initially, your empty product has coolness $1$. Each of the next $2 \times N$ days, you'll make a change, multiplying your product's coolness by any positive integer of your choice subject to the following requirements:
- After the first $N$ days, the coolness can be _at most_ $A$ (you're new to the codebase, so you shouldn't scale too quickly).
- After all $2 \times N$ days, your product should have coolness _exactly_ $B$.

Please **find any sequence** of $2 \times N$ changes you can make to get a final product of coolness $B$, while ensuring a coolness of at most $A$ after day $N$. If there are multiple valid solutions, any will be accepted. It can be proven that at least one solution will exist.

## Constraints

- `1 <= T <= 50`
- `1 <= N <= 100`
- `1 <= A <= 100`
- `1 <= B <= 100`

## Input Format

Input begins with a single integer `T`, the number of test cases. Each case is a single line of three space-separated integers `N`, `A`, and `B`.

## Output Format

For the `i`-th test case, print `Case #i:` followed by a sequence of `2 * N` nonnegative integers, the multipliers for each day.

## Sample Explanation

In the first sample case, your product must have a coolness of at most $A=5$ after day $N=2$, and a coolness of exactly $B=63$ after all $2 \times N = 4$ days. One possible solution is to scale up by $[1, 3, 3, 7]$ respectively. After each day, this leaves coolnesses of $[1, 3, 9, 63]$ at the end of each day respectively.

While there are multiple acceptable solutions to this case, one solution that would not be accepted is $[7, 1, 3, 3]$ because it has coolness $7 \times 1$ after $2$ days, which is too cool for school.

Please note (as shown in the fourth sample case), $A$ is not necessarily less than or equal to $B$.
