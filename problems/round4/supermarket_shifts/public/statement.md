# Supermarket Shifts

Christmas is coming, and during your holiday shift it's very important that you get your problems, and gifts, in the right order.

You've been tasked with fixing the ordering shelf of $N$ gifts, initially in positions $1..N$, where each gift has a distinct integer weight between 1 and $N$. Initially, position $i$ is occupied by a gift with weight $A_i$, but you'd like it to instead be the gift with weight $B_i$. This sounds easy, but you just got licensed to operate your company's very unusual forklift, with the following capabilities:

- You may choose (nearly) any two positions and swap the gifts there as long as their *weights* differ by exactly 1.
- There's a special list of pairs of positions which you can never swap gifts between, regardless of the weights of gifts there: $(X_1, Y_1)$, ..., $(X_M, Y_M)$.

Is it possible to correctly order the gifts? If so, what is the minimum number of swaps needed to shift the gifts into the desired order?

## Constraints

- `1 <= T <= 100`
- `1 <= N <= 500,000`
- `0 <= M <= 1,000,000`
- `1 <= A_i, B_i <= N`
- `1 <= X_j, Y_j <= N` and `X_j != Y_j`
- For each test case, all A_i are distinct, all B_i are distinct.
- For each test case, all M unordered pairs (X_j, Y_j) are distinct.

## Input Format

Input begins with an integer `T`, the number of test cases. The first line of each test case contains two integers `N` and `M`. The next line contains `N` integers `A_1, ..., A_N`. The next line contains `N` integers `B_1, ..., B_N`. Then, `M` lines follow, the i-th of which contains two integers `X_i` and `Y_i`.

## Output Format

For the i-th test case, print `Case #i:` followed by a single integer, the minimum number of swaps for the gifts to be shifted to desired order, or `-1` if it's impossible.

## Sample Explanation

In the first test case, the minimum number of required moves is 4. It can be done by swapping the gifts in the following order:
- Position 2 with 4
- Position 3 with 4
- Position 1 with 2
- Position 5 with 6

None of these moves swap restricted pairs of positions.

In the second test case, we can prove that using the allowed operation, it is not possible to shift the gifts to the intended positions.
