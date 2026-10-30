import { describe, expect, test } from "bun:test";
import { searchDocuments, type SearchDocument } from "../src/core/search.js";

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
});
