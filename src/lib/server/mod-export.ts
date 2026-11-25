// Export layer: turns academy-live.json into the vocabulary the TFT mod (tftmod dylib) understands.
// Pure functions — no JSON imports — so they stay testable under bun and usable in the browser.

type AnyObj = Record<string, any>;

/** Item priority tiers the flexible-allocation uses: Academy S then A, then B as last resort. */
const ITEM_TIER_ORDER = ['S', 'A', 'B'] as const;

/** Role keywords per comp unit slot (mainCarry -> ad/ap by champion traits; tank -> defensive). */
function itemKind(item: AnyObj): 'ad' | 'ap' | 'tank' | 'utility' {
  const id = String(item.id ?? '');
  // Known defensive items
  const tankIds = ['BrambleVest', 'DragonsClaw', 'WarmogsArmor', 'GargoyleStoneplate', 'SunfireCape', 'SpiritVisage', 'SteadfastHeart', 'ProtectorsVow', 'Crownguard', 'ThiefsGloves'];
  if (tankIds.some((s) => id.includes(s))) return 'tank';
  // Known AP items
  const apIds = ['RabadonsDeathcap', 'JeweledGauntlet', 'ArchangelsStaff', 'BlueBuff', 'Morellonomicon', 'VoidStaff', 'NashorsTooth', 'AdaptiveHelm', 'HextechGunblade', 'StatikkShiv'];
  if (apIds.some((s) => id.includes(s))) return 'ap';
  // Remaining finished items lean AD / crit / attack speed
  return 'ad';
}

/** Build an ordered substitute list per kind from the Academy items tierlist (S -> A -> B). */
function substitutesByKind(itemsTierlists: AnyObj): Record<string, string[]> {
  const craft = itemsTierlists?.categories?.craftables ?? {};
  const out: Record<string, string[]> = { ad: [], ap: [], tank: [], utility: [] };
  for (const tier of ITEM_TIER_ORDER) {
    for (const row of craft[tier] ?? []) {
      out[itemKind(row)].push(row.id);
    }
  }
  return out;
}

/** Ordered augment fallback: comp list first, then Academy tierlist by stage 4-2 -> 3-2 -> 2-1 -> All. */
function augmentFallback(augmentsTierlists: AnyObj): string[] {
  const stages = augmentsTierlists?.stages ?? {};
  const order = ['4-2', '3-2', '2-1', 'All'];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const stage of order) {
    for (const stageData of Object.values(stages) as AnyObj[]) {
      for (const tier of ['S', 'A', 'B'] as const) {
        for (const row of stageData?.[stage]?.[tier] ?? []) {
          if (!seen.has(row.id)) {
            seen.add(row.id);
            out.push(row.id);
          }
        }
      }
    }
  }
  return out;
}

/** Slim a unit into mod vocabulary: id, name_vi, cost, hex coords, stars, ordered item ids. */
function slimUnit(u: AnyObj | null | undefined): AnyObj | null {
  if (!u?.id) return null;
  return {
    id: u.id,
    name: u.name_vi || u.name_en || u.id,
    cost: u.cost ?? 0,
    hex: u.hex ?? (typeof u.boardIndex === 'number' ? hexFromBoardIndex(u.boardIndex) : null),
    stars: u.stars ?? 1,
    items: (u.items ?? []).map((i: AnyObj) => i.id).filter(Boolean),
  };
}

/** Convert TFT Academy boardIndex (0..27, row-major front-to-back) to {row, col}. */
export function hexFromBoardIndex(boardIndex: number): { row: number; col: number } {
  const row = Math.floor(boardIndex / 7);
  const col = boardIndex % 7;
  return { row, col };
}

export type ModComp = {
  slug: string;
  tier: string;
  title: string;
  style: string | null;
  difficulty: string | null;
  trend: string | null;
  board: AnyObj[];
  curve: {
    early: AnyObj[];
    mid: AnyObj[];
    final: AnyObj[];
  };
  augments: string[];
  augmentsTip: string;
  tips: { stage: string; tip: string }[];
  carousel: string[];
  levelUpUnits: AnyObj[];
};

/** Compose the full mod payload: comps + flexible item priorities + augment fallback. */
export function buildModPayload(live: AnyObj): {
  set: number;
  patch: string;
  updatedAt: string;
  comps: ModComp[];
  itemPriority: Record<string, string[]>;
  augmentFallback: string[];
} {
  const itemPriority = substitutesByKind(live.items);
  const augFallback = augmentFallback(live.augments);
  const comps: ModComp[] = (live.comps ?? []).map((c: AnyObj) => {
    const curve = c.levelingCurve ?? {};
    const board = (c.board ?? []).map(slimUnit).filter(Boolean);
    const early = (curve.earlyComp ?? []).map(slimUnit).filter(Boolean);
    const mid = (curve.midComp ?? []).map(slimUnit).filter(Boolean);
    const final = (curve.finalComp ?? []).map(slimUnit).filter(Boolean);
    return {
      slug: c.slug,
      tier: c.tier,
      title: c.title,
      style: c.compStyle ?? null,
      difficulty: c.difficulty ?? null,
      trend: c.trend ?? null,
      board,
      curve: { early, mid, final },
      augments: (c.augments ?? []).map((a: AnyObj) => a.id).filter(Boolean),
      augmentsTip: c.augmentsTip ?? '',
      tips: (c.tips ?? []).map((t: AnyObj) => ({ stage: t.stage, tip: t.tip })),
      carousel: (c.carousel ?? []).map((i: AnyObj) => i.id ?? i).filter(Boolean),
      levelUpUnits: (c.maxCap ?? []).map(slimUnit).filter(Boolean),
    };
  });
  return {
    set: live.set,
    patch: live.patch,
    updatedAt: live.updatedAt,
    comps,
    itemPriority,
    augmentFallback: augFallback,
  };
}
