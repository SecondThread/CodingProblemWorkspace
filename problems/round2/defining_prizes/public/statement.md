# Defining Prizes

Tasky, Meta's newest employee, is tasked with distributing prizes for Whacker Cup, Meta's internal tennis tournament. Tasky will write a program to dynamically assign prizes depending on the final scores as well as Meta's merchandise inventory. The program will take the following parameters:
- `N`: the number of competitors (competitors are numbered `1..N`)
- `M`: the number of merchandise types in Meta's stockpile (types are numbered `1..M`)
- `A_1, ..., A_N`: the scores attained by each competitor `1..N`
- `B_1, ..., B_M`: the units available of each merchandise type `1..M`

Tasky would like to maximize the number of competitors receiving prizes, while ensuring that each competitor receives at most one unit of each merch type. However, if any competitor is unhappy with the distribution, Tasky will be terminated immediately.

A unrewarded competitor will be unhappy if:
* any other competitor with equal or lower score receives any merchandise at all.

A rewarded competitor will be unhappy if either:
* any other competitor of strictly lower score receives equal or more units of merchandise, or
* any other competitor with equal score receives more units of merchandise.

Please help Tasky determine the maximum number of competitors that can be rewarded.

## Constraints

- `1 <= T <= 85`
- `1 <= N, M <= 1,000,000`
- `0 <= A_i <= 1,000,000`
- `0 <= B_i <= 1,000,000`

## Input Format

Input begins with an integer `T`, the number of test cases. The first line of each case contains two space-separated integers `N` and `M`. The next line contains `N` integers `A_1, ..., A_N`. The next line contains `M` integers `B_1, ..., B_M`.

## Output Format

For the `i`-th test case, print `Case #i:` followed by a single integer, the maximum number of prize recipients possible without Tasky being terminated.

## Sample Explanation

In the first sample case, there are `N=3` competitors with scores `[1, 2, 3]`, and `M=2` types of merch with unit counts `[1, 2]`. One optimal distribution is:
* Competitor `3` receives `1` unit of type-`1` merch and `1` unit of type-`2` merch (for `2` units in total), leaving `1` unit of type-`2` merch remaining.
* Competitor `2` receives `1` unit of type-`2` merch (for `1` unit in total).
* Competitor `1` receives nothing.
