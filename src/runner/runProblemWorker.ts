import { spawn } from "node:child_process";

import { getProblemWorkerScriptPath, getRepoRoot, getTsxBinaryPath } from "../utils/paths";

export type WorkerAction = "check" | "generate" | "solution" | "validate";

export interface WorkerRunOptions {
  readonly action: WorkerAction;
  readonly modulePath: string;
  readonly cwd?: string;
  readonly input?: string;
  readonly timeoutMs?: number;
}

export interface WorkerRunResult {
  readonly durationMs: number;
  readonly exitCode: number | null;
  readonly signal: NodeJS.Signals | null;
  readonly stderr: string;
  readonly stdout: string;
  readonly timedOut: boolean;
}

export function formatWorkerFailure(context: string, result: WorkerRunResult): string {
  const details: string[] = [
    `${context} failed.`,
    `exitCode=${String(result.exitCode)}`,
    `signal=${String(result.signal)}`,
    `timedOut=${String(result.timedOut)}`,
    `durationMs=${String(result.durationMs)}`
  ];

  if (result.stderr.trim().length > 0) {
    details.push(`stderr:\n${result.stderr.trimEnd()}`);
  }

  if (result.stdout.trim().length > 0) {
    details.push(`stdout:\n${result.stdout.trimEnd()}`);
  }

  return details.join("\n");
}

export async function runJsonProblemWorker<T>(options: WorkerRunOptions): Promise<T> {
  const result: WorkerRunResult = await runProblemWorker(options);

  if (result.timedOut || result.exitCode !== 0) {
    throw new Error(formatWorkerFailure(`${options.action} worker`, result));
  }

  try {
    return JSON.parse(result.stdout) as T;
  } catch (error: unknown) {
    const message: string = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to parse JSON from ${options.action} worker.\n${message}\nstdout:\n${result.stdout.trimEnd()}`
    );
  }
}

export async function runProblemWorker(options: WorkerRunOptions): Promise<WorkerRunResult> {
  const startedAt: number = Date.now();
  const workerScriptPath: string = getProblemWorkerScriptPath();
  const tsxBinaryPath: string = getTsxBinaryPath();
  const workingDirectory: string = options.cwd ?? getRepoRoot();
  const timeoutMs: number = options.timeoutMs ?? 600_000;

  return new Promise<WorkerRunResult>((resolve, reject) => {
    const child = spawn(tsxBinaryPath, [workerScriptPath, options.action, options.modulePath], {
      cwd: workingDirectory,
      stdio: ["pipe", "pipe", "pipe"]
    });

    let stdout: string = "";
    let stderr: string = "";
    let timedOut: boolean = false;

    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeoutMs);

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");

    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
    });

    child.stderr.on("data", (chunk: string) => {
      stderr += chunk;
    });

    child.on("error", (error: Error) => {
      clearTimeout(timeout);
      reject(error);
    });

    child.on("close", (exitCode: number | null, signal: NodeJS.Signals | null) => {
      clearTimeout(timeout);
      resolve({
        durationMs: Date.now() - startedAt,
        exitCode,
        signal,
        stderr,
        stdout,
        timedOut
      });
    });

    child.stdin.end(options.input ?? "");
  });
}

