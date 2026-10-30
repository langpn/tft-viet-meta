import { describe, expect, test } from "bun:test";
import { searchDocuments, type SearchDocument } from "../src/core/search.js";
import { searchSet18Entities } from "../src/lib/utils/set18-search.js";
import { generateRiotTeamCode } from "../src/lib/utils/team-code.js";
import compsData from "../src/lib/data/academy-comps.json";

const documents: SearchDocument[] = [
  {
    id: "item-1",
    entityType: "item",
    titleVi: "Áo Choàng Bóng Tối",
    titleEn: "Stealth Cloak",
    aliases: ["ao choang bong toi", "stealth cloak"],
    patch: "18.5c",
  },
  {
    id: "unit-1",
    entityType: "unit",
    titleVi: "Ahri",
    titleEn: "Ahri",
    aliases: ["ahri carry"],
    patch: "18.5c",
  },
];

describe("local search", () => {
  test("finds Vietnamese content without accents", () => {
    const results = searchDocuments(documents, "ao choang bong toi");
    expect(results[0]?.id).toBe("item-1");
  });

  test("filters by entity type", () => {
    const results = searchDocuments(documents, "ahri", { entityType: "unit" });
    expect(results.map((result) => result.id)).toEqual(["unit-1"]);
  });

  test("searchSet18Entities returns Master Yi and excludes legacy champions", () => {
    const results = searchSet18Entities("yi");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name_en).toBe("Master Yi");
    expect(results.some((r) => r.name_en === "Zed" || r.name_en === "Garen")).toBe(false);
  });

  test("generateRiotTeamCode generates exact 40-char team code for Draven Ezreal 9", () => {
    const draven = compsData.find((c: any) => c.title === "Draven Ezreal 9");
    expect(draven).toBeDefined();
    const code = generateRiotTeamCode(draven.finalComp || draven.board);
    expect(code).toBe("023EB3ED3FF40443040140B3FB415000TFTSet18");
  });
});
