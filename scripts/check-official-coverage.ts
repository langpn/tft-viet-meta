import fs from 'node:fs';

const official = JSON.parse(fs.readFileSync('src/lib/data/official-vi.json', 'utf-8'));
const db = JSON.parse(fs.readFileSync('src/lib/data/tooltip-db.json', 'utf-8'));
const augs = JSON.parse(fs.readFileSync('src/lib/data/academy-augments.json', 'utf-8'));
const items = JSON.parse(fs.readFileSync('src/lib/data/academy-items.json', 'utf-8'));

const has = (id: string, f: 'name_vi' | 'desc_vi') => !!official[id]?.[f];

// --- tierlist item names ---
let iTotal = 0, iMiss: string[] = [], iHit = 0;
for (const cat of ['craftables', 'radiants', 'artifacts', 'emblems'])
  for (const t of ['S', 'A', 'B', 'C', 'D'])
    for (const it of items.categories[cat]?.[t] || []) {
      iTotal++;
      if (has(it.id, 'name_vi')) iHit++; else iMiss.push(it.id);
    }
console.log(`ITEM names: ${iHit}/${iTotal} resolvable | missing ${iMiss.length}`);
if (iMiss.length) console.log('  ', iMiss);

// --- tierlist augment names ---
let aTotal = 0, aMiss: string[] = [], aHit = 0;
for (const tier of ['silver', 'gold', 'prismatic'])
  for (const t of ['S', 'A', 'B', 'C', 'D'])
    for (const a of augs[tier]?.[t] || []) {
      aTotal++;
      if (has(a.id, 'name_vi')) aHit++; else aMiss.push(a.id);
    }
console.log(`\nAUGMENT names: ${aHit}/${aTotal} resolvable | missing ${aMiss.length}`);
if (aMiss.length) console.log('  ', aMiss);

// --- tooltip-db item descs ---
const uniqItems = new Map<string, any>();
for (const it of Object.values(db.items) as any[]) uniqItems.set(it.id, it);
let dTotal = 0, dMiss: string[] = [], dHit = 0;
for (const it of uniqItems.values()) {
  if (!it.desc_en) continue;
  dTotal++;
  if (has(it.id, 'desc_vi')) dHit++; else dMiss.push(it.id);
}
console.log(`\nITEM descs: ${dHit}/${dTotal} resolvable | missing ${dMiss.length}`);
if (dMiss.length) console.log('  ', dMiss.slice(0, 30));

// --- tooltip-db augment descs ---
const uniqAugs = new Map<string, any>();
for (const a of Object.values(db.augments) as any[]) uniqAugs.set(a.id, a);
let adTotal = 0, adMiss: string[] = [], adHit = 0;
for (const a of uniqAugs.values()) {
  if (!a.desc_en) continue;
  adTotal++;
  if (has(a.id, 'desc_vi')) adHit++; else adMiss.push(a.id);
}
console.log(`\nAUGMENT descs: ${adHit}/${adTotal} resolvable | missing ${adMiss.length}`);
if (adMiss.length) console.log('  ', adMiss.slice(0, 30));

// --- champion abilities ---
const uniqChamps = new Map<string, any>();
for (const c of Object.values(db.champions) as any[]) uniqChamps.set(c.id, c);
let cTotal = 0, cMiss: string[] = [], cHit = 0;
for (const c of uniqChamps.values()) {
  if (!c.ability) continue;
  cTotal++;
  if (has(c.id, 'ability_vi') || has(c.id, 'desc_vi')) cHit++; else cMiss.push(c.id);
}
console.log(`\nCHAMP abilities: ${cHit}/${cTotal} resolvable | missing ${cMiss.length}`);
if (cMiss.length) console.log('  ', cMiss.slice(0, 25));
