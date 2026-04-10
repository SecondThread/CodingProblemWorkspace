# Snake Scales (Chapter 2)

_This problem shares similarities with chapter 1. Chapter 2 involves the ground, and larger bounds._

Solid Snake is back at work scaling Metal Platforms! This time, he is bringing his own ladder.

Solid Snake needs to inspect $N$ platforms, numbered $1$ to $N$. The $i$-th platform is a horizontal line segment from points $(i, A_i)$ to $(i+1, A_i)$, inclusive. He can travel between two platforms with a ladder of height $h$ or greater if there exists a _vertical_ line segment of length $h$ that intersects both platforms.

**Additionally, Solid Snake may travel between any platform and the ground** if his ladder is long enough. The ground can be modeled as a segment from $(0, 0)$ to $(N+1, 0)$. **Solid Snake starts on the ground**.

Metal Platforms Inc. has tasked you to write a program, "Scale AI", to find the length of the shortest ladder that Solid Snake needs to visit each platform at least once, starting from the ground.

## Constraints

- `1 <= T <= 80`
- `1 <= N <= 500,000`
- `1 <= A_i <= 10^9`

## Input Format

Input begins with a single integer `T`, the number of test cases. The first line of each case is a single integer `N`. The second line of each case contains `N` space-separated integers `A_1, ..., A_N`.

## Output Format

For the `i`-th test case, print `Case #i:` followed by the length of the shortest ladder that Solid Snake needs to visit each platform at least once.

## Sample Explanation

In the first sample case, there are `N=5` platforms with heights `A = [2, 4, 5, 1, 4]` respectively. Solid Snake starts at ground level. To be able to access all the platforms, Solid Snake needs a ladder of at least height `3`, with potential placements shown below. Solid Snake can scale the first `3` platforms, then come back down to ground level, before scaling the last `2` platforms.
