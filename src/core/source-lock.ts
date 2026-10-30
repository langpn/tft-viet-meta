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

export function canonicalizeSourceContent(content: string): string {
  return content
    .replace(/type="[a-f0-9]{6,}-text\/javascript"/gi, 'type="__dynamic-text-javascript__"')
    .replace(/type='[a-f0-9]{6,}-text\/javascript'/gi, "type='__dynamic-text-javascript__'")
    .replace(/data-cf-settings="[a-f0-9]{20,}-\|([^\"]+)"/gi, 'data-cf-settings="__dynamic-cf-settings__-|$1"')
    .replace(/data-cf-settings='[a-f0-9]{20,}-\|([^']+)'/gi, "data-cf-settings='__dynamic-cf-settings__-|$1'");
}

export function createSnapshot(document: SourceDocument): SourceSnapshot {
  return {
    ...document,
    contentHash: createHash("sha256").update(canonicalizeSourceContent(document.content)).digest("hex"),
  };
}

function canonicalHash(snapshot: SourceSnapshot): string {
  return createHash("sha256")
    .update(canonicalizeSourceContent(snapshot.content))
    .digest("hex");
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
    else if (canonicalHash(old) === canonicalHash(snapshot)) unchanged.push(snapshot);
    else modified.push({ previous: old, current: snapshot });
  }

  for (const snapshot of previous) {
    if (!currentByUrl.has(snapshot.url)) deleted.push(snapshot);
  }

  return { unchanged, added, modified, deleted };
}
