import { describe, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  syncAcademyData,
  parseComps,
  parseItems,
  parseAugments,
  parseNewSet,
  localizeItem,
  localizeAugment,
  localizeChampion,
  parseTrend,
  parseHexCoordinates,
  writeIfChanged,
  type ParsedAcademyComp,
  type ItemsTierList,
  type AugmentsTierList,
  type Set18Info,
} from "../src/lib/server/academy-sync.js";

const dataDir = path.resolve(import.meta.dir, "../src/lib/data");

describe("TFT Academy Full Scraper & Parser", () => {
  test("unit parser helpers", () => {
    // Hex positioning
    expect(parseHexCoordinates(0)).toEqual({ row: 0, col: 0 });
    expect(parseHexCoordinates(13)).toEqual({ row: 1, col: 6 });
    expect(parseHexCoordinates(21)).toEqual({ row: 3, col: 0 });
    expect(parseHexCoordinates(27)).toEqual({ row: 3, col: 6 });

    // Trends
    expect(parseTrend(1)).toBe("New");
    expect(parseTrend(2)).toBe("Rising");
    expect(parseTrend(3)).toBe("Falling");
    expect(parseTrend(0)).toBeNull();

    // Localization
    const ie = localizeItem("DA_InfinityEdge");
    expect(ie.name_vi).toBe("Vô Cực Kiếm");
    expect(ie.name_en).toBe("Infinity Edge");

    const guinsoo = localizeItem("DA_GuinsoosRageblade");
    expect(guinsoo.name_vi).toBe("Cuồng Đao Guinsoo");
    expect(guinsoo.name_en).toBe("Guinsoo's Rageblade");

    const levelUp = localizeAugment("DA_LevelUp");
    expect(levelUp.name_vi).toBe("Thăng Cấp!");
    expect(levelUp.name_en).toBe("Level Up!");

    const draven = localizeChampion("DA_Draven18", 5);
    expect(draven.name_vi).toBe("Draven");
    expect(draven.name_en).toBe("Draven");
    expect(draven.cost).toBe(5);
  });

  describe("academy-comps.json", () => {
    const compsPath = path.join(dataDir, "academy-comps.json");
    expect(fs.existsSync(compsPath)).toBe(true);

    const comps: ParsedAcademyComp[] = JSON.parse(fs.readFileSync(compsPath, "utf-8"));

    test("contains full list of comps (~73 comps) and all required tiers", () => {
      expect(comps.length).toBeGreaterThanOrEqual(70);

      const tiers = new Set(comps.map((c) => c.tier));
      expect(tiers.has("S")).toBe(true);
      expect(tiers.has("A")).toBe(true);
      expect(tiers.has("B")).toBe(true);
      expect(tiers.has("C")).toBe(true);
      expect(tiers.has("X")).toBe(true);
    });

    test("every comp contains mandatory metadata fields", () => {
      for (const comp of comps) {
        expect(comp.id).toBeTruthy();
        expect(comp.slug).toBeTruthy();
        expect(comp.title).toBeTruthy();
        expect(comp.tier).toMatch(/^[SABCX]$/);
        expect(comp.compStyle).toBeDefined();
        expect(comp.difficulty).toBeDefined();
        expect(comp.levelingCurve).toBeDefined();
        expect(Array.isArray(comp.levelingCurve.earlyComp)).toBe(true);
        expect(Array.isArray(comp.levelingCurve.finalComp)).toBe(true);
        expect(Array.isArray(comp.levelingCurve.stages)).toBe(true);
        expect(Array.isArray(comp.tips)).toBe(true);
        expect(Array.isArray(comp.board)).toBe(true);
      }
    });

    test("S-tier comps have carry, 3 BIS items, tank with 3 items, and hex positions", () => {
      const sTierComps = comps.filter((c) => c.tier === "S");
      expect(sTierComps.length).toBeGreaterThan(0);

      for (const comp of sTierComps) {
        // Carry verification
        expect(comp.mainCarry).toBeDefined();
        expect(comp.mainCarry.id).toBeTruthy();
        expect(comp.mainCarry.name_vi).toBeTruthy();
        expect(comp.mainCarry.name_en).toBeTruthy();
        expect(comp.mainCarry.items.length).toBe(3);
        for (const item of comp.mainCarry.items) {
          expect(item.id).toBeTruthy();
          expect(item.name_vi).toBeTruthy();
          expect(item.name_en).toBeTruthy();
        }

        // Tank verification
        expect(comp.mainTank).toBeDefined();
        expect(comp.mainTank.id).toBeTruthy();
        expect(comp.mainTank.name_vi).toBeTruthy();
        expect(comp.mainTank.name_en).toBeTruthy();
        expect(comp.mainTank.items.length).toBe(3);
        for (const item of comp.mainTank.items) {
          expect(item.id).toBeTruthy();
          expect(item.name_vi).toBeTruthy();
          expect(item.name_en).toBeTruthy();
        }

        // Board hex positions (0..27, row 0..3, col 0..6)
        expect(comp.board.length).toBeGreaterThanOrEqual(7);
        for (const unit of comp.board) {
          expect(unit.id).toBeTruthy();
          expect(unit.name_vi).toBeTruthy();
          expect(unit.name_en).toBeTruthy();
          expect(unit.boardIndex).toBeGreaterThanOrEqual(0);
          expect(unit.boardIndex).toBeLessThanOrEqual(27);
          expect(unit.hex.row).toBeGreaterThanOrEqual(0);
          expect(unit.hex.row).toBeLessThanOrEqual(3);
          expect(unit.hex.col).toBeGreaterThanOrEqual(0);
          expect(unit.hex.col).toBeLessThanOrEqual(6);
          expect(unit.stars).toBeGreaterThanOrEqual(1);
        }

        // Leveling stages & tips
        expect(comp.levelingCurve.stages.length).toBeGreaterThanOrEqual(1);
        expect(comp.tips.length).toBeGreaterThanOrEqual(1);
      }
    });

    test("Draven Ezreal 9 comp has accurate localized translations", () => {
      const dravenComp = comps.find((c) => c.title.toLowerCase().includes("draven ezreal"));
      expect(dravenComp).toBeDefined();
      if (!dravenComp) return;

      expect(dravenComp.tier).toBe("S");
      expect(dravenComp.mainCarry.name_vi).toBe("Draven");
      expect(dravenComp.mainTank.name_vi).toBe("Maokai");

      const carryItemNamesVi = dravenComp.mainCarry.items.map((i) => i.name_vi);
      expect(carryItemNamesVi).toContain("Cuồng Đao Guinsoo");
      expect(carryItemNamesVi).toContain("Kiếm Tử Thần");

      const tankItemNamesVi = dravenComp.mainTank.items.map((i) => i.name_vi);
      expect(tankItemNamesVi).toContain("Giáp Máu Warmog");
      expect(tankItemNamesVi).toContain("Thú Tượng Thạch Giáp");
      expect(tankItemNamesVi).toContain("Áo Choàng Gai");
    });
  });

  describe("academy-items.json", () => {
    const itemsPath = path.join(dataDir, "academy-items.json");
    expect(fs.existsSync(itemsPath)).toBe(true);

    const items: ItemsTierList = JSON.parse(fs.readFileSync(itemsPath, "utf-8"));

    test("contains craftables, radiants, artifacts, emblems categories with S, A, B, C, D tiers", () => {
      const categories: Array<keyof ItemsTierList["categories"]> = [
        "craftables",
        "radiants",
        "artifacts",
        "emblems",
      ];
      const tierKeys: Array<"S" | "A" | "B" | "C" | "D"> = ["S", "A", "B", "C", "D"];

      for (const cat of categories) {
        expect(items.categories[cat]).toBeDefined();
        expect(items[cat]).toBeDefined();
        for (const t of tierKeys) {
          expect(Array.isArray(items[cat][t])).toBe(true);
        }
      }
    });

    test("localizes official Vietnamese names for staple items", () => {
      const allCraftables = [
        ...items.craftables.S,
        ...items.craftables.A,
        ...items.craftables.B,
        ...items.craftables.C,
        ...items.craftables.D,
      ];

      const ie = allCraftables.find((i) => i.name_en === "Infinity Edge" || i.id === "DA_InfinityEdge");
      expect(ie).toBeDefined();
      expect(ie?.name_vi).toBe("Vô Cực Kiếm");

      const shojin = allCraftables.find((i) => i.name_en === "Spear of Shojin" || i.id === "DA_SpearOfShojin");
      expect(shojin).toBeDefined();
      expect(shojin?.name_vi).toBe("Ngọn Giáo Shojin");

      const thievesGloves = allCraftables.find((i) => i.name_en === "Thief's Gloves" || i.id === "DA_ThiefsGloves");
      expect(thievesGloves).toBeDefined();
      expect(thievesGloves?.name_vi).toBe("Găng Đạo Tặc");

      const allArtifacts = [
        ...items.artifacts.S,
        ...items.artifacts.A,
        ...items.artifacts.B,
        ...items.artifacts.C,
        ...items.artifacts.D,
      ];
      expect(allArtifacts.length).toBeGreaterThan(0);
      for (const art of allArtifacts) {
        expect(art.name_vi).toBeTruthy();
        expect(art.name_en).toBeTruthy();
      }

      const allEmblems = [
        ...items.emblems.S,
        ...items.emblems.A,
        ...items.emblems.B,
        ...items.emblems.C,
        ...items.emblems.D,
      ];
      expect(allEmblems.length).toBeGreaterThan(0);
      for (const emb of allEmblems) {
        expect(emb.name_vi).toBeTruthy();
        expect(emb.name_en).toBeTruthy();
      }
    });
  });

  describe("academy-augments.json", () => {
    const augmentsPath = path.join(dataDir, "academy-augments.json");
    expect(fs.existsSync(augmentsPath)).toBe(true);

    const augments: AugmentsTierList = JSON.parse(fs.readFileSync(augmentsPath, "utf-8"));

    test("contains silver, gold, prismatic tiers across S, A, B, C, D", () => {
      const tiers: Array<"silver" | "gold" | "prismatic"> = ["silver", "gold", "prismatic"];
      const subTiers: Array<"S" | "A" | "B" | "C" | "D"> = ["S", "A", "B", "C", "D"];

      for (const tier of tiers) {
        expect(augments[tier]).toBeDefined();
        for (const st of subTiers) {
          expect(Array.isArray(augments[tier][st])).toBe(true);
        }
      }
    });

    test("augments are enriched with Vietnamese names and descriptions", () => {
      const allAugs = [
        ...augments.silver.S, ...augments.silver.A, ...augments.silver.B, ...augments.silver.C,
        ...augments.gold.S, ...augments.gold.A, ...augments.gold.B, ...augments.gold.C,
        ...augments.prismatic.S, ...augments.prismatic.A, ...augments.prismatic.B, ...augments.prismatic.C,
      ];

      expect(allAugs.length).toBeGreaterThan(100);

      // Verify Level Up
      const levelUp = allAugs.find((a) => a.id === "DA_LevelUp" || a.name_en === "Level Up!");
      expect(levelUp).toBeDefined();
      expect(levelUp?.name_vi).toBe("Thăng Cấp!");

      for (const aug of allAugs) {
        expect(aug.id).toBeTruthy();
        expect(aug.name_vi).toBeTruthy();
        expect(aug.name_en).toBeTruthy();
      }
    });
  });

  describe("academy-new-set.json", () => {
    const newSetPath = path.join(dataDir, "academy-new-set.json");
    expect(fs.existsSync(newSetPath)).toBe(true);

    const newSet: Set18Info = JSON.parse(fs.readFileSync(newSetPath, "utf-8"));

    test("contains Set 18 metadata and Wisps mechanic overview", () => {
      expect(newSet.set).toBe(18);
      expect(newSet.setName).toBe("Enchanted Wilds");
      expect(newSet.mechanic.title).toBe("Wisps");
      expect(newSet.mechanic.summary).toContain("Wisps");
      expect(newSet.mechanic.rules.length).toBeGreaterThanOrEqual(3);
    });

    test("contains 200 Wisps with Vietnamese translations", () => {
      expect(newSet.wisps.length).toBe(200);
      for (const wisp of newSet.wisps) {
        expect(wisp.name_en).toBeTruthy();
        expect(wisp.name_vi).toBeTruthy();
        expect(wisp.desc_vi).toBeTruthy();
        expect(typeof wisp.cost).toBe("number");
      }

      const circle = newSet.wisps.find((w) => w.name_en === "Circle of Elders");
      expect(circle).toBeDefined();
      expect(circle?.name_vi).toBe("Hội Đồng Trưởng Lão");
      expect(circle?.cost).toBe(45);
    });

    test("contains 65 champions with Vietnamese names and trait breakdowns", () => {
      expect(newSet.champions.length).toBe(65);
      for (const champ of newSet.champions) {
        expect(champ.id).toBeTruthy();
        expect(champ.name_en).toBeTruthy();
        expect(champ.name_vi).toBeTruthy();
        expect(champ.cost).toBeGreaterThanOrEqual(1);
        expect(champ.cost).toBeLessThanOrEqual(5);
        expect(champ.traits.length).toBeGreaterThanOrEqual(1);
        for (const t of champ.traits) {
          expect(t.name_vi).toBeTruthy();
          expect(t.name_en).toBeTruthy();
        }
      }
    });

    test("contains 36 traits with Vietnamese names", () => {
      expect(newSet.traits.length).toBe(36);
      for (const trait of newSet.traits) {
        expect(trait.id).toBeTruthy();
        expect(trait.name_en).toBeTruthy();
        expect(trait.name_vi).toBeTruthy();
        expect(trait.breakpoints.length).toBeGreaterThanOrEqual(1);
      }

      const elderwood = newSet.traits.find((t) => t.name_en === "Elderwood");
      expect(elderwood).toBeDefined();
      expect(elderwood?.name_vi).toBe("Thần Rừng");

      const adaptor = newSet.traits.find((t) => t.name_en === "Adaptor");
      expect(adaptor).toBeDefined();
      expect(adaptor?.name_vi).toBe("Thích Ứng");
    });

    test("contains 246 new augments with Vietnamese names", () => {
      expect(newSet.augments.length).toBe(246);
      for (const aug of newSet.augments) {
        expect(aug.name_en).toBeTruthy();
        expect(aug.name_vi).toBeTruthy();
        expect(aug.tier).toBeGreaterThanOrEqual(1);
        expect(aug.tier).toBeLessThanOrEqual(3);
        expect(["Silver", "Gold", "Prismatic"]).toContain(aug.tierName);
      }
    });
  });

  test("writeIfChanged skips writes when only updatedAt differs", async () => {
    const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "tft-wic-"));
    const file = path.join(tmpDir, "sample.json");

    expect(writeIfChanged(file, { items: [1, 2], updatedAt: "2026-01-01T00:00:00.000Z" })).toBe(true);
    const before = fs.statSync(file).mtimeMs;

    // Same payload, new timestamp: must not touch the file.
    expect(writeIfChanged(file, { items: [1, 2], updatedAt: "2026-12-31T23:59:59.999Z" })).toBe(false);
    expect(fs.statSync(file).mtimeMs).toBe(before);
    expect(JSON.parse(fs.readFileSync(file, "utf-8")).updatedAt).toBe("2026-01-01T00:00:00.000Z");

    // Real content change: must write.
    expect(writeIfChanged(file, { items: [1, 3], updatedAt: "2026-12-31T23:59:59.999Z" })).toBe(true);
    expect(JSON.parse(fs.readFileSync(file, "utf-8")).items).toEqual([1, 3]);
  });

  test("syncAcademyData execution returns full structured datasets", async () => {
    // Run sync function with mock or live fetch into a temp dir so tests never
    // overwrite the committed data that the site actually serves.
    const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "tft-sync-"));
    const result = await syncAcademyData({ dataDir: tmpDir });
    expect(result.comps.length).toBeGreaterThanOrEqual(70);
    expect(result.items.categories.craftables.S.length).toBeGreaterThan(0);
    expect(result.augments.silver.S.length).toBeGreaterThan(0);
    expect(result.newSet.champions.length).toBe(65);
    expect(result.newSet.wisps.length).toBe(200);
  });
});
