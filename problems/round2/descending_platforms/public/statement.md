# Descending Platforms

It's almost time to present the winners for Whacker Cup! In most sports, the top-3 finishers get to stand on the winners podium. However, the organizers feel that everyone is a winner for having participated in the amazing event, and that all $N$ competitors deserve to stand on the podium!

The organizers want to build a podium comprised of $N$ platforms in a row (numbered `1..N`) with bricks of equal size. For each platform `i`, the organizers must decide on some height of `x_i` bricks tall. To signify the winners' ranks, the platform heights must be non-increasing and non-negative, i.e. `x_1 >= x_2 >= ... >= x_N >= 0`.

While bricks are equal-sized, they have varying *amazingness*. Platform `i` must be built *only with* bricks of amazingness `A_i`. The amazingness of the final podium is the sum of amazingnesses of all bricks used (`A_1 * x_1 + A_2 * x_2 + ... + A_N * x_N`), which the organizers want to be at least `M`. Since amazing bricks are expensive, they also wish to minimize the total number of bricks used.

Formalizing all the above, an "amazing" podium is given by a sequence `[x_1, ..., x_N]` such that:
* `x_1 >= x_2 >= ... >= x_N >= 0`,
* `A_1 * x_1 + A_2 * x_2 + ... + A_N * x_N >= M`, and
* `x_1 + x_2 + ... + x_N` is minimized.

Can you find such an amazing podium? If there are multiple answers, any will be accepted.

## Constraints

- `1 <= T <= 100`
- `1 <= N <= 1000`
- `1 <= M <= 10^12`
- `1 <= A_i <= 10^12`
- `N` exceeds `500` in at most `11` test cases.

## Input Format

Input begins with an integer `T`, the number of test cases. The first line of each case contains two integers `N` and `M`. The second line contains `N` integers `A_1, ..., A_N`.

## Output Format

For the `i`-th test case, print `Case #i:` followed by the minimum number of bricks needed to build the podium to spec, followed by a new line with `N` space-separated integers `x_1, ..., x_N`.

## Sample Explanation

In the first sample case, `N = 3` and `M = 27`. Brick types have amazingness of `A = [3, 5, 1]`. One possible answer is `x = [4, 3, 0]`, which satisfies the conditions `4 >= 3 >= 0` and `3 * 4 + 5 * 3 + 1 * 0 = 27 >= M = 27` while minimizing the total bricks used at `4 + 3 + 0 = 7`.
