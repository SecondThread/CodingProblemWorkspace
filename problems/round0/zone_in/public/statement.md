# Zone In

When you use the Meta Quest, you set up a "Guardian boundary", a safe zone for you to move around in within VR. You're trying to figure out the size of the largest Guardian boundary that you can make inside your house.

Your house is represented as an $R \times C$ grid surrounded by a wall on each side, where every cell is either `.`, representing empty space, or `#`, representing an object.

To ensure that you don't hit anything while playing, you want to find the largest contiguous space in your house such that every cell is at least $S$ spaces between itself and the nearest object or wall. **Formally, the shortest path (traveling only up, down, left, or right) from a safe zone cell to the nearest object or wall must visit $S$ or more spaces, not including the start/end cells.**

## Constraints

- `1 <= T <= 70`
- `1 <= R, C <= 1,000,000`
- `1 <= R * C <= 1,000,000`
- `1 <= S <= 1,000`

The sum of $R \times C$ across all test cases is at most $5,000,000$.

## Input Format

Input begins with an integer $T$, the number of test cases. Each case starts with a line that contains the integers $R$, $C$, and $S$. Then $R$ lines of $C$ characters follow, representing your house. Every character is either `.` or `#`.

## Output Format

For the $i$-th test case, print `Case #i:` followed by the size of the largest contiguous space you can play in that satisfies the safety parameter, $S$.

## Sample Explanation

In the first case, there are no objects in your house, so you can safely play in the $3 \times 3$ area that's at least $S = 1$ cell away from the exterior walls.

```
.....
.***.
.***.
.***.
.....
```

In the second case, no space in your house is at least $S = 2$ cells away from the exterior walls and objects.

In the third case, the spaces that are at least $S = 1$ cell away from both the exterior walls and all objects are shown below:

```
.......
.*.*.*.
..#.#..
..#..*.
.*.***.
.*****.
.......
```

The largest contiguous safe space contains $10$ cells.
