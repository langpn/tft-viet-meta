import { fetchSitemap, snapshotPublicPages, type FetchText } from "../connectors/tft-academy.js";
import { fetchDataDragonDataset, normalizeDataDragonCatalog } from "../connectors/riot-ddragon.js";
import type { LocalState } from "./storage.js";

export type SyncDependencies = {
  fetchText: FetchText;
  fetchJson: <T>(url: string) => Promise<T>;
};

export type SyncReport = {
  status: "PARTIAL";
  academyPages: number;
  riotEntities: number;
  explorerStatus: "UNVERIFIED";
  sourceOfTruth: string[];
};

export async function runSync(
  dependencies: SyncDependencies,
  retrievedAt = new Date().toISOString(),
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
  );

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

  return {
    state: {
      sourceSnapshots,
      searchDocuments,
      activePatch: version,
      lastSyncAt: retrievedAt,
    },
    report: {
      status: "PARTIAL",
      academyPages: sourceSnapshots.length,
      riotEntities: searchDocuments.length,
      explorerStatus: "UNVERIFIED",
      sourceOfTruth: ["tftacademy.com public sitemap/pages", "Riot Data Dragon en_US + vi_VN"],
    },
  };
}
