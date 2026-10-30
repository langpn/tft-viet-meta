import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { SearchDocument } from "../core/search.js";
import type { SourceSnapshot } from "../core/source-lock.js";

export type LocalState = {
  sourceSnapshots: SourceSnapshot[];
  searchDocuments: SearchDocument[];
  activePatch: string;
  lastSyncAt: string | null;
};

export const defaultState: LocalState = {
  sourceSnapshots: [],
  searchDocuments: [],
  activePatch: "unknown",
  lastSyncAt: null,
};

export async function loadState(path: string): Promise<LocalState> {
  try {
    return JSON.parse(await readFile(path, "utf8")) as LocalState;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    return defaultState;
  }
}

export async function saveState(path: string, state: LocalState): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

export function statePath(root: string): string {
  return join(root, "data", "state.json");
}
