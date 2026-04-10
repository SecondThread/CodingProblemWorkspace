# GPU Cubes Hard

For some reason, everyone seems to have GPUs on their Christmas list this year. And boy, are they a hassle to fabricate. Santa's found the right elves for the job, but needs you to figure out a way to get all the parts together in a certain configuration.

Santa's design requires that you put unit cubes, with each unit cube being one of `N` colors, inside an `M x M x M` volume. For each color, you must use at least one cube of that color, and all unit cubes of that color must occupy a single face-connected component.

Santa has also specified exactly which pairs of colors must border each other and which pairs must not, given to you as the lower triangle of an adjacency matrix `A`. For each pair `(i, j)` of colors:

- If `A[i,j] = 0`, then no two unit cubes of colors `i` and `j` are allowed to share a face.
- If `A[i,j] = 1`, then at least one pair of unit cubes of colors `i` and `j` must share a face.

Please find any valid construction. It can be shown that one always exists.

**In this chapter, you may choose any `M <= 47` regardless of `N`.**

In case this bound looks suspicious, notice there are `94` non-space printable ASCII characters, and `47` is half of `94`.

## Constraints

- `1 <= T <= 70`
- `1 <= N <= 94`
- `A[i,j]` is either `0` or `1`

## Input Format

- The first line contains an integer `T`, the number of test cases.
- The first line of each test case contains an integer `N`, the number of colors.
- `N - 1` lines follow.
- The `i`th of those lines contains `i` integers, specifying `A[i + 1, 1...i]`.

## Output Format

- For case `i`, print `Case #i:` followed by the side length `M` of the cube to fill.
- Then print `M^2` lines, each with exactly `M` characters.
- The first `M` lines describe the bottom layer of the cube.
- The next `M` lines describe the layer above that, and so on.

Color `i` should be represented by the `i`th character in the following string:

```text
abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:,<.>/?'"`~\
```

For any unit cells you would like to remain empty, use a space character.

All 94 non-space printable ASCII characters may be relevant in this chapter.
