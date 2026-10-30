import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import {
  classifySnapshotDiff,
  canonicalizeSourceContent,
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

  test("ignores Cloudflare script-loader hashes but detects content changes", () => {
    const first = '<script type="6974430dc3b323efad69b43f-text/javascript">guide</script>';
    const second = '<script type="e4903049e5fd0fe7e2620eac-text/javascript">guide</script>';

    expect(canonicalizeSourceContent(first)).toBe(canonicalizeSourceContent(second));
    expect(canonicalizeSourceContent(first)).not.toBe(canonicalizeSourceContent(`${second} updated`));
  });

  test("ignores Cloudflare Rocket Loader settings tokens", () => {
    const first = 'data-cf-settings="25c3a79c921c4ec66f0eb897-|49"';
    const second = 'data-cf-settings="70a2a2e6c159f24153e08c23-|49"';

    expect(canonicalizeSourceContent(first)).toBe(canonicalizeSourceContent(second));
  });

  test("classifies repeated dynamic HTML as unchanged", () => {
    const previous = createSnapshot({ ...document('<script type="abc123-text/javascript">guide</script>') });
    const current = createSnapshot({ ...document('<script type="def456-text/javascript">guide</script>') });

    expect(classifySnapshotDiff([previous], [current]).unchanged).toHaveLength(1);
  });

  test("migrates legacy raw hashes without reporting a false modification", () => {
    const content = '<script type="abc123-text/javascript">guide</script>';
    const legacy = {
      ...document(content),
      contentHash: createHash("sha256").update(content).digest("hex"),
    };
    const current = createSnapshot({
      ...document('<script type="def456-text/javascript">guide</script>'),
    });

    expect(classifySnapshotDiff([legacy], [current]).unchanged).toHaveLength(1);
  });

  test("keeps changed URLs available for a sync report", () => {
    const previous = [createSnapshot(document("old"))];
    const current = [createSnapshot(document("new"))];
    const diff = classifySnapshotDiff(previous, current);

    expect(diff.modified.map(({ current: snapshot }) => snapshot.url)).toEqual([
      "https://tftacademy.com/guides/example",
    ]);
  });
});
