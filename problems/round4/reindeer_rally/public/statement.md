# Reindeer Rally

The big night is coming, and Santa had originally arranged for $N$ teams of reindeer to fly his sleigh. Each team has $M$ reindeer, but some teams may have 1 extra backup reindeer (totaling $M+1$). For identification later, reindeer $j$ on original team $i$ is given a unique ID of $(i - 1) \cdot (M + 1) + j$, where $i$ and $j$ are 1-based, and $j = M+1$ for the backup reindeer (if any).

Each reindeer also has a weight, given by the $N \times (M + 1)$ matrix $W$ where:
- $W_{i,j}$ = the weight of the j-th reindeer on team $i$ (if $j \le M$)
- $W_{i,M+1}$ = the weight of team $i$'s backup reindeer, or $-1$ if it doesn't have a backup.

Unfortunately, these specific team assignments won't matter, since Santa has decided to shuffle them around to encourage new reindeer friendships. In particular, he disbanded all the original teams and now wishes to form new teams with the reindeer (and backup reindeer) as follows:
- New teams must have exactly $M$ reindeer (no need for backups).
- Each reindeer can belong to at most one new team (so some reindeer can be unassigned).

Santa wants to maximize the *net effectiveness* of the new teams formed, which depends on two integer parameters $A$ and $B$.
- Each new team formed adds an effectiveness of $A$ points.
- Each new team $i$ incurs a penalty of $B \cdot b(i)$ points, where $b(i)$ is the *balance* of new team $i$, defined as the total weight of its reindeer modulo $M$.

Please find a valid new team arrangement so that the net effectiveness is maximized.

## Constraints

- `1 <= T <= 70`
- `1 <= N <= 200,000`
- `1 <= M <= 10,000`
- `1 <= A, B <= 10^9`
- `1 <= W_{i,1..M} <= 10^9`
- `1 <= W_{i,M+1} <= 10^9` or `W_{i,M+1} = -1` (if lacking a backup)
- Total number of reindeer in each test case is at most 200,000.

## Input Format

Input begins with an integer `T`, the number of test cases. The first line of each case contains four integers `N`, `M`, `A`, and `B`. Then, `N` lines follow, the i-th of which contains `M+1` integers `W_{i,1}`, ..., `W_{i,M+1}`.

## Output Format

For the i-th test case, print `Case #i:` followed by two integers, the net effectiveness and the number of newly formed teams `K`. Then, output `K` lines of `M` integers each, representing the original IDs of the reindeer for the new team assignment.

## Sample Explanation

In the first sample case, N = 2, M = 3, A = 14, and B = 11. There are 7 reindeer with IDs 1, 2, 3, 5, 6, 7, 8 and weights 4, 6, 1, 10, 13, 4, 3 respectively.

One optimal team assignment is:
- Leave reindeer 1 unassigned.
- Make a team with reindeer 3, 5, 6. The balance of this team is (1 + 10 + 13) mod 3 = 0, incurring no penalty for being perfectly balanced!
- Make a team with reindeer 8, 2, 7. The balance of this team is (3 + 6 + 4) mod 3 = 1, incurring a penalty of 11 points.

The net effectiveness is 14 * 2 - (0 + 11) = 17.
