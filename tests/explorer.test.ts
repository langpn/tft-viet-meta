import { describe, expect, test } from "bun:test";
import {
  normalizeExplorerQuery,
  queryHash,
  compareExplorerResults,
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
});
