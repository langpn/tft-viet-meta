/**
 * Applies the official Vietnamese overlay to every dataset that ships to users.
 * Source of truth: src/lib/data/official-vi.json (built by build-official-vi.ts).
 * Rules:
 *   - Only official strings are written. No machine translation here.
 *   - A field already holding a hand-written Vietnamese string is kept as-is
 *     when the official source has nothing for that id.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dir, '..');
const official = JSON.parse(fs.readFileSync(path.join(root, 'src/lib/data/official-vi.json'), 'utf-8')) as Record<
  string,
  { name_vi?: string; desc_vi?: string; ability_vi?: string }
>;

const stats = { name: 0, desc: 0, ability: 0, skipped: 0 };

function applyName(rec: any): void {
  const src = official[rec.id];
  if (src?.name_vi && rec.name_vi !== src.name_vi) {
    rec.name_vi = src.name_vi;
    stats.name++;
  } else stats.skipped++;
}

function applyDesc(rec: any): void {
  const src = official[rec.id];
  if (src?.desc_vi && rec.desc_vi !== src.desc_vi) {
    rec.desc_vi = src.desc_vi;
    stats.desc++;
  }
}

// ---------- 1. Items tierlist ----------
const itemsPath = path.join(root, 'src/lib/data/academy-items.json');
const items = JSON.parse(fs.readFileSync(itemsPath, 'utf-8'));
for (const cat of ['craftables', 'radiants', 'artifacts', 'emblems'])
  for (const t of ['S', 'A', 'B', 'C', 'D'])
    for (const it of items.categories[cat]?.[t] || []) {
      applyName(it);
      applyDesc(it);
    }
fs.writeFileSync(itemsPath, JSON.stringify(items, null, 2), 'utf-8');

// ---------- 2. Augments tierlist ----------
const augsPath = path.join(root, 'src/lib/data/academy-augments.json');
const augs = JSON.parse(fs.readFileSync(augsPath, 'utf-8'));
for (const tier of ['silver', 'gold', 'prismatic'])
  for (const t of ['S', 'A', 'B', 'C', 'D'])
    for (const a of augs[tier]?.[t] || []) {
      applyName(a);
      applyDesc(a);
    }
fs.writeFileSync(augsPath, JSON.stringify(augs, null, 2), 'utf-8');

// ---------- 3. Tooltip DB (champions, items, augments, traits) ----------
const dbPath = path.join(root, 'src/lib/data/tooltip-db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

for (const rec of Object.values(db.champions) as any[]) {
  const src = official[rec.id];
  if (src?.name_vi && rec.name_vi !== src.name_vi) { rec.name_vi = src.name_vi; stats.name++; }
  if (src?.ability_vi && rec.ability_vi !== src.ability_vi) { rec.ability_vi = src.ability_vi; stats.ability++; }
  if (src?.desc_vi && rec.ability_vi !== src.desc_vi) {
    // ability text: prefer the ability description when Riot has no ability name
    if (!src.ability_vi) { rec.ability_vi = src.desc_vi; stats.ability++; }
  }
}
for (const rec of Object.values(db.items) as any[]) {
  applyName(rec);
  applyDesc(rec);
}
for (const rec of Object.values(db.augments) as any[]) {
  applyName(rec);
  applyDesc(rec);
}
for (const rec of Object.values(db.traits) as any[]) {
  applyName(rec);
  applyDesc(rec);
}
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');

// ---------- 4. Comps: champions, traits, items, augments inside each guide ----------
const compsPath = path.join(root, 'src/lib/data/academy-comps.json');
const comps = JSON.parse(fs.readFileSync(compsPath, 'utf-8'));

function applyUnit(u: any) {
  const src = official[u.id];
  if (src?.name_vi) { u.name_vi = src.name_vi; stats.name++; }
}
function applyItem(it: any) {
  const src = official[it.id];
  if (src?.name_vi) it.name_vi = src.name_vi;
  if (src?.desc_vi) it.desc_vi = src.desc_vi;
}

for (const c of comps) {
  applyUnit(c.mainCarry);
  applyUnit(c.mainTank);
  applyItem(c.mainCarry);
  applyItem(c.mainTank);
  for (const u of c.board || []) { applyUnit(u); (u.items || []).forEach(applyItem); }
  for (const u of c.finalChampions || []) applyUnit(u);
  for (const it of c.carousel || []) applyItem(it);
  for (const b of c.coreBadges || []) {
    const src = official[b.id];
    if (src?.name_vi) b.name_vi = src.name_vi;
  }
  if (c.mainItem) applyItem(c.mainItem);
  if (c.mainAugment) { const s = official[c.mainAugment.id]; if (s?.name_vi) c.mainAugment.name_vi = s.name_vi; }
  for (const a of c.augments || []) { const s = official[a.id]; if (s?.name_vi) a.name_vi = s.name_vi; }
  for (const ab of c.altBuildsList || []) { applyUnit(ab.champ); (ab.items || []).forEach(applyItem); }
  const lc = c.levelingCurve || {};
  for (const part of ['earlyComp', 'midComp', 'finalComp'])
    for (const u of lc[part] || []) { applyUnit(u); (u.items || []).forEach(applyItem); }
  for (const m of c.maxCap || []) { const s = official[m.id]; if (s?.name_vi) m.name_vi = s.name_vi; }
}
fs.writeFileSync(compsPath, JSON.stringify(comps, null, 2), 'utf-8');

// ---------- 5. Set 18 info page ----------
const nsPath = path.join(root, 'src/lib/data/academy-new-set.json');
const ns = JSON.parse(fs.readFileSync(nsPath, 'utf-8'));
for (const c of ns.champions || []) {
  const src = official[c.id];
  if (src?.name_vi) { c.name_vi = src.name_vi; stats.name++; }
  if (src?.ability_vi) { c.abilityName = src.ability_vi; stats.ability++; }
  if (src?.desc_vi) { c.desc_vi = src.desc_vi; stats.desc++; }
}
for (const t of ns.traits || []) {
  const src = official[t.id];
  if (src?.name_vi) { t.name_vi = src.name_vi; stats.name++; }
  if (src?.desc_vi) { t.desc_vi = src.desc_vi; stats.desc++; }
}
for (const a of ns.augments || []) {
  const src = official[a.id];
  if (src?.name_vi) { a.name_vi = src.name_vi; stats.name++; }
  if (src?.desc_vi) { a.desc_vi = src.desc_vi; stats.desc++; }
}
fs.writeFileSync(nsPath, JSON.stringify(ns, null, 2), 'utf-8');

console.log('Applied official Vietnamese overlay:');
console.log(`  names updated    : ${stats.name}`);
console.log(`  descs updated    : ${stats.desc}`);
console.log(`  abilities updated: ${stats.ability}`);
