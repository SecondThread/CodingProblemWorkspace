import type { ProblemSolution } from "../../../../src/contracts/problem";

function solve(n: number, sArr: string[]): string {
  const s = sArr.slice(); // mutable copy of char array
  const ans1: number[][] = [];
  const ans2: number[][] = [];

  const upd = (a: number[], b: number[]): void => {
    for (let i = 0; i < n; i += 1) {
      const tmp = s[a[i]!]!;
      s[a[i]!] = s[b[i]!]!;
      s[b[i]!] = tmp;
    }
    ans1.push(a.slice());
    ans2.push(b.slice());
  };

  const mp: Record<string, string> = {
    "010100": "aaabbb",
    "010101": "aabbab",
    "010110": "aaabbb",
    "010111": "ababab",
    "011000": "aaabbb",
    "011001": "aaabbb",
    "011010": "aaabbb",
    "011011": "ababab",
    "011101": "abaabb",
  };

  // Phase 1: process pairs so each pair has equal bits
  while (true) {
    let idx = -1;
    for (let i = 0; i < 2 * n; i += 2) {
      if (s[i] !== s[i + 1]) {
        idx = i;
        break;
      }
    }

    if (idx === -1 || idx === 2 * n - 2) {
      break;
    }

    const a: number[] = [];
    const b: number[] = [];
    for (let i = 0; i < idx - 2; i += 2) {
      a.push(i);
      b.push(i + 1);
    }

    if (idx === 2 * n - 4 && s[idx + 2] !== s[idx + 3]) {
      a.push(idx - 2);
      a.push(idx - 1);
      b.push(idx);
      b.push(idx + 1);
      a.push(idx + 2);
      b.push(idx + 3);
      upd(a, b);

      // Remove last 3 from each
      a.length -= 3;
      b.length -= 3;

      a.push(idx - 2);
      b.push(idx - 1);
      a.push(idx);
      a.push(idx + 1);
      b.push(idx + 2);
      b.push(idx + 3);
      upd(a, b);
      continue;
    }

    if (idx === 2 * n - 4 && s[idx + 2] === s[idx + 3]) {
      break;
    }

    if (idx !== 0) {
      a.push(idx - 2);
      b.push(idx - 1);
    }

    let t = "";
    for (let i = 0; i < 6; i += 1) {
      t += s[idx + i];
    }

    if (t[0] === "1") {
      const tArr = t.split("");
      for (let i = 0; i < 6; i += 1) {
        tArr[i] = tArr[i] === "0" ? "1" : "0";
      }
      t = tArr.join("");
    }

    const pattern: string = mp[t] ?? "aabbab";

    for (let i = 0; i < 6; i += 1) {
      if (pattern[i] === "a") {
        a.push(idx + i);
      } else {
        b.push(idx + i);
      }
    }

    for (let i = idx + 6; i < 2 * n; i += 2) {
      a.push(i);
      b.push(i + 1);
    }

    upd(a, b);
  }

  // Phase 2: bubble sort pairs by type
  const type = (x: number): number => {
    if (s[x] === "0" && s[x + 1] === "0") return 0;
    if (s[x] === "1" && s[x + 1] === "1") return 2;
    return 1;
  };

  const isSorted = (): boolean => {
    for (let i = 1; i < 2 * n; i += 1) {
      if (s[i]! < s[i - 1]!) return false;
    }
    return true;
  };

  while (true) {
    if (isSorted()) break;

    const a: number[] = [];
    const b: number[] = [];
    let done = true;
    for (let i = 0; i < 2 * n; i += 2) {
      if (i === 2 * n - 2) {
        a.push(i);
        b.push(i + 1);
        continue;
      }

      if (type(i) > type(i + 2)) {
        done = false;
        a.push(i);
        a.push(i + 1);
        b.push(i + 2);
        b.push(i + 3);
        i += 2;
        continue;
      }

      a.push(i);
      b.push(i + 1);
    }

    upd(a, b);

    if (done) break;
  }

  // Phase 3: final swap if still not sorted
  if (!isSorted()) {
    const a: number[] = [];
    const b: number[] = [];
    for (let i = 0; i < 2 * n; i += 2) {
      a.push(i);
      b.push(i + 1);
    }
    upd(a, b);
  }

  const lines: string[] = [];
  lines.push(String(ans1.length));
  for (let i = 0; i < ans1.length; i += 1) {
    lines.push(ans1[i]!.map((x) => String(x + 1)).join(" "));
    lines.push(ans2[i]!.map((x) => String(x + 1)).join(" "));
  }
  return lines.join("\n");
}

const solution: ProblemSolution = (input: string): string => {
  const lines = input.trim().split("\n");
  let lineIndex = 0;
  const t = Number(lines[lineIndex]!);
  lineIndex += 1;

  const outputLines: string[] = [];

  for (let c = 1; c <= t; c += 1) {
    const n = Number(lines[lineIndex]!.trim());
    lineIndex += 1;
    const sStr = lines[lineIndex]!.trim();
    lineIndex += 1;

    const sArr = sStr.split("");
    const result = solve(n, sArr);
    outputLines.push(`Case #${String(c)}: ${result}`);
  }

  return outputLines.join("\n") + "\n";
};

export default solution;
