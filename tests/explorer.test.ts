import { describe, expect, test } from "bun:test";
import {
  buildExplorerUrl,
  normalizeExplorerQuery,
  queryHash,
  compareExplorerResults,
  normalizeExplorerPayload,
  type ExplorerQuery,
} from "../src/core/explorer.js";

describe("Explorer parity contracts", () => {
  test("normalizes filter order into a stable query hash", () => {
    const first: ExplorerQuery = {
      patch: "18.5c",
      rank: "diamond_plus",
      units: ["Ahri"],
      items: ["JeweledGauntlet"],
    };
    const second: ExplorerQuery = {
      items: ["JeweledGauntlet"],
      units: ["Ahri"],
      rank: "diamond_plus",
      patch: "18.5c",
    };

    expect(queryHash(first)).toBe(queryHash(second));
    expect(normalizeExplorerQuery(first)).toEqual(normalizeExplorerQuery(second));
  });

  test("reports a metric mismatch instead of silently accepting drift", () => {
    const result = compareExplorerResults(
      { averagePlacement: 3.2, topFourRate: 0.62, games: 1000 },
      { averagePlacement: 3.3, topFourRate: 0.62, games: 1000 },
    );

    expect(result.status).toBe("FAIL");
    expect(result.mismatches).toContain("averagePlacement");
  });

  test("accepts exact normalized results", () => {
    const result = compareExplorerResults(
      { averagePlacement: 3.2, topFourRate: 0.62, games: 1000 },
      { averagePlacement: 3.2, topFourRate: 0.62, games: 1000 },
    );

    expect(result).toEqual({ status: "PASS", mismatches: [] });
  });

  test("serializes public tactics.tools explorer filters into path tokens", () => {
    const url = buildExplorerUrl({
      patchId: "16212",
      rankGroup: 1,
      query: {
        units: ["TFT18_Amumu"],
        traits: ["DA_Juggernaut18"],
        items: ["DA_Deathblade-TFT18_Amumu-0"],
        augments: ["TFT13_Augment_BruiserCrown-1"],
      },
    });

    expect(url).toBe(
      "https://d3.tft.tools/explorer-data/16212/1/u-TFT18_Amumu-0/t-DA_Juggernaut18-1/i-DA_Deathblade-TFT18_Amumu-0/a-TFT13_Augment_BruiserCrown-1",
    );
  });

  test("normalizes a tactics.tools payload into canonical metrics", () => {
    expect(
      normalizeExplorerPayload({ base: { count: 100, place: 325, top4: 60, won: 12 } }),
    ).toEqual({ averagePlacement: 3.25, topFourRate: 0.6, games: 100 });
  });
});
