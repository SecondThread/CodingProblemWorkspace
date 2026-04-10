import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { dirname } from "node:path";

export async function copyDirectory(sourceDir: string, targetDir: string): Promise<void> {
  await cp(sourceDir, targetDir, { recursive: true });
}

export async function ensureDirectory(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}

export function pathExistsSync(path: string): boolean {
  return existsSync(path);
}

export async function readTextFile(path: string): Promise<string> {
  return readFile(path, "utf8");
}

export function readTextFileSync(path: string): string {
  return readFileSync(path, "utf8");
}

export async function removeDirectory(dirPath: string): Promise<void> {
  await rm(dirPath, { recursive: true, force: true });
}

export async function writeTextFile(path: string, contents: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, contents, "utf8");
}

