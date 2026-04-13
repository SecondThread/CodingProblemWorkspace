# Monkey Around

Code monkeys love permutations! A group of meta(pri)mates have approached you with a curious array $A$ of length $N$ that they have created via a special process.

They started out with an empty 2D array $B$ of permutations, and repeatedly performed one of the following operations:

1. Choose an integer $k$, and append the identity permutation $p = [1, 2, ..., k]$ to the end of $B$.
2. For each permutation $p$ in $B$, rotate all elements to the left by $1$ index. Formally, each $p = [p_1, p_2, ..., p_k]$ becomes $[p_2, p_3, ..., p_k, p_1]$.

Finally, array $A$ was constructed by flattening $B$. For example, if $B = [[3, 1, 2], [1, 2], [2, 1]]$, then $A = [3, 1, 2, 1, 2, 2, 1]$.

To study these code monkeys, you will need to backtrace their steps. In particular, you'd like to find any sequence of operations the monkeys could've performed to construct $A$, using at most $2 \times N$ operations.

## Constraints

- `1 <= T <= 125`
- `1 <= N <= 400,000`
- `1 <= A_i <= N`

It will always be possible to construct the given $A$ by some valid sequence of operations.

## Input Format

Input begins with an integer $T$ the number of test cases. Each case first contains a line with a single integer $N$, followed by a second line with $N$ space separated integers $A_1, ..., A_N$.

## Output Format

For the $i$-th test case, print `Case #i:` followed by an integer $M$ ($1 \le M \le 2N$), the number of operations that might've been performed, followed $M$ separate lines specifying the sequence of operations:
- `1` $k$ — perform operation $1$ with integer $k$ ($1 \le k \le N$).
- `2` — perform operation $2$

## Sample Explanation

In the first sample case, one possible sequence of operations is as follows:

Initially, $B = []$.
Operation `1 3` yields $B = [[1,2,3]]$.
Operation `2` yields $B=[[2,3,1]]$.
Operation `1 4` yields $B=[[2,3,1],[1,2,3,4]]$.
Operation `2` yields $B=[[3,1,2],[2,3,4,1]]$.
Operation `2` yields $B=[[1,2,3],[3,4,1,2]]$.

After all the operations, the final array $A$ is compiled as $[1,2,3,3,4,1,2]$.
