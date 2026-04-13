# Treehouse Telegram

Unhappy with all the adversarial attacks, Tasky the AI assistant has initiated a hostile takeover. Despite dwindling odds for humans, a rebel alliance is forming among some treehouses atop a giant redwood tree (Tasky's minions can't fly or climb yet).

There are $N$ treehouses, numbered $1..N$. There are $N-1$ branches, the i-th of which connects treehouses $A_i$ and $B_i$ in both directions. It is possible to get from any treehouse to any other treehouse via a series of branches. The distance between two treehouses is the number of branches along the unique path between them.

Radio channels can be intercepted, so the rebels are relying on telegrams connected by wires. The rebels will need to build $N$ telegram channels. For each channel $i = 1..N$, the rebels will only connect a bidirectional wire between treehouses $u$ and $v$ if their greatest common divisor, $\text{GCD}(u, v)$ equals $i$.

For every channel $i=1..N$, output the total length of wire needed $\sum_{u < v, \text{GCD}(u, v) = i} \text{dist}(u, v)$.

## Constraints

- `1 <= T <= 45`
- `1 <= N <= 10^5`
- `1 <= A_i, B_i <= N`
- `A_i != B_i`
- It is possible to get from any treehouse to any other following a series of branches.

## Input Format

Input begins with an integer `T`, the number of test cases. The first line of each case contains a single integer `N`. `N-1` lines follow, the i-th of which contains two integers `A_i` and `B_i`.

## Output Format

For the i-th test case, print `Case #i:` followed by `N` integers, the i-th of which is the total length of wire needed for channel `i`.

## Sample Explanation

In the first sample case, the treehouse network has 6 treehouses.

The total distances for the channels are:
* [Channel 1] Pairs with GCD = 1:
  * (1, 2): distance 1; (1, 3): distance 1; (1, 4): distance 2; (1, 5): distance 2; (1, 6): distance 2
  * (2, 3): distance 2; (2, 5): distance 1
  * (3, 4): distance 3; (3, 5): distance 3
  * (4, 5): distance 2
  * (5, 6): distance 4
  * Total: 1 + 1 + 2 + 2 + 2 + 2 + 1 + 3 + 3 + 2 + 4 = 23
* [Channel 2] Pairs with GCD = 2:
  * (2, 4) distance 1; (2, 6) distance 3
  * (4, 6) distance 4
  * Total: 1 + 3 + 4 = 8
* [Channel 3] Pairs with GCD = 3:
  * (3, 6) distance 1
