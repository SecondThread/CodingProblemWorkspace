import { pathToFileURL } from "node:url";

import type {
  CheckerArgs,
  CheckerResult,
  GeneratedCase,
  ProblemChecker,
  ProblemGenerator,
  ProblemSolution,
  ProblemValidator
} from "../contracts/problem";

type WorkerAction = "check" | "generate" | "solution" | "validate";

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];

  for await (const chunk of process.stdin) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks).toString("utf8");
}

async function loadDefaultExport<T>(modulePath: string): Promise<T> {
  const moduleUrl: string = `${pathToFileURL(modulePath).href}?cacheBust=${Date.now()}`;
  const importedModule = (await import(moduleUrl)) as { readonly default?: T };

  if (importedModule.default === undefined) {
    throw new Error(`Module does not have a default export: ${modulePath}`);
  }

  return importedModule.default;
}

async function run(): Promise<void> {
  const action: WorkerAction | undefined = process.argv[2] as WorkerAction | undefined;
  const modulePath: string | undefined = process.argv[3];

  if (action === undefined || modulePath === undefined) {
    throw new Error("Usage: problemWorker.ts <action> <module-path>");
  }

  switch (action) {
    case "generate": {
      const generator: ProblemGenerator = await loadDefaultExport<ProblemGenerator>(modulePath);
      const generatedCase: GeneratedCase = await generator.generate();
      process.stdout.write(JSON.stringify(generatedCase));
      return;
    }

    case "validate": {
      const validator: ProblemValidator = await loadDefaultExport<ProblemValidator>(modulePath);
      const input: string = await readStdin();
      await validator.validate(input);
      process.stdout.write(JSON.stringify({ ok: true }));
      return;
    }

    case "check": {
      const checker: ProblemChecker = await loadDefaultExport<ProblemChecker>(modulePath);
      const rawInput: string = await readStdin();
      const args: CheckerArgs = JSON.parse(rawInput) as CheckerArgs;
      const result: CheckerResult = await checker.check(args);
      process.stdout.write(JSON.stringify(result));
      return;
    }

    case "solution": {
      const solution: ProblemSolution = await loadDefaultExport<ProblemSolution>(modulePath);
      const input: string = await readStdin();
      const output: string = await solution(input);

      if (typeof output !== "string") {
        throw new Error("Solution default export must return a string.");
      }

      process.stdout.write(output);
      return;
    }
  }
}

void run().catch((error: unknown) => {
  if (error instanceof Error) {
    process.stderr.write(error.stack ?? error.message);
  } else {
    process.stderr.write(String(error));
  }

  process.exitCode = 1;
});

