# Pay Off

Rob the robo-trainer is training his robots to survive in the real world. In the real world, money talks. If a robot ever collides into a human, it better be programmed to dispense some hard cash to maintain good will.

Rob has $N$ robots, numbered from $1..N$. He'll be running simulations on a 1D number line with points $1..L$. At $t = 0$ of a simulation, robot $i$ starts at point $X_i$, facing the left. There's already a wall at points $1$ and $L$, but Rob plans to install more walls at various other points (not initially occupied by robots).

Every second, every robot will move $1$ unit in the direction they're facing. If it lands on a point with a wall, it immediately changes directions.

If two robots collide (not necessarily at an integer point), the robot with the lower index number will pay off the robot with the higher index, and the robots will continue moving in the same direction.

Rob will perform $Q$ operations of the follow types:
- `1` $x$: Install a wall at point $x$.
- `2` $r$ $s$: Run a new simulation with the latest wall configuration. Rob will place all robots at their original starting points $X_i$ (all facing the left), and restart the clock at $t = 0$. Rob wants to know the last robot that robot $r$ has paid off after $s$ seconds have elapsed. If robot $r$ has not yet paid off anyone, the answer is considered to be $0$.

Please help Rob determine the sum of answers to all queries of type 2.

## Constraints

- `1 <= T <= 115`
- `1 <= N <= 200,000`
- `1 <= Q <= 200,000`
- `1 <= L, s <= 10^9`
- `1 < X_i, x < L`
- `1 <= r <= N`

In each test case, no two robots start at the same position, no two walls occupy the same position, and no robot starts at the same position as a wall.

## Input Format

Input begins with an integer $T$, the number of test cases. The first line of each case contains three integers $N$, $Q$, and $L$. The second line contains $N$ space-separated integers $X_1, ..., X_N$. Then, $Q$ lines follow, each of which contains an operation in one of the two formats specified above.

## Output Format

For the $i$-th test case, print `Case #i:` followed by the sum of answers to all queries of type 2.

## Sample Explanation

In the first sample case, there are $N=3$ robots and $Q=2$ queries on a line from $1$ to $L=17$.
The robots have initial positions of $X = [3, 7, 13]$.
The first operation `1 10` places a wall at $x = 10$.
The second operation `2 1 4` considers robot $1$ after a simulation of $4$ seconds:

At this point, robot $1$ collides with, and pays off robot $2$.
Since there is only one query of type `2`, the final answer for this test case is $2$.

In the second sample case, there are $N=2$ robots and $Q=3$ queries on a line from $1$ to $L=6$.
The robots have initial positions $X = [3, 4]$.
The first operation `1 2` places a wall at $x = 2$.
The second operation `2 1 1` considers robot $1$ after a simulation of $1$ second.

At this point, robot $1$ hasn't collided yet.
The third operation `2 1 35` will extend the same simulation to $35$ seconds, during which we can see there will be multiple collisions between robots $1$ and $2$. Each time, robot $1$ will be paying off robot $2$, so the answer is $2$.
Thus, the final answer for this test case is $0 + 2 = 2$.
