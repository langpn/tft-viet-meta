import { describe, expect, test } from "bun:test";
import { runSync, type SyncDependencies } from "../src/server/sync.js";

const responses: Record<string, unknown> = {
  "https://ddragon.leagueoflegends.com/api/versions.json": ["16.21.1"],
  "https://ddragon.leagueoflegends.com/cdn/16.21.1/data/en_US/tft-champion.json": {
    type: "tft-champion",
    version: "0.0.0",
    data: { Ahri: { id: "Ahri", name: "Ahri", tier: 2, image: { full: "Ahri.png" } } },
  },
  "https://ddragon.leagueoflegends.com/cdn/16.21.1/data/vi_VN/tft-champion.json": {
    type: "tft-champion",
    version: "0.0.0",
    data: { Ahri: { id: "Ahri", name: "Ahri", tier: 2, image: { full: "Ahri.png" } } },
  },
};

for (const kind of ["item", "trait", "augment"]) {
  for (const locale of ["en_US", "vi_VN"]) {
    const fileName = kind === "augment" ? "tft-augments.json" : `tft-${kind}.json`;
    responses[`https://ddragon.leagueoflegends.com/cdn/16.21.1/data/${locale}/${fileName}`] = {
      type: `tft-${kind}`,
      version: "0.0.0",
      data: {},
    };
  }
}

const dependencies: SyncDependencies = {
  fetchText: async (url) => {
    if (url === "https://tftacademy.com/sitemap.xml") {
      return `<urlset>
        <url><loc>https://tftacademy.com/tierlist/comps</loc></url>
        <url><loc>https://tftacademy.com/tierlist/items</loc></url>
        <url><loc>https://tftacademy.com/tierlist/augments</loc></url>
        <url><loc>https://tftacademy.com/learn/new-set</loc></url>
        <url><loc>https://tftacademy.com/guides</loc></url>
      </urlset>`;
    }
    return `<html>${url}</html>`;
  },
  fetchJson: async <T>(url: string) => responses[url] as T,
  fetchExplorer: async (url) => {
    expect(url).toBe("https://d3.tft.tools/explorer-data/16212/1/u-TFT18_Amumu-0");
    return { base: { count: 100, place: 325, top4: 60, won: 12 }, units: [] };
  },
};

describe("sync pipeline", () => {
  test("builds a local canonical index from source snapshots and Riot locale", async () => {
    const result = await runSync(dependencies, "2026-10-30T00:00:00.000Z");

    expect(result.state.activePatch).toBe("16.21.1");
    expect(result.state.sourceSnapshots).toHaveLength(4);
    expect(result.state.searchDocuments).toEqual([
      expect.objectContaining({
        id: "Ahri",
        titleVi: "Ahri",
        verifiedAgainstLocale: true,
        patch: "16.21.1",
      }),
    ]);
    expect(result.report).toMatchObject({
      academyPages: 4,
      riotEntities: 1,
      explorerStatus: "PASS",
      diff: { added: 4, modified: 0, deleted: 0, unchanged: 0 },
      changedUrls: {
        added: [
          "https://tftacademy.com/tierlist/comps",
          "https://tftacademy.com/tierlist/items",
          "https://tftacademy.com/tierlist/augments",
          "https://tftacademy.com/learn/new-set",
        ],
        modified: [],
        deleted: [],
        unchanged: [],
      },
      academyUpdateChanged: true,
      refreshReason: "academy_update_trigger",
      refreshTargets: [
        "https://tftacademy.com/tierlist/comps",
        "https://tftacademy.com/tierlist/items",
        "https://tftacademy.com/tierlist/augments",
      ],
    });
  });
});
