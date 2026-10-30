import rawDictionary from "../data/canonical-dictionary.json" with {
  type: "json",
};
import { normalizeVietnamese } from "../../core/localization.js";

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

export type SearchEntityResult = {
  entityType: "item" | "trait" | "augment" | "unit";
  id: string;
  name_vi: string;
  name_en: string;
  desc_vi?: string;
  desc_en?: string;
  icon?: string;
  cost?: number;
  traits?: string[];
  score?: number;
};

export const dictionary = rawDictionary as CanonicalDictionary;

function lookup<T extends { name_vi: string }>(
  map: Record<string, T>,
  query: string | undefined | null,
): T | undefined {
  if (!query) return undefined;
  const trimmed = query.trim();
  if (!trimmed) return undefined;

  // 1. Exact key lookup
  if (map[trimmed]) return map[trimmed];

  // 2. Lowercase lookup
  const lower = trimmed.toLowerCase();
  if (map[lower]) return map[lower];

  // 3. Normalized Vietnamese lookup
  const normalized = normalizeVietnamese(trimmed);
  if (map[normalized]) return map[normalized];

  return undefined;
}

export function getItemVi(nameOrId: string): CanonicalItem | undefined {
  return lookup(dictionary.items, nameOrId);
}

export function getTraitVi(nameOrId: string): CanonicalTrait | undefined {
  return lookup(dictionary.traits, nameOrId);
}

export function getAugmentVi(nameOrId: string): CanonicalAugment | undefined {
  return lookup(dictionary.augments, nameOrId);
}

export function getChampionVi(nameOrId: string): CanonicalChampion | undefined {
  return lookup(dictionary.champions, nameOrId);
}

// Pre-collected unique entities for fast global search
const uniqueItems = Array.from(
  new Map(Object.values(dictionary.items).map((item) => [item.id, item])).values(),
);
const uniqueTraits = Array.from(
  new Map(Object.values(dictionary.traits).map((trait) => [trait.id, trait])).values(),
);
const uniqueAugments = Array.from(
  new Map(Object.values(dictionary.augments).map((aug) => [aug.id, aug])).values(),
);
const uniqueChampions = Array.from(
  new Map(Object.values(dictionary.champions).map((champ) => [champ.id, champ])).values(),
);

export function searchEntities(
  query: string,
  options?: {
    entityType?: "item" | "trait" | "augment" | "unit";
    limit?: number;
  },
): SearchEntityResult[] {
  const normalizedQuery = normalizeVietnamese(query);
  if (!normalizedQuery) return [];

  const candidates: SearchEntityResult[] = [];

  if (!options?.entityType || options.entityType === "item") {
    for (const item of uniqueItems) {
      candidates.push({
        entityType: "item",
        id: item.id,
        name_vi: item.name_vi,
        name_en: item.name_en,
        desc_vi: item.desc_vi,
        desc_en: item.desc_en,
        icon: item.icon,
      });
    }
  }

  if (!options?.entityType || options.entityType === "trait") {
    for (const trait of uniqueTraits) {
      candidates.push({
        entityType: "trait",
        id: trait.id,
        name_vi: trait.name_vi,
        name_en: trait.name_en,
        desc_vi: trait.desc_vi,
        desc_en: trait.desc_en,
        icon: trait.icon,
      });
    }
  }

  if (!options?.entityType || options.entityType === "augment") {
    for (const aug of uniqueAugments) {
      candidates.push({
        entityType: "augment",
        id: aug.id,
        name_vi: aug.name_vi,
        name_en: aug.name_en,
        desc_vi: aug.desc_vi,
        desc_en: aug.desc_en,
        icon: aug.icon,
      });
    }
  }

  if (!options?.entityType || options.entityType === "unit") {
    for (const champ of uniqueChampions) {
      candidates.push({
        entityType: "unit",
        id: champ.id,
        name_vi: champ.name_vi,
        name_en: champ.name_en,
        cost: champ.cost,
        traits: champ.traits,
        icon: champ.icon,
      });
    }
  }

  const results: SearchEntityResult[] = [];

  for (const candidate of candidates) {
    const terms = [
      candidate.id,
      candidate.name_vi,
      candidate.name_en,
    ].map(normalizeVietnamese);

    const exact = terms.some((term) => term === normalizedQuery);
    const prefix = terms.some((term) => term.startsWith(normalizedQuery));
    const substring = terms.some((term) => term.includes(normalizedQuery));

    let score = 0;
    if (exact) score = 30;
    else if (prefix) score = 20;
    else if (substring) score = 10;

    if (score > 0) {
      // Small bonus for shorter names (closer match)
      score += Math.max(0, 10 - candidate.name_vi.length / 5);
      results.push({ ...candidate, score });
    }
  }

  results.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  // Deduplicate by entityType + name_vi so same item from multiple sets doesn't clutter
  const seen = new Set<string>();
  const deduplicated: SearchEntityResult[] = [];
  for (const r of results) {
    const key = `${r.entityType}::${r.name_vi.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(r);
    }
  }

  if (options?.limit && options.limit > 0) {
    return deduplicated.slice(0, options.limit);
  }

  return deduplicated;
}
