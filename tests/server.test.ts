import { describe, expect, test } from "bun:test";
import { buildSearchResponse, parseExplorerQuery } from "../src/server/api.js";
import { syncExitCode } from "../src/server/cli-policy.js";
import type { SearchDocument } from "../src/core/search.js";

const documents: SearchDocument[] = [
  {
    id: "unit-ahri",
    entityType: "unit",
    titleVi: "Ahri",
    titleEn: "Ahri",
    aliases: ["ahri carry"],
    patch: "18.5c",
  },
];

describe("server API contracts", () => {
  test("parses Explorer query arrays and scalar filters from URL parameters", () => {
    const query = parseExplorerQuery(
      new URLSearchParams("patch=18.5c&rank=diamond_plus&units=Ahri&units=Garen&items=JeweledGauntlet"),
    );

    expect(query).toEqual({
      patch: "18.5c",
      rank: "diamond_plus",
      units: ["Ahri", "Garen"],
      items: ["JeweledGauntlet"],
    });
  });

  test("returns search results with source and patch metadata", () => {
    const response = buildSearchResponse(documents, "ahri");

    expect(response.query).toBe("ahri");
    expect(response.results[0]).toMatchObject({
      id: "unit-ahri",
      source: "local-canonical-index",
      patch: "18.5c",
    });
  });

  test("keeps sync non-zero while Explorer parity is unverified", () => {
    expect(syncExitCode({ explorerStatus: "UNVERIFIED" })).toBe(2);
    expect(syncExitCode({ explorerStatus: "FAIL" })).toBe(2);
    expect(syncExitCode({ explorerStatus: "PASS" })).toBe(0);
  });
});
