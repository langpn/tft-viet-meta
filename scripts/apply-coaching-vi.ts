/**
 * Applies the hand-written Vietnamese coaching translations to comps.
 * Source: /tmp/tips-vi-1.json, /tmp/tips-vi-2.json, /tmp/augtips-vi-1.json, /tmp/augtips-vi-2.json
 * Those files are keyed by the index of the unique English string, built from
 * the same dedupe order as the extraction step.
 *
 * Fails loudly if any English string has no translation: a missing string must
 * never silently fall back to English on a Vietnamese site.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dir, '..');
const compsPath = path.join(root, 'src/lib/data/academy-comps.json');

const read = (p: string) => JSON.parse(fs.readFileSync(p, 'utf-8'));
const tipsVi = { ...read('/tmp/tips-vi-1.json'), ...read('/tmp/tips-vi-2.json') };
const augVi = { ...read('/tmp/augtips-vi-1.json'), ...read('/tmp/augtips-vi-2.json') };

// Rebuild the exact dedupe order used when extracting the English strings.
const comps = read(compsPath);
const tipOrder: string[] = [];
const augOrder: string[] = [];
const seenTip = new Set<string>();
const seenAug = new Set<string>();

for (const c of comps) {
  for (const t of c.tips || []) {
    const v = (t.tip || '').trim();
    if (v && !seenTip.has(v)) { seenTip.add(v); tipOrder.push(v); }
  }
  const a = (c.augmentsTip || '').trim();
  if (a && !seenAug.has(a)) { seenAug.add(a); augOrder.push(a); }
}

console.log(`English strings: ${tipOrder.length} tips, ${augOrder.length} augmentsTip`);
console.log(`Translations    : ${Object.keys(tipsVi).length} tips, ${Object.keys(augVi).length} augmentsTip`);

// Build EN -> VI maps, refusing gaps.
const tipMap = new Map<string, string>();
const missingTips: string[] = [];
tipOrder.forEach((en, i) => {
  const vi = tipsVi[String(i)];
  if (vi) tipMap.set(en, vi);
  else missingTips.push(`[${i}] ${en.slice(0, 70)}`);
});
const augMap = new Map<string, string>();
const missingAug: string[] = [];
augOrder.forEach((en, i) => {
  const vi = augVi[String(i)];
  if (vi) augMap.set(en, vi);
  else missingAug.push(`[${i}] ${en.slice(0, 70)}`);
});

if (missingTips.length || missingAug.length) {
  console.error('\nMISSING TRANSLATIONS - aborting:');
  missingTips.forEach(m => console.error('  tip ' + m));
  missingAug.forEach(m => console.error('  aug ' + m));
  process.exit(1);
}

// Apply. Keep the English original under tip_en / augmentsTip_en so the UI can
// offer a language toggle without another data source.
let appliedTips = 0;
let appliedAug = 0;
for (const c of comps) {
  for (const t of c.tips || []) {
    const en = (t.tip || '').trim();
    if (!en) continue;
    const vi = tipMap.get(en)!;
    if (t.tip !== vi) { t.tip_en = t.tip; t.tip = vi; appliedTips++; }
  }
  const a = (c.augmentsTip || '').trim();
  if (a) {
    const vi = augMap.get(a)!;
    if (c.augmentsTip !== vi) { c.augmentsTip_en = c.augmentsTip; c.augmentsTip = vi; appliedAug++; }
  }
}

fs.writeFileSync(compsPath, JSON.stringify(comps, null, 2), 'utf-8');
console.log(`\nApplied: ${appliedTips} tips, ${appliedAug} augmentsTip rewritten to Vietnamese.`);
