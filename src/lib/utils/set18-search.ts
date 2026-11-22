import newSetData from '../data/academy-new-set.json';
import itemsData from '../data/academy-items.json';

export interface Set18SearchEntity {
  entityType: 'unit' | 'item' | 'trait' | 'augment';
  id: string;
  name_vi: string;
  name_en: string;
  icon?: string;
  cost?: number;
  score?: number;
}

function normalize(s?: string): string {
  if (!s) return '';
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const candidates: { item: Set18SearchEntity; nVi: string; nEn: string; words: string[] }[] = [];
const seenKeys = new Set<string>();

function indexEntity(item: Set18SearchEntity) {
  const nVi = normalize(item.name_vi);
  const nEn = normalize(item.name_en);
  return { item, nVi, nEn, words: [...nVi.split(' '), ...nEn.split(' ')] };
}

function addCandidate(c: Set18SearchEntity) {
  const key = `${c.entityType}::${c.id}`;
  if (!seenKeys.has(key)) {
    seenKeys.add(key);
    candidates.push(indexEntity(c));
  }
}

// 1. Champions (Set 18)
for (const champ of newSetData.champions || []) {
  if (!champ.id || !champ.name_en) continue;
  addCandidate({
    entityType: 'unit',
    id: champ.id,
    name_vi: champ.name_vi || champ.name_en,
    name_en: champ.name_en,
    cost: champ.cost,
    icon: champ.icon
  });
}

// 2. Items (Set 18 Craftables, Radiants, Artifacts, Emblems)
for (const [, tierMap] of Object.entries((itemsData as any).categories || {})) {
  for (const [, list] of Object.entries((tierMap as any) || {})) {
    for (const item of (list as any[]) || []) {
      if (!item.id || !item.name_en) continue;
      addCandidate({
        entityType: 'item',
        id: item.id,
        name_vi: item.name_vi || item.name_en,
        name_en: item.name_en,
        icon: item.icon
      });
    }
  }
}

// 3. Traits (Set 18)
for (const trait of newSetData.traits || []) {
  if (!trait.id || !trait.name_en) continue;
  addCandidate({
    entityType: 'trait',
    id: trait.id,
    name_vi: trait.name_vi || trait.name_en,
    name_en: trait.name_en,
    icon: trait.icon
  });
}

// 4. Augments (Set 18)
for (const aug of newSetData.augments || []) {
  if (!aug.id || !aug.name_en) continue;
  addCandidate({
    entityType: 'augment',
    id: aug.id,
    name_vi: aug.name_vi || aug.name_en,
    name_en: aug.name_en,
    icon: aug.icon
  });
}

/**
 * Searches exclusively within Set 18 entities with high-precision scoring.
 * Prevents false positives from internal ID strings or legacy sets.
 */
export function searchSet18Entities(query: string, limit: number = 12): Set18SearchEntity[] {
  return searchIndexedEntities(candidates, query, limit);
}

export function createEntitySearch(items: Set18SearchEntity[]) {
  const index = items.map(indexEntity);
  return (query: string, limit = 12) => searchIndexedEntities(index, query, limit);
}

function searchIndexedEntities(index: typeof candidates, query: string, limit: number): Set18SearchEntity[] {
  const q = normalize(query);
  if (!q) return [];

  const scored: Set18SearchEntity[] = [];

  for (const { item, nVi, nEn, words } of index) {
    let score = 0;

    // 1. Exact match on whole name (highest priority)
    if (nVi === q || nEn === q) {
      score = 100;
    }
    // 2. Starts with query (prefix match)
    else if (nVi.startsWith(q) || nEn.startsWith(q)) {
      score = 80;
    } else {
      // 3. Word boundary prefix match (e.g. "yi" starts word "Yi" in "Master Yi")
      if (words.some(w => w.startsWith(q))) {
        score = 65;
      }
      // 4. Word boundary substring match (only if query length >= 3 to avoid noise)
      else if (q.length >= 3 && (nVi.includes(q) || nEn.includes(q))) {
        score = 30;
      }
    }

    if (score > 0) {
      // Bonus: champions get priority on short queries, shorter names get slight boost
      if (item.entityType === 'unit') score += 5;
      score += Math.max(0, 10 - item.name_vi.length * 0.2);
      scored.push({ ...item, score });
    }
  }

  scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  return scored.slice(0, limit);
}
