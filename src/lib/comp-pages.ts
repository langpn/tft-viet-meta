// Pure helpers shared by the comp pages, the detail endpoint and the sitemap.
// No JSON imports here so they stay testable under bun and usable in the browser.

export const SITE_URL = 'https://tft.langpn.xyz';

type AnyObj = Record<string, any>;

const slugify = (s: unknown) =>
  String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/** URL slug used for ?comp= deep links (title based, like the old pages). */
export function compSlug(comp: AnyObj): string {
  return slugify(comp.title) || comp.slug || comp.id;
}

/** Resolve a ?comp= value by id, slug, title slug or meta-title slug. */
export function findComp<T extends AnyObj>(comps: T[], param: string | null | undefined): T | null {
  if (!param) return null;
  const p = param.toLowerCase().trim();
  return (
    comps.find(
      (c) =>
        c.id === param ||
        c.id?.toLowerCase() === p ||
        c.slug === param ||
        c.slug?.toLowerCase() === p ||
        slugify(c.title) === p ||
        slugify(c.metaTitle) === p
    ) || null
  );
}

const slimItem = (i: AnyObj) => ({ id: i.id, name_en: i.name_en, name_vi: i.name_vi, icon: i.icon });

function slimUnit(u: AnyObj | null | undefined) {
  if (!u) return u;
  const out: AnyObj = {
    id: u.id,
    name: u.name,
    name_en: u.name_en,
    name_vi: u.name_vi,
    nameVi: u.nameVi,
    cost: u.cost,
    icon: u.icon,
    starLevel: u.starLevel
  };
  if (u.items) out.items = u.items.map(slimItem);
  return out;
}

/** Only what the shelf cards, grouping and client-side search read. */
export function toCompCard(c: AnyObj) {
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    metaTitle: c.metaTitle,
    tier: c.tier,
    trend: c.trend,
    sticker: c.sticker,
    situationalTier: c.situationalTier,
    compStyle: c.compStyle,
    coreBadges: c.coreBadges,
    traits: c.traits,
    mainChampion: c.mainChampion && { apiName: c.mainChampion.apiName },
    mainCarry: slimUnit(c.mainCarry),
    mainTank: slimUnit(c.mainTank),
    board: (c.board || []).map(slimUnit),
    augments: (c.augments || []).map((a: AnyObj) => ({ id: a.id, name_en: a.name_en, name_vi: a.name_vi }))
  };
}

/** Landing page cards never search, so they drop the search-only lists. */
export function toLandingCard(c: AnyObj) {
  const { augments: _a, ...card } = toCompCard(c);
  return card;
}

/** Variant tabs in the detail panel: same carry and tier. */
export function getVariants(comps: AnyObj[], comp: AnyObj) {
  const pick = (c: AnyObj) => ({ id: c.id, title: c.title, tier: c.tier, mainCarry: { id: c.mainCarry?.id } });
  if (!comp.mainCarry?.id) return [pick(comp)];
  return comps
    .filter((c) => c.mainCarry?.id === comp.mainCarry.id && c.tier === comp.tier)
    .map(pick);
}

export function getCompDetail(comps: AnyObj[], param: string | null | undefined) {
  const comp = findComp(comps, param);
  return comp ? { comp, variants: getVariants(comps, comp) } : null;
}

const countTiers = (group: AnyObj | undefined) =>
  Object.values(group || {}).reduce<number>((n, list) => n + (Array.isArray(list) ? list.length : 0), 0);

/** Counts and patch shown in SEO text, derived from the data instead of hardcoded. */
export function buildSiteMeta(comps: AnyObj[], items: AnyObj, augments: AnyObj, newSet: AnyObj) {
  const sum = (obj: AnyObj, keys: string[]) => keys.reduce((n, k) => n + countTiers(obj?.[k]), 0);
  return {
    patch: String(newSet?.patch || ''),
    set: Number(newSet?.set) || 0,
    compCount: comps.length,
    itemCount: sum(items, ['craftables', 'radiants', 'artifacts', 'emblems']),
    augmentCount: sum(augments, ['silver', 'gold', 'prismatic'])
  };
}

/** JSON for an inline ld+json script: "<" escaped so no value can close the tag. */
export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Absolute deep link for a comp; slug is URL-encoded, XML escaping is done by the sitemap. */
export function compUrl(comp: AnyObj): string {
  return `${SITE_URL}/tierlist/comps?comp=${encodeURIComponent(compSlug(comp))}`;
}

const KEYWORD_CLASSES: Array<[RegExp, string]> = [
  [/^(attack speed|tốc độ đánh)$/i, 'text-[#FFD790] font-bold'],
  [/^(attack damage|sức mạnh công kích)$/i, 'text-orange-400 font-bold'],
  [/^(ability power|sức mạnh phép thuật)$/i, 'text-sky-400 font-bold'],
  [/^(health|máu)$/i, 'text-emerald-400 font-bold'],
  [/^(armor|giáp)$/i, 'text-amber-300 font-bold'],
  [/^(magic resist|kháng phép)$/i, 'text-sky-400 font-bold'],
  [/^(stuns?|làm choáng)$/i, 'text-amber-300 font-bold'],
  [/^(slow|làm chậm)$/i, 'text-sky-300 font-bold'],
  [/^(burn|thiêu đốt)$/i, 'text-orange-400 font-bold'],
  [/^(wound|vết thương sâu)$/i, 'text-rose-400 font-bold']
];

const KEYWORDS_RE =
  /\b(Attack Speed|Tốc Độ Đánh|Attack Damage|Sức Mạnh Công Kích|Ability Power|Sức Mạnh Phép Thuật|Health|Máu|Armor|Giáp|Magic Resist|Kháng Phép|Stuns?|Làm Choáng|Slow|Làm Chậm|Burn|Thiêu Đốt|Wound|Vết Thương Sâu)\b/gi;

export type DescSegment = { text: string; cls?: string };

/** Same cleanup and highlighting as before, but as text segments rendered by Svelte (no raw HTML). */
export function describeSegments(txt: string | undefined | null): DescSegment[] {
  if (!txt) return [];
  const clean = txt
    .replace(/\{\{[^}]+\}\}/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+,/g, ',')
    .replace(/\s+\./g, '.')
    .replace(/\s+/g, ' ')
    .trim();
  const out: DescSegment[] = [];
  let last = 0;
  for (const m of clean.matchAll(KEYWORDS_RE)) {
    if (m.index! > last) out.push({ text: clean.slice(last, m.index) });
    out.push({ text: m[0], cls: KEYWORD_CLASSES.find(([re]) => re.test(m[0]))?.[1] });
    last = m.index! + m[0].length;
  }
  if (last < clean.length) out.push({ text: clean.slice(last) });
  return out;
}
