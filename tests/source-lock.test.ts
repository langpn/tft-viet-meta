import { describe, expect, test } from "bun:test";
import {
  classifySnapshotDiff,
  createSnapshot,
  type SourceDocument,
} from "../src/core/source-lock.js";

const document = (content: string): SourceDocument => ({
  sourceName: "tft-academy",
  url: "https://tftacademy.com/guides/example",
  content,
  retrievedAt: "2026-10-30T00:00:00.000Z",
});

describe("source-locked snapshots", () => {
  test("detects unchanged, added, modified, and deleted documents", () => {
    const previous = [
      createSnapshot(document("same")),
      createSnapshot({ ...document("old"), url: "https://tftacademy.com/guides/changed" }),
      createSnapshot({ ...document("deleted"), url: "https://tftacademy.com/guides/deleted" }),
    ];
    const current = [
      createSnapshot(document("same")),
      createSnapshot({ ...document("new"), url: "https://tftacademy.com/guides/changed" }),
      createSnapshot({ ...document("added"), url: "https://tftacademy.com/guides/added" }),
    ];

    const diff = classifySnapshotDiff(previous, current);

    expect(diff.unchanged).toHaveLength(1);
    expect(diff.modified).toHaveLength(1);
    expect(diff.added).toHaveLength(1);
    expect(diff.deleted).toHaveLength(1);
  });

  test("uses content hashes so formatting changes remain observable", () => {
    const snapshot = createSnapshot(document("guide content"));
    expect(snapshot.contentHash).toMatch(/^[a-f0-9]{64}$/);
    expect(snapshot.contentHash).not.toBe(createSnapshot(document("different")).contentHash);
  });
});
