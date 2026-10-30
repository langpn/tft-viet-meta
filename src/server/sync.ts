import { fetchSitemap, snapshotPublicPages, type FetchText } from "../connectors/tft-academy.js";
import { fetchDataDragonDataset, normalizeDataDragonCatalog } from "../connectors/riot-ddragon.js";
import { classifySnapshotDiff } from "../core/source-lock.js";
import { fetchExplorerSnapshot } from "../connectors/tactics-tools.js";
import type { LocalState } from "./storage.js";
import type { SourceDiffManifest } from "./storage.js";

export type SyncDependencies = {
  fetchText: FetchText;
  fetchJson: <T>(url: string) => Promise<T>;
  fetchExplorer?: (url: string) => Promise<unknown>;
};

export type SyncReport = {
  status: "PARTIAL";
  academyPages: number;
  riotEntities: number;
  explorerStatus: "PASS" | "UNVERIFIED" | "FAIL";
  sourceOfTruth: string[];
  diff: {
    added: number;
    modified: number;
    deleted: number;
    unchanged: number;
  };
  changedUrls: SourceDiffManifest;
};

export async function runSync(
  dependencies: SyncDependencies,
  retrievedAt = new Date().toISOString(),
  previousState: LocalState = {
    sourceSnapshots: [],
    searchDocuments: [],
    activePatch: "unknown",
    lastSyncAt: null,
    explorerSnapshots: [],
    sourceDiff: { added: [], modified: [], deleted: [], unchanged: [] },
  },
): Promise<{ state: LocalState; report: SyncReport }> {
  const versions = await dependencies.fetchJson<string[]>(
    "https://ddragon.leagueoflegends.com/api/versions.json",
  );
  const version = versions[0];
  if (!version) throw new Error("Riot Data Dragon returned no patch versions");

  const sitemapUrls = await fetchSitemap(
    dependencies.fetchText,
    "https://tftacademy.com/sitemap.xml",
  );
  const sourceSnapshots = await snapshotPublicPages(
    dependencies.fetchText,
    sitemapUrls,
    retrievedAt,
    { concurrency: 8, retries: 2 },
  );
  const diff = classifySnapshotDiff(previousState.sourceSnapshots, sourceSnapshots);
  const changedUrls: SourceDiffManifest = {
    added: diff.added.map((snapshot) => snapshot.url),
    modified: diff.modified.map(({ current }) => current.url),
    deleted: diff.deleted.map((snapshot) => snapshot.url),
    unchanged: diff.unchanged.map((snapshot) => snapshot.url),
  };

  const kinds = ["champion", "item", "trait", "augment"] as const;
  const searchDocuments = [];
  for (const kind of kinds) {
    const [english, vietnamese] = await Promise.all([
      fetchDataDragonDataset(dependencies.fetchJson, version, "en_US", kind),
      fetchDataDragonDataset(dependencies.fetchJson, version, "vi_VN", kind),
    ]);
    searchDocuments.push(
      ...normalizeDataDragonCatalog(english, vietnamese, { version, locale: "vi_VN" }),
    );
  }

  const explorerInput = {
    patchId: "16212",
    rankGroup: 1,
    query: { units: ["TFT18_Amumu"] },
  };
  let explorerStatus: SyncReport["explorerStatus"] = "UNVERIFIED";
  let explorerSnapshots = previousState.explorerSnapshots ?? [];
  if (dependencies.fetchExplorer) {
    const explorerSnapshot = await fetchExplorerSnapshot(dependencies.fetchExplorer, explorerInput, retrievedAt);
    explorerStatus = explorerSnapshot.status;
    explorerSnapshots = [
      {
        url: explorerSnapshot.url,
        query: explorerInput.query,
        payload: explorerSnapshot.payload,
        metrics: explorerSnapshot.metrics,
        retrievedAt: explorerSnapshot.retrievedAt,
        source: explorerSnapshot.source,
        status: explorerSnapshot.status,
      },
    ];
  }

  return {
    state: {
      sourceSnapshots,
      searchDocuments,
      activePatch: version,
      lastSyncAt: retrievedAt,
      explorerSnapshots,
      sourceDiff: changedUrls,
    },
    report: {
      status: "PARTIAL",
      academyPages: sourceSnapshots.length,
      riotEntities: searchDocuments.length,
      explorerStatus,
      sourceOfTruth: ["tftacademy.com public sitemap/pages", "Riot Data Dragon en_US + vi_VN", "tactics.tools public Explorer runtime probe"],
      diff: {
        added: diff.added.length,
        modified: diff.modified.length,
        deleted: diff.deleted.length,
        unchanged: diff.unchanged.length,
      },
      changedUrls,
    },
  };
}
