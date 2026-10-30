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
});
