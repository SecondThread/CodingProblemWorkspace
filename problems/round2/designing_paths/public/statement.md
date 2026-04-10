# Designing Paths

Whacker Cup, Meta's internal tennis tournament, will be held on $N$ tennis courts (numbered `1..N`) across the company campus. Court `1` is Whacker Square, where the opening ceremony is held.

Afterwards, competitors will disperse to the other courts via the $M$ tram routes (numbered `1..M`) available on campus. Each route `i` visits a sequence of `L_i >= 2` distinct courts `A_{i,1} -> ... -> A_{i,L_i}`.

In one tram ride, a rider can board a route that visits their current location, ride at most `K` stops, and get off. For example, if `K = 2` and a route visits courts `1 -> 5 -> 7 -> 2`, then with one ride:
* A rider can board at court `1` and deboard at either court `5` or `7`
* A rider can board at court `5` and deboard at either court `7` or `2`
* A rider can board at court `7` and deboard at court `2`

As CTO (Chief Transportation Officer), you'd like to ensure the campus is sufficiently accessible. For a given destination `x`, let `D(x)` be the minimum number of tram rides needed to get from court `1` to court `x`, or `-1` if it's impossible to do so. Please calculate the sum of `D(i) * i` for `i = 1..N`.

## Constraints

- `1 <= T <= 100`
- `2 <= N <= 500,000`
- `1 <= K < N`
- `1 <= M <= 500,000`
- `2 <= L_i <= N`
- `1 <= A_{i,j} <= N`
- The stops on any given route are distinct.
- The sum of `L_i` across all routes is at most `1,000,000`.

## Input Format

Input begins with an integer `T`, the number of test cases. The first line of each case contains three space-separated integers `N`, `K`, and `M`. `M` lines follow, the `i`-th of which contains an integer `L_i` followed by `L_i` integers `A_{i,1}, ..., A_{i,L_i}`.

## Output Format

For the `i`-th test case, print `Case #i:` followed by a single integer, the sum of `D(i) * i` over all destination courts `i = 1..N`.

## Sample Explanation

In the first sample case, there are `N = 7` tennis courts and competitors can ride at most `K=2` stops on each of the `M = 2` tram routes (`1 -> 5 -> 7 -> 2` and `2 -> 3 -> 4`).

The values of `D` are: `D(1) = 0`, `D(2) = 2`, `D(3) = 3`, `D(4) = 3`, `D(5) = 1`, `D(6) = -1`, `D(7) = 1`.

The final answer is `1*0 + 2*2 + 3*3 + 4*3 + 5*1 + 6*(-1) + 7*1 = 31`.
