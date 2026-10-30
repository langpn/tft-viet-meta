import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { SearchDocument } from "../core/search.js";
import type { SourceSnapshot } from "../core/source-lock.js";
import type { ExplorerResult } from "../core/explorer.js";

export type ExplorerSnapshotRecord = {
  url: string;
  query: Record<string, unknown>;
  payload: Record<string, unknown>;
  metrics: ExplorerResult;
  retrievedAt: string;
  source: string;
  status: "PASS" | "FAIL" | "UNVERIFIED";
};

export type SourceDiffManifest = {
  added: string[];
  modified: string[];
  deleted: string[];
  unchanged: string[];
};

export type LocalState = {
  sourceSnapshots: SourceSnapshot[];
  searchDocuments: SearchDocument[];
  activePatch: string;
  lastSyncAt: string | null;
  explorerSnapshots: ExplorerSnapshotRecord[];
  sourceDiff: SourceDiffManifest;
};

export const defaultState: LocalState = {
  sourceSnapshots: [],
  searchDocuments: [],
  activePatch: "unknown",
  lastSyncAt: null,
  explorerSnapshots: [],
  sourceDiff: { added: [], modified: [], deleted: [], unchanged: [] },
};

export async function loadState(path: string): Promise<LocalState> {
  try {
    const state = JSON.parse(await readFile(path, "utf8")) as Partial<LocalState>;
    return {
      ...defaultState,
      ...state,
      explorerSnapshots: state.explorerSnapshots ?? [],
      sourceDiff: state.sourceDiff ?? defaultState.sourceDiff,
    };
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
