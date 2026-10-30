import fs from "node:fs";
import path from "node:path";
import {
  getItemVi,
  getTraitVi,
  getAugmentVi,
  getChampionVi,
  type CanonicalItem,
  type CanonicalChampion,
  type CanonicalAugment,
  type CanonicalTrait,
} from "./dictionary.js";

export type Trend = "Rising" | "Falling" | "New" | null;

export type LocalizedItem = {
  id: string;
  name_en: string;
  name_vi: string;
  desc_en: string;
  desc_vi: string;
  icon: string;
};

export type LocalizedAugment = {
  id: string;
  name_en: string;
  name_vi: string;
  desc_en: string;
  desc_vi: string;
  icon: string;
};

export type LocalizedChampion = {
  id: string;
  name_en: string;
  name_vi: string;
  cost: number;
  icon: string;
  traits: string[];
};

export type LocalizedUnit = {
  id: string;
  name_en: string;
  name_vi: string;
  cost: number;
  icon: string;
  boardIndex: number;
  hex: {
    row: number;
    col: number;
  };
  stars: number;
  items: LocalizedItem[];
  trait?: string | null;
};

export type CompLevelingCurve = {
  earlyComp: Array<{
    id: string;
    name_en: string;
    name_vi: string;
    cost: number;
    stars: number;
    items: LocalizedItem[];
  }>;
  midComp: Array<{
    id: string;
    name_en: string;
    name_vi: string;
    cost: number;
    stars: number;
    items: LocalizedItem[];
  }>;
  finalComp: LocalizedUnit[];
  stages: Array<{ stage: string; tip: string }>;
};

export type CoreBadge = {
  type: "item" | "augment";
  id: string;
  name_en: string;
  name_vi: string;
  icon: string;
};

export type ParsedAcademyComp = {
  id: string;
  slug: string;
  title: string;
  metaTitle: string;
  tier: "S" | "A" | "B" | "C" | "X";
  trend: Trend;
  sticker?: number;
  situationalTier?: "S" | "A" | "B" | "C" | null;
  compStyle: string;
  difficulty: string;
  mainCarry: {
    id: string;
    name_en: string;
    name_vi: string;
    cost: number;
    icon: string;
    items: LocalizedItem[];
  };
  mainTank: {
    id: string;
    name_en: string;
    name_vi: string;
    cost: number;
    icon: string;
    items: LocalizedItem[];
  };
  coreBadges: CoreBadge[];
  mainItem?: LocalizedItem | null;
  mainAugment?: LocalizedAugment | null;
  board: LocalizedUnit[];
  finalChampions: LocalizedUnit[];
  carousel: LocalizedItem[];
  altBuildsList: Array<{
    champ: LocalizedChampion;
    items: LocalizedItem[];
  }>;
  levelingCurve: CompLevelingCurve;
  tips: Array<{ stage: string; tip: string }>;
  augments: Array<{
    id: string;
    name_en: string;
    name_vi: string;
    icon: string;
    disabled?: boolean;
  }>;
  augmentsTip: string;
  maxCap: Array<{
    id: string;
    name_en: string;
    name_vi: string;
    predecessors?: string[];
  }>;
};

export type ItemsTierList = {
  categories: {
    craftables: Record<"S" | "A" | "B" | "C" | "D", LocalizedItem[]>;
    radiants: Record<"S" | "A" | "B" | "C" | "D", LocalizedItem[]>;
    artifacts: Record<"S" | "A" | "B" | "C" | "D", LocalizedItem[]>;
    emblems: Record<"S" | "A" | "B" | "C" | "D", LocalizedItem[]>;
  };
  craftables: Record<"S" | "A" | "B" | "C" | "D", LocalizedItem[]>;
  radiants: Record<"S" | "A" | "B" | "C" | "D", LocalizedItem[]>;
  artifacts: Record<"S" | "A" | "B" | "C" | "D", LocalizedItem[]>;
  emblems: Record<"S" | "A" | "B" | "C" | "D", LocalizedItem[]>;
  updatedAt: string;
};

export type AugmentsTierList = {
  silver: Record<"S" | "A" | "B" | "C" | "D", LocalizedAugment[]>;
  gold: Record<"S" | "A" | "B" | "C" | "D", LocalizedAugment[]>;
  prismatic: Record<"S" | "A" | "B" | "C" | "D", LocalizedAugment[]>;
  stages: {
    silver: Record<string, Record<"S" | "A" | "B" | "C" | "D", LocalizedAugment[]>>;
    gold: Record<string, Record<"S" | "A" | "B" | "C" | "D", LocalizedAugment[]>>;
    prismatic: Record<string, Record<"S" | "A" | "B" | "C" | "D", LocalizedAugment[]>>;
  };
  updatedAt: string;
};

export type Set18Wisp = {
  name_en: string;
  name_vi: string;
  category: string;
  cost: number;
  desc_en: string;
  desc_vi: string;
  rules: string;
};

export type Set18Champion = {
  id: string;
  name_en: string;
  name_vi: string;
  cost: number;
  traits: Array<{
    id: string;
    name_en: string;
    name_vi: string;
  }>;
  abilityName: string;
  abilityMana: string;
  ability: string;
  desc_vi: string;
  icon: string;
};

export type Set18Trait = {
  id: string;
  name_en: string;
  name_vi: string;
  type: string;
  breakpoints: number[];
  colors: string[];
  desc_en: string;
  desc_vi: string;
  effects: string[];
  icon: string;
};

export type Set18Augment = {
  id: string;
  name_en: string;
  name_vi: string;
  tier: number;
  tierName: "Silver" | "Gold" | "Prismatic";
  desc_en: string;
  desc_vi: string;
  icon: string;
};

export type Set18Info = {
  set: number;
  setName: string;
  patch: string;
  mechanic: {
    title: string;
    summary: string;
    description: string;
    rules: string[];
  };
  wisps: Set18Wisp[];
  champions: Set18Champion[];
  traits: Set18Trait[];
  augments: Set18Augment[];
  updatedAt: string;
};

// Fallback & custom translations for items/augments/champions/traits not directly resolved in standard dictionary
const CHAMPION_FALLBACKS: Record<string, Partial<CanonicalChampion>> = {
  "Raptor": { id: "DA_CrimsonRaptor18", name_en: "Mama Beak", name_vi: "Chim Mẹ", cost: 3 },
  "Ancient Sentinel": { id: "DA_Sentinel18", name_en: "Sentinel", name_vi: "Người Đá", cost: 4 },
  "The Elder Dragon": { id: "DA_18_ElderDragon", name_en: "Elder Dragon", name_vi: "Rồng Ngàn Tuổi", cost: 5 },
  "DA_Elderwood18_Lifeblossom": { id: "DA_Elderwood18_Lifeblossom", name_en: "Lifeblossom", name_vi: "Hoa Thần Rừng", cost: 0 },
  "DA_Elderwood18_StonebarkTree": { id: "DA_Elderwood18_StonebarkTree", name_en: "Stonebark Tree", name_vi: "Cây Vỏ Đá", cost: 0 },
  "DA_Elderwood18_Protector": { id: "DA_Elderwood18_Protector", name_en: "Elderwood Protector", name_vi: "Hộ Vệ Thần Rừng", cost: 0 },
};

const TRAIT_FALLBACKS: Record<string, Partial<CanonicalTrait>> = {
  "Eldritch": {
    id: "TFT12_Eldritch",
    name_en: "Eldritch",
    name_vi: "Kỳ Quái",
    desc_en: "Summon an Ancient God when your team loses enough Health.",
    desc_vi: "Triệu hồi một Cự Thần Cổ Xưa khi đội của bạn mất một lượng Máu nhất định.",
  },
};

const AUGMENT_FALLBACKS: Record<string, Partial<CanonicalAugment>> = {
  "DA_PandorasItemsII": {
    id: "TFT9_Augment_PandorasItems2",
    name_en: "Pandora's Items II",
    name_vi: "Hộp Pandora II",
    desc_en: "Gain 1 random component. At the start of each round, items on your bench are randomized.",
    desc_vi: "Nhận 1 trang bị thành phần ngẫu nhiên. Ở đầu mỗi vòng đấu, các trang bị trên hàng dự bị sẽ được ngẫu nhiên hóa.",
  },
  "DA_18_RiftbeastTraitAugmentStampede": {
    id: "DA_18_RiftbeastTraitAugmentStampede",
    name_en: "Stampede",
    name_vi: "Quái Thú Vực Thẳm - Dẫm Đạp",
    desc_en: "Riftbeasts gain bonus stats and trample enemies.",
    desc_vi: "Tướng Quái Thú Vực Thẳm nhận thêm chỉ số và dẫm đạp kẻ địch khi di chuyển.",
  },
  "DA_18_FloraFatalisAugmentPlus": {
    id: "DA_18_FloraFatalisAugmentPlus",
    name_en: "Flora Fatalis+",
    name_vi: "Chi Linh Tử Địa+",
    desc_en: "Gain a Flora Fatalis Emblem and a Flora Fatalis champion.",
    desc_vi: "Nhận 1 Ấn Chi Linh Tử Địa và 1 tướng Chi Linh Tử Địa.",
  },
};

const WISP_FALLBACKS: Record<string, { name_vi: string; desc_vi: string }> = {
  "Fake Level": { name_vi: "Cấp Độ Giả", desc_vi: "Tạm thời tăng lên cấp 10 trong vòng đấu này." },
  "Tornado": { name_vi: "Lốc Xoáy", desc_vi: "Triệu hồi một cơn lốc xoáy gây sát thương phép bằng 5% Máu tối đa lên kẻ địch." },
  "Thingamjig Sack": { name_vi: "Bao Đồ Kỳ Bí Lớn", desc_vi: "Nhận 5 vật phẩm tiêu thụ ngẫu nhiên tăng SMPT hoặc Hồi Năng Lượng." },
  "Blood Ritual": { name_vi: "Hiến Tế Máu", desc_vi: "Mất 9 Máu Linh Thú. Nhận 1 Máy Nhân Bản Tướng." },
  "Good Loss": { name_vi: "Thua Có Lời", desc_vi: "Trong 3 vòng giao tranh người chơi tiếp theo, nhận 6 XP nếu bạn thua." },
  "Field of Mice": { name_vi: "Đồng Chuột", desc_vi: "Nhận 1 Máy Nhân Bản Cỡ Nhỏ cho mỗi tướng 1 vàng khác nhau bạn đưa vào sân." },
  "All In": { name_vi: "Tất Tay", desc_vi: "Nếu thắng 3 vòng giao tranh tiếp theo, tăng cấp." },
  "Component Bounty": { name_vi: "Tiền Thưởng Trang Bị", desc_vi: "Nếu thắng giao tranh người chơi tiếp theo, nhận 1 Gói Trang Bị Thành Phần." },
  "Minor Blood Ritual": { name_vi: "Hiến Tế Máu Nhỏ", desc_vi: "Mất 3 Máu Linh Thú. Nhận 1 Máy Nhân Bản Cỡ Nhỏ." },
  "Fae Federation": { name_vi: "Liên Đoàn Tiên Tộc", desc_vi: "TẤT CẢ tướng của bạn nhận 2 Tinh Linh Tiên Tộc trong vòng này." },
  "Minion Horde": { name_vi: "Đàn Lính", desc_vi: "Triệu hồi 4 quân lính." },
  "Melting Resists": { name_vi: "Nung Chảy Kháng Cự", desc_vi: "Kẻ địch bị Thiêu Đốt mất 3 Giáp và Kháng Phép mỗi giây." },
  "Thingamjig Bag": { name_vi: "Túi Đồ Kỳ Bí", desc_vi: "Nhận 3 vật phẩm tiêu thụ ngẫu nhiên tăng SMPT hoặc Hồi Năng Lượng." },
  "Memorial Dummy": { name_vi: "Hình Nộm Tưởng Niệm", desc_vi: "Tướng chống chịu có trang bị đầu tiên của bạn khi chết sẽ triệu hồi 1 Hình Nộm mang các trang bị đó." },
  "Horse's Visit": { name_vi: "Ngựa Thăm Viếng", desc_vi: "Nhận bùa lợi Nguyên Thủy Mã cho giao tranh này." },
  "Golden Road": { name_vi: "Con Đường Vàng", desc_vi: "Sau 3 vòng giao tranh với người chơi, nhận 3 vàng cho mỗi trận thắng." },
  "Escalation": { name_vi: "Leo Thang", desc_vi: "Sau 15 giây giao tranh, toàn đội nhận thêm 30% Khuếch Đại Sát Thương." },
  "Ritual Complete": { name_vi: "Hoàn Thành Nghi Lễ", desc_vi: "Nếu thắng giao tranh này, hoàn thành ngay nghi thức Tiên Hắc Ám hiện tại." },
  "New and Improved": { name_vi: "Mới Và Cải Tiến", desc_vi: "Nhận 1 Máy Tái Tạo Bỏ Túi." },
  "Major Gambit": { name_vi: "Canh Bạc Lớn", desc_vi: "Nếu thắng vòng giao tranh người chơi tiếp theo, nhận 10 vàng." },
  "Healing Pool": { name_vi: "Hồ Hồi Phục", desc_vi: "Hồi 5 Máu Linh Thú." },
  "Bunch O' Belts": { name_vi: "Một Đống Đai Lưng", desc_vi: "Các tướng của bạn nhận 7 Đai Lưng Khổng Lồ tạm thời không thể tháo rời." },
  "Friendly Flora": { name_vi: "Chi Linh Thân Thiện", desc_vi: "Tất cả đồng minh nhận chỉ số cộng thêm của Chi Linh Tử Địa với 50% hiệu lực." },
  "Comfort Food": { name_vi: "Thức Ăn An Ủi", desc_vi: "Hồi 2 Máu Linh Thú. Nếu thua giao tranh tiếp theo, hồi thêm 4 Máu." },
  "Blood Hunt": { name_vi: "Săn Máu", desc_vi: "Tướng Đối Đầu lướt tới mục tiêu khi hạ gục và gây 150 sát thương vật lý." },
  "Double Up": { name_vi: "Nhân Đôi", desc_vi: "Linh Linh tiếp theo được mua sẽ kích hoạt 2 lần nhưng giá tăng gấp đôi." },
  "Drought": { name_vi: "Hạn Hán", desc_vi: "Cộng thêm 2 vào chuỗi thua của bạn." },
  "Minor Gambit": { name_vi: "Canh Bạc Nhỏ", desc_vi: "Nếu thắng vòng giao tranh người chơi tiếp theo, nhận 2 vàng." },
  "Take One With Ya": { name_vi: "Kéo Kẻ Địch Theo", desc_vi: "Nếu thua và hạ gục ít nhất 1 tướng địch, nhận 4 XP." },
  "Flood": { name_vi: "Lũ Lụt", desc_vi: "Cộng thêm 2 vào chuỗi thắng của bạn." },
  "Breeze": { name_vi: "Làn Gió Mát", desc_vi: "Toàn đội nhận thêm 12% Tốc Độ Đánh." },
  "Faerie Flight": { name_vi: "Tiên Tộc Bay Lượn", desc_vi: "Thu hút thêm 100% Tinh Linh Tiên Tộc trong giao tranh này." },
  "Better Bestie": { name_vi: "Bạn Tốt Hơn", desc_vi: "Bạn thân cưỡi nhận thêm 15% Tốc Độ Đánh và 150 Máu." },
  "Protective Ritual": { name_vi: "Nghi Thức Bảo Hộ", desc_vi: "Giảm 3 sát thương Linh Thú phải nhận trong vòng này." },
  "Consumable Shop": { name_vi: "Cửa Hàng Tiêu Thụ", desc_vi: "Mở một cửa hàng nơi bạn có thể dùng vàng để mua trang bị tiêu thụ." },
  "Thingamjig Jar": { name_vi: "Hũ Đồ Kỳ Bí", desc_vi: "Nhận 1 vật phẩm tiêu thụ ngẫu nhiên tăng SMPT hoặc Hồi Năng Lượng." },
  "Sinister Deal": { name_vi: "Thỏa Thuận Hắc Ám", desc_vi: "Mất 3 Máu Linh Thú. Nhận 2 vàng." },
  "Truce": { name_vi: "Đình Chiến", desc_vi: "Nhận 1 vàng. Đối thủ của bạn cũng nhận 1 vàng." },
  "Golden Altar": { name_vi: "Bàn Thờ Vàng", desc_vi: "Nhận vàng dựa trên giá tiền và bậc sao của vật hiến tế Kỳ Quái." },
  "Brutal Bargain": { name_vi: "Mặc Cả Tàn Khốc", desc_vi: "Mất 8 Máu Linh Thú và nhận 1 Gói Trang Bị Thành Phần." },
  "Premium Swap Meet": { name_vi: "Phiên Chợ Đổi Đồ Cao Cấp", desc_vi: "Bán 1 tướng 3 sao để nhận 3 lượt đổi lại và 1 Rương Trang Bị May Mắn." },
  "Touch Grass": { name_vi: "Chạm Vào Cỏ", desc_vi: "Nhận 5 Vàng và khóa mọi hành động trong 15 giây. Sau 15 giây nếu không hành động, nhận thêm 2 Vàng." },
};

const CORE_TANK_ITEMS = new Set([
  "DA_WarmogsArmor", "DA_GargoyleStoneplate", "DA_BrambleVest", "DA_DragonsClaw",
  "DA_ProtectorsVow", "DA_Crownguard", "DA_SunfireCape", "DA_SpiritVisage",
  "DA_SteadfastHeart", "DA_Evenshroud", "DA_IonicSpark", "DA_Redemption",
  "DA_Artifact_MogulsMail", "DA_Artifact_LightshieldCrest", "DA_Artifact_TheIndomitable",
  "DA_Artifact_SilvermereDawn", "DA_Artifact_AegisOfDawn", "DA_Artifact_VoidGauntlet",
  "DA_Artifact_ForbiddenIdol", "DA_Artifact_AnimaVisage", "DA_WarmogsArmorRadiant",
  "DA_GargoyleStoneplateRadiant", "DA_BrambleVestRadiant", "DA_DragonsClawRadiant",
  "DA_ProtectorsVowRadiant", "DA_CrownguardRadiant", "DA_SunfireCapeRadiant",
  "DA_SpiritVisageRadiant", "DA_SteadfastHeartRadiant", "DA_RedemptionRadiant"
]);

const BRUISER_ITEMS = new Set([
  "DA_TitansResolve", "DA_SteraksGage", "DA_Bloodthirster", "DA_ThiefsGloves",
  "DA_EdgeOfNight", "DA_Quicksilver", "DA_HandOfJustice"
]);

export function cleanItemName(id: string): string {
  return id
    .replace(/^DA_Component_/, "")
    .replace(/^DA_Artifact_/, "")
    .replace(/^DA_18_Emblem/, "")
    .replace(/^DA_/, "")
    .replace(/Radiant$/, "");
}

export function localizeItem(id: string): LocalizedItem {
  const isArtifact = id.includes("Artifact") || id.includes("Mitten") || id.includes("Silvermere") || id.includes("Fishbone");
  const canonical = getItemVi(id);
  if (canonical) {
    return {
      id,
      name_en: canonical.name_en,
      name_vi: isArtifact ? canonical.name_en : canonical.name_vi,
      desc_en: canonical.desc_en,
      desc_vi: canonical.desc_vi,
      icon: canonical.icon || `https://assets.tftacademy.com/items/${id}.webp`,
    };
  }

  // Fallback by cleaned name
  const cleaned = cleanItemName(id);
  const fallback = getItemVi(cleaned);
  if (fallback) {
    return {
      id,
      name_en: fallback.name_en,
      name_vi: isArtifact ? fallback.name_en : fallback.name_vi,
      desc_en: fallback.desc_en,
      desc_vi: fallback.desc_vi,
      icon: fallback.icon || `https://assets.tftacademy.com/items/${id}.webp`,
    };
  }

  return {
    id,
    name_en: cleaned,
    name_vi: cleaned,
    desc_en: "",
    desc_vi: "",
    icon: `https://assets.tftacademy.com/items/${id}.webp`,
  };
}

export function localizeAugment(id: string): LocalizedAugment {
  const fallbackAug = AUGMENT_FALLBACKS[id];
  if (fallbackAug) {
    return {
      id,
      name_en: fallbackAug.name_en || id,
      name_vi: fallbackAug.name_vi || id,
      desc_en: fallbackAug.desc_en || "",
      desc_vi: fallbackAug.desc_vi || "",
      icon: fallbackAug.icon || `https://assets.tftacademy.com/augments/${id}.webp`,
    };
  }

  const canonical = getAugmentVi(id);
  if (canonical) {
    return {
      id,
      name_en: canonical.name_en,
      name_vi: canonical.name_vi,
      desc_en: canonical.desc_en,
      desc_vi: canonical.desc_vi,
      icon: canonical.icon || `https://assets.tftacademy.com/augments/${id}.webp`,
    };
  }

  const cleanName = id.replace(/^DA_18_/, "").replace(/^DA_/, "");
  const byCleanName = getAugmentVi(cleanName);
  if (byCleanName) {
    return {
      id,
      name_en: byCleanName.name_en,
      name_vi: byCleanName.name_vi,
      desc_en: byCleanName.desc_en,
      desc_vi: byCleanName.desc_vi,
      icon: byCleanName.icon || `https://assets.tftacademy.com/augments/${id}.webp`,
    };
  }

  return {
    id,
    name_en: cleanName,
    name_vi: cleanName,
    desc_en: "",
    desc_vi: "",
    icon: `https://assets.tftacademy.com/augments/${id}.webp`,
  };
}

export function localizeChampion(apiName: string, cost = 1): LocalizedChampion {
  const fallback = CHAMPION_FALLBACKS[apiName];
  if (fallback) {
    const name_en = fallback.name_en || apiName;
    return {
      id: apiName,
      name_en,
      name_vi: name_en, // In-game client never translates champion names!
      cost: fallback.cost ?? cost,
      icon: fallback.icon || `https://assets.tftacademy.com/champions/champion_icons/${apiName}.webp`,
      traits: fallback.traits || [],
    };
  }

  const canonical = getChampionVi(apiName);
  if (canonical) {
    const name_en = canonical.name_en;
    return {
      id: apiName,
      name_en,
      name_vi: name_en, // In-game client never translates champion names!
      cost: canonical.cost || cost,
      icon: canonical.icon || `https://assets.tftacademy.com/champions/champion_icons/${apiName}.webp`,
      traits: canonical.traits || [],
    };
  }

  const cleanName = apiName.replace(/^DA_18_/, "").replace(/^DA_/, "").replace(/18$/, "");
  const byClean = getChampionVi(cleanName);
  if (byClean) {
    const name_en = byClean.name_en;
    return {
      id: apiName,
      name_en,
      name_vi: name_en, // In-game client never translates champion names!
      cost: byClean.cost || cost,
      icon: byClean.icon || `https://assets.tftacademy.com/champions/champion_icons/${apiName}.webp`,
      traits: byClean.traits || [],
    };
  }

  return {
    id: apiName,
    name_en: cleanName,
    name_vi: cleanName,
    cost,
    icon: `https://assets.tftacademy.com/champions/champion_icons/${apiName}.webp`,
    traits: [],
  };
}

export function parseTrend(sticker: number): Trend {
  if (sticker === 1) return "New";
  if (sticker === 2) return "Rising";
  if (sticker === 3) return "Falling";
  return null;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function parseHexCoordinates(boardIndex: number): { row: number; col: number } {
  return {
    row: Math.floor(boardIndex / 7),
    col: boardIndex % 7,
  };
}

export function parseComps(rawGuides: any[]): ParsedAcademyComp[] {
  return rawGuides.map((g) => {
    const tier = (g.tier || "B").toUpperCase() as "S" | "A" | "B" | "C" | "X";
    const sticker = typeof g.sticker === "number" ? g.sticker : 0;
    const trend = parseTrend(sticker);
    let situationalTier: "S" | "A" | "B" | "C" | null = null;
    if (sticker === 8) situationalTier = "S";
    else if (sticker === 9) situationalTier = "A";
    else if (sticker === 10) situationalTier = "B";
    else if (sticker === 11) situationalTier = "C";

    const coreBadges: CoreBadge[] = [];
    let mainAugment: LocalizedAugment | null = null;
    let mainItem: LocalizedItem | null = null;

    if (g.mainAugment && g.mainAugment.apiName) {
      mainAugment = localizeAugment(g.mainAugment.apiName);
      coreBadges.push({
        type: "augment",
        id: mainAugment.id,
        name_en: mainAugment.name_en,
        name_vi: mainAugment.name_vi,
        icon: mainAugment.icon,
      });
    }

    if (g.mainItem && g.mainItem.apiName) {
      mainItem = localizeItem(g.mainItem.apiName);
      coreBadges.push({
        type: "item",
        id: mainItem.id,
        name_en: mainItem.name_en,
        name_vi: mainItem.name_vi,
        icon: mainItem.icon,
      });
    }

    const title = g.title || "";
    const metaTitle = g.metaTitle || g.title || "";
    const compStyle = g.style || "";
    const difficulty = g.difficulty || "";
    const slug = g.compSlug && g.compSlug.trim() !== "" ? g.compSlug : slugify(title || g.id || "comp");

    const rawFinalComp = g.finalComp || [];
    const board: LocalizedUnit[] = rawFinalComp.map((u: any) => {
      const champ = localizeChampion(u.apiName, u.cost || 1);
      const boardIndex = typeof u.boardIndex === "number" ? u.boardIndex : 0;
      const items = (u.items || []).map((it: string) => localizeItem(it));
      return {
        id: u.apiName,
        name_en: champ.name_en,
        name_vi: champ.name_vi,
        cost: champ.cost,
        icon: champ.icon,
        boardIndex,
        hex: parseHexCoordinates(boardIndex),
        stars: u.stars || 1,
        items,
        trait: u.trait ?? null,
      };
    });

    // 1. Identify mainCarry
    let carryUnit = board.find((u) => u.id === g.mainChampion?.apiName && u.items.length > 0);
    if (!carryUnit) {
      carryUnit = board.find((u) => u.id === g.mainChampion?.apiName);
    }
    if (!carryUnit || carryUnit.items.length === 0) {
      // Find unit with most damage / carry items or highest cost carry
      const sortedByItems = [...board].sort((a, b) => b.items.length - a.items.length);
      if (sortedByItems[0] && sortedByItems[0].items.length > 0) {
        carryUnit = sortedByItems[0];
      } else {
        carryUnit = board[0];
      }
    }

    let carryItems = carryUnit?.items || [];
    if (carryItems.length < 3 && g.altBuilds) {
      const alt = g.altBuilds.find((a: any) => a.apiName === carryUnit?.id && a.items?.length > carryItems.length);
      if (alt && alt.items) {
        carryItems = alt.items.map((it: string) => localizeItem(it));
      }
    }

    const mainCarry = {
      id: carryUnit ? carryUnit.id : (g.mainChampion?.apiName || "Unknown"),
      name_en: carryUnit ? carryUnit.name_en : "Unknown",
      name_vi: carryUnit ? carryUnit.name_vi : "Chưa rõ",
      cost: carryUnit ? carryUnit.cost : (g.mainChampion?.cost || 4),
      icon: carryUnit ? carryUnit.icon : "",
      items: carryItems,
    };

    // 2. Identify mainTank
    let bestTank: LocalizedUnit | null = null;
    let bestTankScore = -999;
    for (const u of board) {
      if (u === carryUnit) continue;
      let score = 0;
      for (const it of u.items) {
        if (CORE_TANK_ITEMS.has(it.id)) score += 15;
        else if (BRUISER_ITEMS.has(it.id)) score += 5;
        else score += 1;
      }
      if (u.hex.row === 0) score += 6;
      else if (u.hex.row === 1) score += 4;
      else if (u.hex.row === 2) score += 1;
      score += (u.stars || 1) * 2;
      score += u.cost;
      if (score > bestTankScore) {
        bestTankScore = score;
        bestTank = u;
      }
    }

    if (!bestTank && board.length > 1) {
      bestTank = board.find((u) => u !== carryUnit) || board[0];
    }

    let tankItems = bestTank?.items || [];
    if (tankItems.length < 3 && g.altBuilds) {
      const alt = g.altBuilds.find((a: any) => a.apiName === bestTank?.id && a.items?.length > tankItems.length);
      if (alt && alt.items) {
        tankItems = alt.items.map((it: string) => localizeItem(it));
      }
    }

    const mainTank = {
      id: bestTank ? bestTank.id : "Unknown",
      name_en: bestTank ? bestTank.name_en : "Unknown",
      name_vi: bestTank ? bestTank.name_vi : "Chưa rõ",
      cost: bestTank ? bestTank.cost : 1,
      icon: bestTank ? bestTank.icon : "",
      items: tankItems,
    };

    // Leveling curve
    const earlyComp = (g.earlyComp || []).map((u: any) => {
      const champ = localizeChampion(u.apiName, u.cost || 1);
      return {
        id: u.apiName,
        name_en: champ.name_en,
        name_vi: champ.name_vi,
        cost: champ.cost,
        stars: u.stars || 1,
        items: (u.items || []).map((it: string) => localizeItem(it)),
      };
    });

    const midComp = (g.midComp || []).map((u: any) => {
      const champ = localizeChampion(u.apiName, u.cost || 1);
      return {
        id: u.apiName,
        name_en: champ.name_en,
        name_vi: champ.name_vi,
        cost: champ.cost,
        stars: u.stars || 1,
        items: (u.items || []).map((it: string) => localizeItem(it)),
      };
    });

    const stages = (g.tips || []).map((t: any) => ({
      stage: t.stage || "",
      tip: t.tip || "",
    }));

    const augments = (g.augments || []).map((aug: any) => {
      const localized = localizeAugment(aug.apiName);
      return {
        id: aug.apiName,
        name_en: localized.name_en,
        name_vi: localized.name_vi,
        icon: localized.icon,
        disabled: aug.disabled ?? false,
      };
    });

    const maxCap = (g.maxCap || []).map((m: any) => {
      const champ = localizeChampion(m.apiName, m.cost || 5);
      return {
        id: m.apiName,
        name_en: champ.name_en,
        name_vi: champ.name_vi,
        predecessors: m.predecessors || [],
      };
    });

    const NON_CHAMPION_UNITS = new Set([
      "DA_Elderwood18_StonebarkTree",
      "DA_Elderwood18_Lifeblossom",
      "DA_Elderwood18_Protector",
      "TFT_TrainingDummy",
      "TFT_Voidspawn",
      "TFT17_Relic",
      "TFT17_Summon"
    ]);
    const finalChampions = board.filter((u) => !NON_CHAMPION_UNITS.has(u.id));

    const carousel = (g.carousel || []).map((c: any) => localizeItem(c.apiName));

    const altBuildsList = (g.altBuilds || []).map((ab: any) => {
      const champ = localizeChampion(ab.apiName, 4);
      return {
        champ,
        items: (ab.items || []).map((itId: string) => localizeItem(itId))
      };
    });

    return {
      id: g.id || slug,
      slug,
      title,
      metaTitle,
      tier,
      trend,
      sticker,
      situationalTier,
      compStyle,
      difficulty,
      mainCarry,
      mainTank,
      coreBadges,
      mainItem,
      mainAugment,
      board,
      finalChampions,
      carousel,
      altBuildsList,
      levelingCurve: {
        earlyComp,
        midComp,
        finalComp: board,
        stages,
      },
      tips: stages,
      augments,
      augmentsTip: g.augmentsTip || "",
      maxCap,
    };
  });
}

export function parseItems(rawItemsTierlists: any[]): ItemsTierList {
  const result: ItemsTierList = {
    categories: {
      craftables: { S: [], A: [], B: [], C: [], D: [] },
      radiants: { S: [], A: [], B: [], C: [], D: [] },
      artifacts: { S: [], A: [], B: [], C: [], D: [] },
      emblems: { S: [], A: [], B: [], C: [], D: [] },
    },
    craftables: { S: [], A: [], B: [], C: [], D: [] },
    radiants: { S: [], A: [], B: [], C: [], D: [] },
    artifacts: { S: [], A: [], B: [], C: [], D: [] },
    emblems: { S: [], A: [], B: [], C: [], D: [] },
    updatedAt: new Date().toISOString(),
  };

  const categoryMap: Record<string, keyof ItemsTierList["categories"]> = {
    craftables: "craftables",
    radiants: "radiants",
    ornns: "artifacts",
    artifacts: "artifacts",
    emblems: "emblems",
  };

  for (const entry of rawItemsTierlists) {
    const cat = categoryMap[entry.type];
    if (!cat) continue;

    const tierObj = entry.tier || {};
    const tiers: Array<"S" | "A" | "B" | "C" | "D"> = ["S", "A", "B", "C", "D"];
    for (const t of tiers) {
      const itemsList = tierObj[t] || [];
      const localized = itemsList.map((id: string) => localizeItem(id));
      result.categories[cat][t] = localized;
      result[cat][t] = localized;
    }
  }

  return result;
}

export function parseAugments(rawAugmentsTierlists: any[]): AugmentsTierList {
  const result: AugmentsTierList = {
    silver: { S: [], A: [], B: [], C: [], D: [] },
    gold: { S: [], A: [], B: [], C: [], D: [] },
    prismatic: { S: [], A: [], B: [], C: [], D: [] },
    stages: {
      silver: {},
      gold: {},
      prismatic: {},
    },
    updatedAt: new Date().toISOString(),
  };

  const tierKeyMap: Record<number, "silver" | "gold" | "prismatic"> = {
    1: "silver",
    2: "gold",
    3: "prismatic",
  };

  const tiers: Array<"S" | "A" | "B" | "C" | "D"> = ["S", "A", "B", "C", "D"];

  for (const entry of rawAugmentsTierlists) {
    const tierName = tierKeyMap[entry.augmenttier];
    if (!tierName) continue;

    const stage = entry.stage || "All";
    const tierObj = entry.tier || {};

    const stageData: Record<"S" | "A" | "B" | "C" | "D", LocalizedAugment[]> = {
      S: [], A: [], B: [], C: [], D: []
    };

    for (const t of tiers) {
      const augsList = tierObj[t] || [];
      const localized = augsList.map((id: string) => localizeAugment(id));
      stageData[t] = localized;

      if (stage === "All") {
        result[tierName][t] = localized;
      }
    }

    result.stages[tierName][stage] = stageData;
  }

  return result;
}

export function parseNewSet(html: string, jsCode?: string): Set18Info {
  // Extract summary & description from HTML
  const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, "").trim() : "Enchanted Wilds";

  let wispsSummary = "At the heart of Enchanted Wilds are Wisps, magical denizens that appear in players' shops as temporary, single-use sources of power.";
  const wispP = html.match(/<p[^>]*class="[^"]*text-white\/80[^"]*"[^>]*>([\s\S]*?)<\/p>/i);
  if (wispP) {
    wispsSummary = wispP[1].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }

  let wisps: Set18Wisp[] = [];
  let champions: Set18Champion[] = [];
  let traits: Set18Trait[] = [];
  let augments: Set18Augment[] = [];

  if (jsCode) {
    // 1. Wisps
    const wispsMatch = jsCode.match(/JSON\.parse\(`(\[\{"name":"Circle of Elders"[\s\S]*?\}\])`\)/);
    if (wispsMatch) {
      const rawWisps = JSON.parse(wispsMatch[1]);
      wisps = rawWisps.map((w: any) => {
        const itemVi = getItemVi(w.name);
        const fallback = WISP_FALLBACKS[w.name];
        const name_vi = itemVi?.name_vi || fallback?.name_vi || w.name;
        const desc_vi = itemVi?.desc_vi || fallback?.desc_vi || w.description;
        return {
          name_en: w.name,
          name_vi,
          category: w.category || "General",
          cost: w.cost ?? 0,
          desc_en: w.description || "",
          desc_vi,
          rules: w.rules || "",
        };
      });
    }

    // 2. Champions
    const champsMatch = jsCode.match(/JSON\.parse\(`(\[\{"name":"Akali"[\s\S]*?\}\])`\)/);
    if (champsMatch) {
      const rawChamps = JSON.parse(champsMatch[1]);
      champions = rawChamps.map((c: any) => {
        const lookupKey = CHAMPION_FALLBACKS[c.name]?.id || c.name;
        const viChamp = getChampionVi(lookupKey) || CHAMPION_FALLBACKS[c.name];
        const name_vi = viChamp?.name_vi || c.name;
        const icon = viChamp?.icon || `https://assets.tftacademy.com/champions/champion_icons/DA_18_${c.name}.webp`;
        const enrichedTraits = (c.traits || []).map((tName: string) => {
          const tVi = getTraitVi(tName) || TRAIT_FALLBACKS[tName];
          return {
            id: tVi?.id || tName,
            name_en: tName,
            name_vi: tVi?.name_vi || tName,
          };
        });
        return {
          id: viChamp?.id || `DA_18_${c.name}`,
          name_en: c.name,
          name_vi,
          cost: c.cost || 1,
          traits: enrichedTraits,
          abilityName: c.abilityName || "",
          abilityMana: c.abilityMana || "",
          ability: c.ability || "",
          desc_vi: c.ability || "",
          icon,
        };
      });
    }

    // 3. Traits
    const traitsMatch = jsCode.match(/JSON\.parse\(`(\[\{"name":"Adaptor"[\s\S]*?\}\])`\)/);
    if (traitsMatch) {
      const rawTraits = JSON.parse(traitsMatch[1]);
      traits = rawTraits.map((t: any) => {
        const viTrait = getTraitVi(t.name) || TRAIT_FALLBACKS[t.name];
        return {
          id: viTrait?.id || t.name,
          name_en: t.name,
          name_vi: viTrait?.name_vi || t.name,
          type: t.type || "Origin",
          breakpoints: t.breakpoints || [],
          colors: t.colors || [],
          desc_en: t.description || "",
          desc_vi: viTrait?.desc_vi || t.description || "",
          effects: t.effects || [],
          icon: viTrait?.icon || `https://assets.tftacademy.com/traits/trait_icon_18_${t.name.toLowerCase()}.png`,
        };
      });
    }

    // 4. Augments
    const augsMatch = jsCode.match(/JSON\.parse\(`(\[\{"name":"Augmented Power"[\s\S]*?\}\])`\)/);
    if (augsMatch) {
      const rawAugs = JSON.parse(augsMatch[1]);
      const tierNameMap: Record<number, "Silver" | "Gold" | "Prismatic"> = {
        1: "Silver",
        2: "Gold",
        3: "Prismatic",
      };
      augments = rawAugs.map((a: any) => {
        const viAug = getAugmentVi(a.name) || AUGMENT_FALLBACKS[a.name];
        return {
          id: viAug?.id || a.name,
          name_en: a.name,
          name_vi: viAug?.name_vi || a.name,
          tier: a.tier || 1,
          tierName: tierNameMap[a.tier] || "Silver",
          desc_en: a.description || "",
          desc_vi: viAug?.desc_vi || a.description || "",
          icon: viAug?.icon || `https://assets.tftacademy.com/augments/${a.name}.webp`,
        };
      });
    }
  }

  return {
    set: 18,
    setName: "Enchanted Wilds",
    patch: "18.5c",
    mechanic: {
      title: "Wisps",
      summary: wispsSummary,
      description: "Inspired by the beloved Charms mechanic from Magic N' Mayhem, Wisps offer strategic choices through combat boosts, economic rewards, experience gains, and high-risk, high-reward deals.",
      rules: [
        "Players can purchase one Wisp per round.",
        "Wisps appear as temporary, single-use sources of power.",
        "Stronger Wisps appear as the game progresses.",
        "Offers combat boosts, economy, XP, and high-risk deals."
      ],
    },
    wisps,
    champions,
    traits,
    augments,
    updatedAt: new Date().toISOString(),
  };
}

export type SyncOptions = {
  dataDir?: string;
  fetchFn?: typeof fetch;
  logger?: (msg: string) => void;
};

export async function syncAcademyData(options: SyncOptions = {}): Promise<{
  comps: ParsedAcademyComp[];
  items: ItemsTierList;
  augments: AugmentsTierList;
  newSet: Set18Info;
}> {
  const fetchFn = options.fetchFn ?? fetch;
  const log = options.logger ?? console.log;
  const dataDir = options.dataDir ?? path.resolve(import.meta.dir, "../data");

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  log("[AcademySync] Fetching TFT Academy Comps...");
  const compsRes = await fetchFn("https://tftacademy.com/api/tierlist/comps");
  if (!compsRes.ok) throw new Error(`Failed to fetch comps: ${compsRes.statusText}`);
  const compsData = await compsRes.json();
  const comps = parseComps(compsData.guides || []);
  const compsPath = path.join(dataDir, "academy-comps.json");
  fs.writeFileSync(compsPath, JSON.stringify(comps, null, 2), "utf-8");
  log(`[AcademySync] Saved ${comps.length} comps to ${compsPath}`);

  log("[AcademySync] Fetching TFT Academy Items...");
  const itemsRes = await fetchFn("https://tftacademy.com/api/tierlist/items?set=18");
  if (!itemsRes.ok) throw new Error(`Failed to fetch items: ${itemsRes.statusText}`);
  const itemsData = await itemsRes.json();
  const items = parseItems(itemsData.items_tierlists || []);
  const itemsPath = path.join(dataDir, "academy-items.json");
  fs.writeFileSync(itemsPath, JSON.stringify(items, null, 2), "utf-8");
  log(`[AcademySync] Saved items tierlist to ${itemsPath}`);

  log("[AcademySync] Fetching TFT Academy Augments...");
  const augsRes = await fetchFn("https://tftacademy.com/api/tierlist/augments?set=18");
  if (!augsRes.ok) throw new Error(`Failed to fetch augments: ${augsRes.statusText}`);
  const augsData = await augsRes.json();
  const augments = parseAugments(augsData.augments_tierlists || []);
  const augmentsPath = path.join(dataDir, "academy-augments.json");
  fs.writeFileSync(augmentsPath, JSON.stringify(augments, null, 2), "utf-8");
  log(`[AcademySync] Saved augments tierlist to ${augmentsPath}`);

  log("[AcademySync] Fetching TFT Academy Set 18 Learn page...");
  const newSetRes = await fetchFn("https://tftacademy.com/learn/new-set");
  const newSetHtml = await newSetRes.text();

  // Try to find JS chunk containing the dataset
  let jsCode = "";
  const linkHeader = newSetRes.headers.get("link") || "";
  const nodeMatch = linkHeader.match(/_app\/immutable\/nodes\/([a-zA-Z0-9._-]+\.js)/);
  const candidates: string[] = [];
  if (nodeMatch) {
    candidates.push(`https://tftacademy.com/${nodeMatch[0]}`);
  }
  // Also add known node chunk as fallback
  candidates.push("https://tftacademy.com/_app/immutable/nodes/56.BpuuSMlk.js");

  for (const url of candidates) {
    try {
      const jsRes = await fetchFn(url);
      if (jsRes.ok) {
        const text = await jsRes.text();
        if (text.includes("Circle of Elders") || text.includes("Akali")) {
          jsCode = text;
          break;
        }
      }
    } catch {
      // try next candidate
    }
  }

  const newSet = parseNewSet(newSetHtml, jsCode);
  const newSetPath = path.join(dataDir, "academy-new-set.json");
  fs.writeFileSync(newSetPath, JSON.stringify(newSet, null, 2), "utf-8");
  log(`[AcademySync] Saved Set 18 info (${newSet.champions.length} champs, ${newSet.traits.length} traits, ${newSet.augments.length} augs, ${newSet.wisps.length} wisps) to ${newSetPath}`);

  return { comps, items, augments, newSet };
}

// Allow standalone script execution: bun src/lib/server/academy-sync.ts
if (import.meta.main) {
  try {
    await syncAcademyData();
    console.log("Academy data sync completed successfully!");
  } catch (error) {
    console.error("Academy data sync failed:", error);
    process.exit(1);
  }
}
