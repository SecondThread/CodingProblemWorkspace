# Polishing Problems

There's only a few things Santa loves more than chocolate chip cookies, and one of them is a good Hacker Cup problem. Santa had a lovely scroll of all his favorite problems. Then, some reindeer figured out that his scroll smelled just like chocolate chips. Long story short: it's up to you to repair as much of the damaged scroll as you can from his digitized backup.

Santa's given you the full text of his original scroll, but was too busy to tell you which piece of the scroll you're repairing. Thankfully, he described in exact detail how the scroll got damaged:

* From the original scroll, a reindeer chose a length 2025 substring $S$ starting at the first letter of a word selected uniformly at random from words starting before the last 2024 letters in the scroll. (A 'word' here means any maximal group of non-space characters)
* The reindeer chose a random integer $x \in [1, 10^{16}]$, and enumerated the next 10,000 primes starting at or after $x$. Call these primes $P_1, \dots, P_{10,000}$.
* The reindeer swapped the characters of $S$ at indices $P_1$ and $P_2$, modulo 2025, with the positions of $S$ indexed as 0..2024.
* The reindeer swapped the characters of $S$ at indices $P_3$ and $P_4$, modulo 2025.
* ...
* The reindeer swapped the characters of $S$ at indices $P_{9,999}$ and $P_{10,000}$, modulo 2025.
* Finally, for each character in the scrambled substring, the reindeer ate/deleted it with probability 50% (joining the remaining pieces together).

The final result is a string $S'$ of length $N$. Can you help restore the original substring $S$?

You've been good all year, so Santa will be happy **even if you don't want to solve every test case**. In particular, you may elect not to answer up to 60% of the cases by outputting `Case #i: SKIP` instead. Of the cases you do answer, you must get all of them right.

## Constraints

- `1 <= T <= 150` (T = 150 on the full cases)
- `1 <= N <= 2025`

## Input Format

Input begins with an integer `T`, the number of test cases. The first line of each case contains a single integer `N`. The second line contains the damaged string `S'`.

Please note that although the original substring $S$ began with the start of a word, after it was scrambled and partially deleted, $S'$ may begin or end with a space.

## Output Format

For the i-th test case, print `Case #i:` followed by either `SKIP` or the repaired substring.

If you attempt to skip more than 60% of cases, or answer a case incorrectly, you will receive a Wrong Answer verdict.

## Sample Explanation

In the first test case, the original substring was "Your friends, Dijkstra, Dikjstra, Djikstra, Djkistra, Dkijstra, and Dkjistra...". After being shuffled and partially deleted, this turned into "ofr,ijsaajmer diis ,Tejksr...".
