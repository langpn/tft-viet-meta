import { describe, expect, test } from "bun:test";
import {
  normalizeVietnamese,
  validateTranslation,
} from "../src/core/localization.js";

describe("Vietnamese canonical localization", () => {
  test("normalizes accents and casing for search aliases", () => {
    expect(normalizeVietnamese("Áo Choàng Bóng Tối")).toBe("ao choang bong toi");
  });

  test("rejects a translation with changed numeric placeholders", () => {
    const result = validateTranslation(
      "Deals 200 damage and gains 20% Attack Speed.",
      "Gây 250 sát thương và nhận 20% Tốc độ Đánh.",
    );

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("numeric values changed");
  });

  test("accepts a translation that preserves numeric placeholders", () => {
    const result = validateTranslation(
      "Deals 200 damage and gains 20% Attack Speed.",
      "Gây 200 sát thương và nhận 20% Tốc độ Đánh.",
    );

    expect(result).toEqual({ ok: true, errors: [] });
  });

  test("Ornn Artifacts have official Riot Vietnamese translations", () => {
    const itemsData = require("../src/lib/data/academy-items.json");
    const artifacts = itemsData.categories?.artifacts || {};
    const all = Object.values(artifacts).flat();
    expect(all.length).toBeGreaterThan(0);
    // Silvermere Dawn -> Chùy Bạch Ngân, Mittens -> Găng Đấu Sĩ
    const silvermere = all.find((i: any) => i.id === "DA_Artifact_SilvermereDawn");
    expect(silvermere?.name_vi).toBe("Chùy Bạch Ngân");
    const mittens = all.find((i: any) => i.id === "DA_Artifact_Mittens");
    expect(mittens?.name_vi).toBe("Găng Đấu Sĩ");
  });
});
