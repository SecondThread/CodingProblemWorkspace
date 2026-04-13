# Warm Up

Chef Alfredo is catering his friend Benji's wedding, and has $N$ dishes (numbered from $1$ to $N$) that need to simultaneously go out at specific temperatures. Dish $i$ is currently at $A_i$ degrees, and must reach a target temperature of exactly $B_i$ degrees.

While he has a fancy thermometer, he prefers to rely on his chef instincts to avoid constant measuring. His strategy is to repeatedly apply the following operation: pick two dishes $i$ and $j$ of different temperatures and warm up the colder dish to match the temperature of the hotter dish.

Please help Alfredo find a sequence of *at most* $N$ such operations to get the $N$ dishes to their target temperatures, or determine that it's impossible.

## Constraints

- `1 <= T <= 95`
- `1 <= N <= 500,000`
- `1 <= A_i <= N`
- `1 <= B_i <= N`

## Input Format

Input begins with an integer $T$, the number of test cases. The first line of each case contains a single integer $N$. The second line of each case contains $N$ space-separated integers $A_1, ..., A_N$, representing the current temperatures. The third line of each case contains $N$ space-separated integers $B_1, ..., B_N$, representing the target temperatures.

## Output Format

For the $i$-th test case, if it's possible to reach the target temperatures, output `Case #i:` followed by an integer $K$ ($0 \le K \le N$), followed by $K$ separate lines, each containing two space-separated integers $i$ $j$ indicating the pairs of dishes to apply the aforementioned operation. If it's impossible, output `Case #i: -1`.

## Sample Explanation

In the first test case, the temperatures are already perfect, so no operations are required.

In the second test case, the temperatures are initially $[1, 1, 2]$. After the first operation, they become $[2, 1, 2]$. After the second operation, they become $[2, 2, 2]$, matching the desired temperatures.

In the fourth test case, we see that it's not possible to reach the ending set of temperatures $[1, 2, 3, 3]$ from the starting temperatures $[1, 2, 3, 4]$ using the allowed operations.
