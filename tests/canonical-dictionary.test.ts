import { describe, expect, test } from "bun:test";
import {
  dictionary,
  getItemVi,
  getTraitVi,
  getAugmentVi,
  getChampionVi,
  searchEntities,
} from "../src/lib/server/dictionary.js";

describe("Canonical TFT Vietnamese Dictionary", () => {
  describe("Task Contract mappings", () => {
    test('"Infinity Edge" maps to "Vô Cực Kiếm"', () => {
      const item = getItemVi("Infinity Edge");
      expect(item).toBeDefined();
      expect(item?.name_vi).toBe("Vô Cực Kiếm");
      expect(item?.name_en).toBe("Infinity Edge");
      expect(item?.desc_vi).toBeTruthy();
      expect(item?.desc_vi.length).toBeGreaterThan(0);
      expect(item?.icon).toBeTruthy();

      // Case-insensitive & normalized lookup
      expect(getItemVi("infinity edge")?.name_vi).toBe("Vô Cực Kiếm");
      expect(getItemVi("vô cực kiếm")?.name_en).toBe("Infinity Edge");
      expect(getItemVi("vo cuc kiem")?.name_vi).toBe("Vô Cực Kiếm");
      expect(getItemVi("TFT_Item_InfinityEdge")?.name_vi).toBe("Vô Cực Kiếm");
      expect(dictionary.items["Infinity Edge"]?.name_vi).toBe("Vô Cực Kiếm");
    });

    test('"Elderwood" maps to "Thần Rừng"', () => {
      const trait = getTraitVi("Elderwood");
      expect(trait).toBeDefined();
      expect(trait?.name_vi).toBe("Thần Rừng");
      expect(trait?.name_en).toBe("Elderwood");
      expect(trait?.desc_vi).toBeTruthy();
      expect(trait?.desc_vi.length).toBeGreaterThan(0);

      // Case-insensitive & normalized lookup
      expect(getTraitVi("elderwood")?.name_vi).toBe("Thần Rừng");
      expect(getTraitVi("thần rừng")?.name_en).toBe("Elderwood");
      expect(getTraitVi("than rung")?.name_vi).toBe("Thần Rừng");
      expect(dictionary.traits["Elderwood"]?.name_vi).toBe("Thần Rừng");
    });

    test('"Executioner" maps to "Đao Phủ"', () => {
      const trait = getTraitVi("Executioner");
      expect(trait).toBeDefined();
      expect(trait?.name_vi).toBe("Đao Phủ");
      expect(trait?.name_en).toBe("Executioner");
      expect(trait?.desc_vi).toBeTruthy();
      expect(trait?.desc_vi.length).toBeGreaterThan(0);

      // Case-insensitive & normalized lookup
      expect(getTraitVi("executioner")?.name_vi).toBe("Đao Phủ");
      expect(getTraitVi("đao phủ")?.name_en).toBe("Executioner");
      expect(getTraitVi("dao phu")?.name_vi).toBe("Đao Phủ");
      expect(dictionary.traits["Executioner"]?.name_vi).toBe("Đao Phủ");
    });

    test('"Spellweaver" maps to "Pháp Sư"', () => {
      const trait = getTraitVi("Spellweaver");
      expect(trait).toBeDefined();
      expect(trait?.name_vi).toBe("Pháp Sư");
      expect(trait?.name_en).toBe("Spellweaver");
      expect(trait?.desc_vi).toBeTruthy();
      expect(trait?.desc_vi.length).toBeGreaterThan(0);

      // Case-insensitive & normalized lookup
      expect(getTraitVi("spellweaver")?.name_vi).toBe("Pháp Sư");
      expect(getTraitVi("pháp sư")?.name_en).toBe("Spellweaver");
      expect(getTraitVi("phap su")?.name_vi).toBe("Pháp Sư");
      expect(dictionary.traits["Spellweaver"]?.name_vi).toBe("Pháp Sư");
    });
  });

  describe("Common items and traits 100% valid Vietnamese coverage", () => {
    const commonItems = [
      { en: "Infinity Edge", vi: "Vô Cực Kiếm" },
      { en: "Bloodthirster", vi: "Huyết Kiếm" },
      { en: "Deathblade", vi: "Kiếm Tử Thần" },
      { en: "Guinsoo's Rageblade", vi: "Cuồng Đao Guinsoo" },
      { en: "Rabadon's Deathcap", vi: "Mũ Phù Thủy Rabadon" },
      { en: "Warmog's Armor", vi: "Giáp Máu Warmog" },
      { en: "Sunfire Cape", vi: "Áo Choàng Lửa" },
      { en: "Bramble Vest", vi: "Áo Choàng Gai" },
      { en: "Dragon's Claw", vi: "Vuốt Rồng" },
      { en: "Jeweled Gauntlet", vi: "Găng Bảo Thạch" },
      { en: "Hand of Justice", vi: "Bàn Tay Công Lý" },
      { en: "Giant Slayer", vi: "Diệt Khổng Lồ" },
      { en: "Statikk Shiv", vi: "Dao Điện Statikk" },
      { en: "Spear of Shojin", vi: "Ngọn Giáo Shojin" },
      { en: "Archangel's Staff", vi: "Quyền Trượng Thiên Thần" },
      { en: "Titan's Resolve", vi: "Quyền Năng Khổng Lồ" },
      { en: "Thief's Gloves", vi: "Găng Đạo Tặc" },
      { en: "Quicksilver", vi: "Áo Choàng Thủy Ngân" },
      { en: "Gargoyle Stoneplate", vi: "Thú Tượng Thạch Giáp" },
      { en: "Last Whisper", vi: "Cung Xanh" },
      { en: "Morellonomicon", vi: "Quỷ Thư Morello" },
      { en: "Ionic Spark", vi: "Nỏ Sét" },
      { en: "Blue Buff", vi: "Bùa Xanh" },
      { en: "Red Buff", vi: "Bùa Đỏ" },
    ];

    test("common items have 100% valid Vietnamese names, descriptions, and icons", () => {
      for (const { en, vi } of commonItems) {
        const item = getItemVi(en);
        expect(item).toBeDefined();
        expect(item?.name_vi).toBe(vi);
        expect(item?.name_en).toBe(en);
        expect(item?.desc_vi).toBeDefined();
        expect(item?.desc_vi.trim().length).toBeGreaterThan(0);
        expect(item?.icon).toBeDefined();
        expect(item?.icon.trim().length).toBeGreaterThan(0);
      }
    });

    const commonTraits = [
      { en: "Elderwood", vi: "Thần Rừng" },
      { en: "Executioner", vi: "Đao Phủ" },
      { en: "Spellweaver", vi: "Pháp Sư" },
      { en: "Bruiser", vi: "Đấu Sĩ" },
      { en: "Duelist", vi: "Song Đấu" },
      { en: "Assassin", vi: "Sát Thủ" },
      { en: "Vanguard", vi: "Tiên Phong" },
      { en: "Mystic", vi: "Bí Ẩn" },
      { en: "Challenger", vi: "Thách Đấu" },
    ];

    test("common traits have 100% valid Vietnamese names and descriptions", () => {
      for (const { en, vi } of commonTraits) {
        const trait = getTraitVi(en);
        expect(trait).toBeDefined();
        expect(trait?.name_vi).toBe(vi);
        expect(trait?.name_en).toBe(en);
        expect(trait?.desc_vi).toBeDefined();
        expect(trait?.desc_vi.trim().length).toBeGreaterThan(0);
      }
    });
  });

  describe("Augments and Champions coverage", () => {
    test('"Bronze For Life" maps to "Đồng Lòng Đồng Sức"', () => {
      const aug = getAugmentVi("Bronze For Life");
      expect(aug).toBeDefined();
      expect(aug?.name_vi).toBe("Đồng Lòng Đồng Sức");
      expect(aug?.name_en).toBe("Bronze For Life");
      expect(aug?.desc_vi.length).toBeGreaterThan(0);
      expect(dictionary.augments["Bronze For Life"]?.name_vi).toBe("Đồng Lòng Đồng Sức");
    });

    test('"Ahri" champion maps with cost and traits', () => {
      const champ = getChampionVi("Ahri");
      expect(champ).toBeDefined();
      expect(champ?.name_vi).toBe("Ahri");
      expect(champ?.cost).toBe(4);
      expect(Array.isArray(champ?.traits)).toBe(true);
      expect(champ?.traits).toContain("Pháp Sư");
      expect(dictionary.champions["Ahri"]?.name_vi).toBe("Ahri");
    });
  });

  describe("Search entities", () => {
    test("searches by Vietnamese term", () => {
      const results = searchEntities("Vô Cực Kiếm");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.name_vi).toBe("Vô Cực Kiếm");
      expect(results[0]?.entityType).toBe("item");
    });

    test("searches by unaccented Vietnamese query", () => {
      const results = searchEntities("vo cuc");
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r) => r.name_vi === "Vô Cực Kiếm")).toBe(true);
    });

    test("searches by English term", () => {
      const results = searchEntities("Infinity Edge");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.name_vi).toBe("Vô Cực Kiếm");
    });

    test("filters by entity type", () => {
      const traitsOnly = searchEntities("Thần Rừng", { entityType: "trait" });
      expect(traitsOnly.length).toBeGreaterThan(0);
      expect(traitsOnly.every((r) => r.entityType === "trait")).toBe(true);
      expect(traitsOnly[0]?.name_vi).toBe("Thần Rừng");
    });
  });
});
