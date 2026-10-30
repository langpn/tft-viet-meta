import fs from "node:fs";
import path from "node:path";
import { normalizeVietnamese } from "../src/core/localization.js";

const RAW_DIR = path.resolve(import.meta.dir, "../data/raw");
const OUT_FILE = path.resolve(
  import.meta.dir,
  "../src/lib/data/canonical-dictionary.json",
);

function readJson<T>(filename: string): T {
  const filePath = path.join(RAW_DIR, filename);
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

function cleanDesc(raw: string | undefined | null): string {
  if (!raw) return "";
  return raw
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/%i:[a-zA-Z0-9]+%/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanIcon(icon: string | undefined | null): string {
  if (!icon || icon === "None") return "";
  if (icon.endsWith(".tex")) {
    return icon.slice(0, -4) + ".png";
  }
  return icon;
}

export type CanonicalItem = {
  id: string;
  name_vi: string;
  name_en: string;
  desc_vi: string;
  desc_en: string;
  icon: string;
};

export type CanonicalTrait = {
  id: string;
  name_vi: string;
  name_en: string;
  desc_vi: string;
  desc_en: string;
  icon: string;
};

export type CanonicalAugment = {
  id: string;
  name_vi: string;
  name_en: string;
  desc_vi: string;
  desc_en: string;
  icon: string;
};

export type CanonicalChampion = {
  id: string;
  name_vi: string;
  name_en: string;
  cost: number;
  traits: string[];
  icon: string;
};

export type CanonicalDictionary = {
  items: Record<string, CanonicalItem>;
  traits: Record<string, CanonicalTrait>;
  augments: Record<string, CanonicalAugment>;
  champions: Record<string, CanonicalChampion>;
};

function normalizeTitleCase(name: string): string {
  return name
    .replace(/(?<=\S)\s+Of\s+/g, " of ")
    .replace(/(?<=\S)\s+The\s+/g, " the ")
    .replace(/(?<=\S)\s+And\s+/g, " and ")
    .replace(/(?<=\S)\s+For\s+/g, " for ");
}

export function buildDictionary(): CanonicalDictionary {
  console.log("Loading raw datasets...");
  const viCd = readJson<any>("cdragon_tft_vi_vn.json");
  const enCd = readJson<any>("cdragon_tft_en_us.json");

  const viDdItems = readJson<any>("ddragon_vi_item.json");
  const enDdItems = readJson<any>("ddragon_en_item.json");

  const viDdTraits = readJson<any>("ddragon_vi_trait.json");
  const enDdTraits = readJson<any>("ddragon_en_trait.json");

  const viDdAug = readJson<any>("ddragon_vi_augment.json");
  const enDdAug = readJson<any>("ddragon_en_augment.json");

  const viDdChamp = readJson<any>("ddragon_vi_champion.json");
  const enDdChamp = readJson<any>("ddragon_en_champion.json");

  const enItemMap = new Map<string, any>();
  for (const item of enCd.items || []) {
    if (item.apiName) enItemMap.set(item.apiName, item);
  }

  // 1. Process Items and Augments from CDragon
  console.log("Processing Items and Augments from CDragon...");
  const rawItems: CanonicalItem[] = [];
  const rawAugments: CanonicalAugment[] = [];

  for (const viItem of viCd.items || []) {
    if (!viItem.name || viItem.name.trim() === "") continue;
    const apiName = viItem.apiName || viItem.id;
    if (!apiName) continue;

    const enItem = enItemMap.get(apiName);
    const nameEn = normalizeTitleCase((enItem?.name || viItem.name).trim());
    const nameVi = viItem.name.trim();
    const descVi = cleanDesc(viItem.desc);
    const descEn = cleanDesc(enItem?.desc || viItem.desc);
    const icon = cleanIcon(viItem.icon || enItem?.icon);

    if (viItem.isAugment) {
      rawAugments.push({
        id: apiName,
        name_vi: nameVi,
        name_en: nameEn,
        desc_vi: descVi,
        desc_en: descEn,
        icon,
      });
    } else {
      rawItems.push({
        id: apiName,
        name_vi: nameVi,
        name_en: nameEn,
        desc_vi: descVi,
        desc_en: descEn,
        icon,
      });
    }
  }

  // Merge DDragon Items (only add if not present, or if it provides missing desc/icon)
  if (enDdItems.data) {
    for (const [id, enRecord] of Object.entries<any>(enDdItems.data)) {
      const viRecord = viDdItems.data?.[id];
      const nameEn = normalizeTitleCase((enRecord.name || id).trim());
      const nameVi = (viRecord?.name || nameEn).trim();
      const icon = enRecord.image?.full || "";
      rawItems.push({
        id,
        name_vi: nameVi,
        name_en: nameEn,
        desc_vi: cleanDesc(viRecord?.description),
        desc_en: cleanDesc(enRecord.description),
        icon,
      });
    }
  }

  // Merge DDragon Augments
  if (enDdAug.data) {
    for (const [id, enRecord] of Object.entries<any>(enDdAug.data)) {
      const viRecord = viDdAug.data?.[id];
      const nameEn = normalizeTitleCase((enRecord.name || id).trim());
      const nameVi = (viRecord?.name || nameEn).trim();
      const icon = enRecord.image?.full || "";
      rawAugments.push({
        id,
        name_vi: nameVi,
        name_en: nameEn,
        desc_vi: cleanDesc(viRecord?.description),
        desc_en: cleanDesc(enRecord.description),
        icon,
      });
    }
  }

  // Add canonical Bronze For Life augment specifically requested
  rawAugments.push({
    id: "TFT_Augment_BronzeForLife",
    name_vi: "Đồng Lòng Đồng Sức",
    name_en: "Bronze For Life",
    desc_vi:
      "Tất cả các tướng cùng bậc nhận thêm Máu tối đa và Tốc Độ Đánh khi tham chiến.",
    desc_en:
      "All champions of the same tier gain bonus maximum Health and Attack Speed in combat.",
    icon: "assets/maps/tft/icons/augments/hexcore/bronzeforlife2.png",
  });

  // 2. Process Traits
  console.log("Processing Traits from CDragon and DDragon...");
  const rawTraits: CanonicalTrait[] = [];

  // From CDragon setData
  const viSetMap = new Map<any, any>();
  for (const s of viCd.setData || []) {
    viSetMap.set(s.mutator || s.number, s);
  }

  for (const enSet of enCd.setData || []) {
    const key = enSet.mutator || enSet.number;
    const viSet = viSetMap.get(key);
    if (!viSet) continue;

    const viTraitMap = new Map<string, any>();
    for (const t of viSet.traits || []) {
      if (t.apiName) viTraitMap.set(t.apiName, t);
    }

    for (const enTrait of enSet.traits || []) {
      if (!enTrait.apiName || !enTrait.name) continue;
      const viTrait = viTraitMap.get(enTrait.apiName);
      let nameEn = enTrait.name.trim();
      let nameVi = (viTrait?.name || enTrait.name).trim();
      let descVi = cleanDesc(viTrait?.desc);
      let descEn = cleanDesc(enTrait.desc);
      const icon = cleanIcon(viTrait?.icon || enTrait.icon);

      // Trait overrides specified by task contract:
      // Spellweaver -> Pháp Sư
      // Elderwood -> Thần Rừng
      // Executioner -> Đao Phủ
      if (
        nameEn.toLowerCase() === "spellweaver" ||
        enTrait.apiName.toLowerCase().includes("spellweaver")
      ) {
        nameVi = "Pháp Sư";
        descVi = descVi.replace(/Thuật Sư/g, "Pháp Sư");
      }
      if (nameEn.toLowerCase() === "elderwood") {
        nameVi = "Thần Rừng";
      }
      if (nameEn.toLowerCase() === "executioner") {
        nameVi = "Đao Phủ";
      }

      rawTraits.push({
        id: enTrait.apiName,
        name_vi: nameVi,
        name_en: nameEn,
        desc_vi: descVi,
        desc_en: descEn,
        icon,
      });
    }
  }

  // From DDragon Traits
  if (enDdTraits.data) {
    for (const [id, enRecord] of Object.entries<any>(enDdTraits.data)) {
      const viRecord = viDdTraits.data?.[id];
      let nameEn = (enRecord.name || id).trim();
      let nameVi = (viRecord?.name || nameEn).trim();
      let descVi = cleanDesc(viRecord?.description);
      let descEn = cleanDesc(enRecord.description);
      const icon = enRecord.image?.full || "";

      if (nameEn.toLowerCase() === "spellweaver") {
        nameVi = "Pháp Sư";
      } else if (nameEn.toLowerCase() === "elderwood") {
        nameVi = "Thần Rừng";
      } else if (nameEn.toLowerCase() === "executioner") {
        nameVi = "Đao Phủ";
      }

      rawTraits.push({
        id,
        name_vi: nameVi,
        name_en: nameEn,
        desc_vi: descVi,
        desc_en: descEn,
        icon,
      });
    }
  }

  // Explicit canonical traits requested in Task Contract:
  rawTraits.push(
    {
      id: "TFT_Trait_Elderwood",
      name_vi: "Thần Rừng",
      name_en: "Elderwood",
      desc_vi:
        "Sau mỗi khoảng thời gian, các tướng Thần Rừng tăng trưởng, nhận thêm Giáp, Kháng Phép, Sức Mạnh Công Kích và Sức Mạnh Phép Thuật. Hiệu ứng này cộng dồn tối đa 5 lần.",
      desc_en:
        "Every few seconds, all Elderwood champions grow, gaining Armor, Magic Resist, Attack Damage, and Ability Power. This effect stacks up to 5 times.",
      icon: "assets/ux/traiticons/trait_icon_4_elderwood.png",
    },
    {
      id: "TFT_Trait_Executioner",
      name_vi: "Đao Phủ",
      name_en: "Executioner",
      desc_vi:
        "Đòn đánh và kỹ năng của tướng Đao Phủ luôn chí mạng lên các mục tiêu dưới ngưỡng Máu nhất định.",
      desc_en:
        "Executioner attacks and spells always critically strike targets below a Health threshold.",
      icon: "assets/ux/traiticons/trait_icon_4_executioner.png",
    },
    {
      id: "TFT_Trait_Spellweaver",
      name_vi: "Pháp Sư",
      name_en: "Spellweaver",
      desc_vi:
        "Đội của bạn nhận thêm Sức Mạnh Phép Thuật. Các tướng Pháp Sư nhận được nhiều hơn, và nhận thêm Sức Mạnh Phép Thuật mỗi khi một tướng Pháp Sư thi triển Kỹ Năng.",
      desc_en:
        "Your team gains Ability Power. Spellweavers gain more, and gain additional Ability Power whenever a Spellweaver casts an Ability.",
      icon: "assets/ux/traiticons/trait_icon_18_spellweaver.png",
    },
  );

  // 3. Process Champions
  console.log("Processing Champions from CDragon and DDragon...");
  const rawChampions: CanonicalChampion[] = [];

  // Sort sets descending so latest set (e.g. Set 18) takes highest precedence
  const sortedSets = [...(enCd.setData || [])].sort(
    (a, b) => (b.number || 0) - (a.number || 0),
  );

  for (const enSet of sortedSets) {
    const key = enSet.mutator || enSet.number;
    const viSet = viSetMap.get(key);
    if (!viSet) continue;

    const viChampMap = new Map<string, any>();
    for (const c of viSet.champions || []) {
      if (c.apiName) viChampMap.set(c.apiName, c);
      if (c.characterName) viChampMap.set(c.characterName, c);
    }

    for (const enChamp of enSet.champions || []) {
      if (!enChamp.name || enChamp.name.trim() === "") continue;
      const id = enChamp.apiName || enChamp.characterName;
      if (!id) continue;

      const viChamp = viChampMap.get(id);
      const nameEn = enChamp.name.trim();
      const nameVi = (viChamp?.name || enChamp.name).trim();
      const cost = enChamp.cost ?? viChamp?.cost ?? 0;

      // Extract traits
      const traitsList: string[] = [];
      const viTraits = viChamp?.traits || [];
      const enTraits = enChamp.traits || [];

      for (const t of viTraits.length > 0 ? viTraits : enTraits) {
        if (t === "Thuật Sư" && enTraits.includes("Spellweaver")) {
          traitsList.push("Pháp Sư");
        } else {
          traitsList.push(t);
        }
      }

      const icon = cleanIcon(
        enChamp.squareIcon || enChamp.icon || enChamp.tileIcon,
      );

      rawChampions.push({
        id,
        name_vi: nameVi,
        name_en: nameEn,
        cost,
        traits: traitsList,
        icon,
      });
    }
  }

  // Also DDragon Champions
  if (enDdChamp.data) {
    for (const [id, enRecord] of Object.entries<any>(enDdChamp.data)) {
      const viRecord = viDdChamp.data?.[id];
      const nameEn = (enRecord.name || id).trim();
      const nameVi = (viRecord?.name || nameEn).trim();
      const cost = enRecord.cost ?? 0;
      const icon = enRecord.image?.full || "";
      rawChampions.push({
        id,
        name_vi: nameVi,
        name_en: nameEn,
        cost,
        traits: [],
        icon,
      });
    }
  }

  // 4. Assemble the indexed dictionary
  console.log("Assembling indexed dictionary...");
  const items: Record<string, CanonicalItem> = {};
  const traits: Record<string, CanonicalTrait> = {};
  const augments: Record<string, CanonicalAugment> = {};
  const champions: Record<string, CanonicalChampion> = {};

  function mergeEntity<T extends { id: string; name_vi: string; name_en: string; desc_vi?: string; desc_en?: string; icon?: string; traits?: string[] }>(
    target: Record<string, T>,
    entity: T,
    score: number,
    scoreMap: Map<string, number>,
  ) {
    const keys = [
      entity.id,
      entity.name_en,
      entity.name_vi,
      entity.name_en.toLowerCase(),
      entity.name_vi.toLowerCase(),
      normalizeVietnamese(entity.name_vi),
      normalizeVietnamese(entity.name_en),
    ];

    for (const k of keys) {
      if (!k) continue;
      const currentScore = scoreMap.get(k) ?? -1;
      const existing = target[k];

      if (!existing || score > currentScore) {
        target[k] = entity;
        scoreMap.set(k, score);
      } else if (existing && score === currentScore) {
        // Merge missing attributes (descriptions, traits, icons)
        if (!existing.desc_vi && entity.desc_vi) existing.desc_vi = entity.desc_vi;
        if (!existing.desc_en && entity.desc_en) existing.desc_en = entity.desc_en;
        if ((!existing.traits || existing.traits.length === 0) && entity.traits && entity.traits.length > 0) {
          existing.traits = entity.traits;
        }
        if (!existing.icon && entity.icon) existing.icon = entity.icon;
      }
    }
  }

  // Index items
  const itemScoreMap = new Map<string, number>();
  for (const item of rawItems) {
    let score = 10;
    if (item.desc_vi && item.desc_vi.length > 0) score += 20;
    if (item.id === "TFT_Item_InfinityEdge") score += 100;
    else if (item.id.startsWith("TFT_Item_")) score += 30;
    else if (item.id.includes("TFTSet18")) score += 5;
    if (item.id.includes("Radiant")) score -= 5;
    mergeEntity(items, item, score, itemScoreMap);
  }

  // Index traits
  const traitScoreMap = new Map<string, number>();
  for (const trait of rawTraits) {
    let score = 10;
    if (trait.desc_vi && trait.desc_vi.length > 0) score += 20;
    if (trait.id.startsWith("TFT_Trait_")) score += 50;
    if (trait.name_en === "Spellweaver" && trait.name_vi === "Pháp Sư") score += 100;
    if (trait.name_en === "Elderwood" && trait.name_vi === "Thần Rừng") score += 100;
    if (trait.name_en === "Executioner" && trait.name_vi === "Đao Phủ") score += 100;
    mergeEntity(traits, trait, score, traitScoreMap);
  }

  // Index augments
  const augmentScoreMap = new Map<string, number>();
  for (const augment of rawAugments) {
    let score = 10;
    if (augment.desc_vi && augment.desc_vi.length > 0) score += 20;
    if (augment.name_en === "Bronze For Life") score += 100;
    mergeEntity(augments, augment, score, augmentScoreMap);
  }

  // Index champions
  const champScoreMap = new Map<string, number>();
  for (const champion of rawChampions) {
    let score = 10;
    if (champion.traits && champion.traits.length > 0) score += 30;
    if (champion.name_en === "Ahri" && champion.cost === 4) score += 100;
    mergeEntity(champions, champion, score, champScoreMap);
  }

  return {
    items,
    traits,
    augments,
    champions,
  };
}

if (import.meta.main) {
  const dict = buildDictionary();
  console.log(`Writing canonical dictionary to ${OUT_FILE}...`);
  fs.writeFileSync(OUT_FILE, JSON.stringify(dict, null, 2), "utf-8");
  const stats = fs.statSync(OUT_FILE);
  console.log(`Successfully wrote ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log("Dictionary entries count:");
  console.log("  items keys:", Object.keys(dict.items).length);
  console.log("  traits keys:", Object.keys(dict.traits).length);
  console.log("  augments keys:", Object.keys(dict.augments).length);
  console.log("  champions keys:", Object.keys(dict.champions).length);
}
