# Patchwork Pyramid

Pascal is redoing his bathroom floor with the help of Tasky, Meta's new AI assistant. The bathroom is a triangular grid of side length $N$. Formally, it's a grid of $N$ rows numbered from $1..N$, with row $i$ consisting of exactly $i$ unit-square space(s), aligned to the left. For example, when $N = 3$, the floor would look like this:
```
■
■ ■
■ ■ ■
```

Tasky needs to show that AI is creative and useful by painting each square one of 26 colors, denoted `a` to `z`. A connected component entirely of the same color (in the 4 orthogonal directions) is called a _patch_. To maximize creativity:
- Every patch must contain at most `K` cells
- Every cell must be in exactly one patch
- Orthogonally neighboring patches must be different colors

Tasky wants to know the minimum number of patches needed to cover the bathroom floor, and provide one such layout for this construction. _The number of colors used does not need to be minimized, only the number of patches._

## Constraints

- `1 <= T <= 150`
- `1 <= N <= 100`
- `1 <= K <= N*(N+1)/2`

## Input Format

Input begins with an integer `T`, the number of test cases. The first line of each case contains two integers `N` and `K`.

## Output Format

For the i-th test case, print `Case #i:` followed by a single integer, the minimum number of patches needed. `N` lines follow, the i-th of which must contain exactly `i` lowercase English letters (`a`..`z`). Connected cells of the same letters indicate the same patch.

If there are multiple valid solutions, any satisfying the above constraints will be accepted.

## Sample Explanation

In the first sample case, there are two patches, each of size at most K = 3. It looks like this:
```
■
■ ■
□ □ □
```

In the second sample case, there are 4 patches. Please note that this solution can be displayed using as few as 2 different colors, or as many as 4 colors and still be correct. The painted floor looks like this:
```
■
■ □
■ □ □
□ ■ ■ ■
```

Using at most 26 colors, it is not possible to paint the triangle in a way that creates fewer than 4 patches with all patches being size 3 or less.
