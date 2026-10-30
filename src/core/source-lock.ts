import { createHash } from "node:crypto";

export type SourceDocument = {
  sourceName: string;
  url: string;
  content: string;
  retrievedAt: string;
};

export type SourceSnapshot = SourceDocument & {
  contentHash: string;
};

export type SnapshotDiff = {
  unchanged: SourceSnapshot[];
  added: SourceSnapshot[];
  modified: Array<{ previous: SourceSnapshot; current: SourceSnapshot }>;
  deleted: SourceSnapshot[];
};

export function createSnapshot(document: SourceDocument): SourceSnapshot {
  return {
    ...document,
    contentHash: createHash("sha256").update(document.content).digest("hex"),
  };
}

export function classifySnapshotDiff(
  previous: SourceSnapshot[],
  current: SourceSnapshot[],
): SnapshotDiff {
  const previousByUrl = new Map(previous.map((snapshot) => [snapshot.url, snapshot]));
  const currentByUrl = new Map(current.map((snapshot) => [snapshot.url, snapshot]));
  const unchanged: SourceSnapshot[] = [];
  const added: SourceSnapshot[] = [];
  const modified: Array<{ previous: SourceSnapshot; current: SourceSnapshot }> = [];
  const deleted: SourceSnapshot[] = [];

  for (const snapshot of current) {
    const old = previousByUrl.get(snapshot.url);
    if (!old) added.push(snapshot);
    else if (old.contentHash === snapshot.contentHash) unchanged.push(snapshot);
    else modified.push({ previous: old, current: snapshot });
  }

  for (const snapshot of previous) {
    if (!currentByUrl.has(snapshot.url)) deleted.push(snapshot);
  }

  return { unchanged, added, modified, deleted };
}
