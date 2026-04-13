# Streetlamp Safety

Proven to be a handy AI assistant for DIY, Tasky has been promoted to a streetlamp operator for the city, with the main task being to optimize streetlamp on/off states for cost and safety.

A street has $N$ lamps in a row, numbered from $1..N$. Initially, all lamps are off, but lamp $i$ costs $A_i$ to turn on.

Tasky must find an overall configuration for all the lamps so the street is *sufficiently-lit* for safety. Specifically, for each $i = 1..N$, there needs to be a consecutive run of at least $B_i$ turned-on lamps ending at or before lamp $i$.

Tasky needs to find minimum cost to satisfy the safety code.

## Constraints

- `1 <= T <= 65`
- `1 <= N <= 6,000`
- `1 <= A_i <= 10^9`
- `0 <= B_i <= i`

## Input Format

Input begins with an integer `T`, the number of test cases. The first line of each case contains a single integer `N`. The second line contains `N` space-separated integers `A_1, ..., A_N`. The third line contains `N` space-separated integers `B_1, ..., B_N`.

## Output Format

For the i-th test case, print `Case #i:` followed by a single integer, the minimum cost to sufficiently light the street.

## Sample Explanation

In the first sample case, turning on the second and third lamps will cost $1 + $2 = $3. All three conditions are satisfied.

In the second sample case, turning on the first three lamps is required, and will cost $15.
