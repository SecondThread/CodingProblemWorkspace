# Deciding Points

Meta Whacker Cup is a tennis tournament held among Meta employees. Tennis tournaments comprise matches, sets, games, and points. In this problem, we'll only consider games and points.

A two-player tennis game consists of a sequence of points (won one at a time), each point going to one of the players. Whacker Cup, being wacky, has slightly different rules than normal tennis:
* In normal tennis, the game ends once a player wins at least $4$ points **and** has a margin of $2$ or more points over their opponent.
* In Whacker Cup, the game ends once a player wins at least $M$ points **and** has a margin of $2$ or more points over their opponent.

As CTO (Chief Tennis Officer), you're doing some simulations to tune the rules. Namely, you'd like to know if it's possible for a Whacker Cup game to end with $N$ total points for a given value of $M$.

## Constraints

- `1 <= T <= 10^5`
- `1 <= N <= 10^9`
- `1 <= M <= 100`

## Input Format

Input begins with an integer `T`, the number of test cases. Each test case is a single line consisting of two space-separated integers `N` and `M`.

## Output Format

For the `i`-th test case, print `Case #i:` followed by `YES` if an `N`-point game is possible, or `NO` otherwise.

## Sample Explanation

In the first sample case, we want to know if it's possible for a game to end with `N = 4` total points and one player winning at least `M = 3` points (and by a margin of at least `2`). If we label the players `1` and `2`, then one possible sequence of winners is `1, 2, 2, 2`, after which the game ends.

In the second sample case, we need `N = 5` total points, but require one player to win at least `M = 3` points. There is no valid sequence of points for such a game.

In the third sample case, we need `N = 3` total points, and a player needs `M = 3` points to win. The only way is one player winning all `3` games.

The sixth sample case is based off of the longest set ever in tennis. The final score is `70-68`.
