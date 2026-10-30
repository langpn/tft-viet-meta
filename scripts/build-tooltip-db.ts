import fs from 'node:fs';
import path from 'node:path';
import { interpolateDescription } from '../src/lib/utils/augment-cleaner.ts';

const RAW_DIR = path.resolve(import.meta.dir, '../data/raw');
const OUT_FILE = path.resolve(import.meta.dir, '../src/lib/data/tooltip-db.json');

function cleanText(txt: string | undefined | null): string {
  if (!txt) return '';
  return txt
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/%i:[a-zA-Z0-9]+%/g, '')
    .replace(/\{\{[^}]+\}\}/g, '') // Strip Riot raw keywords like {{TFT_Keyword_Chill}}
    .replace(/&nbsp;/g, ' ')
    .replace(/\r/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\s+,/g, ',')
    .replace(/\s+\./g, '.')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanIcon(icon: string | undefined | null): string {
  if (!icon || icon === 'None') return '';
  if (icon.endsWith('.tex')) {
    return icon.slice(0, -4) + '.png';
  }
  return icon;
}

const cdragVi = JSON.parse(fs.readFileSync(path.join(RAW_DIR, 'cdragon_tft_vi_vn.json'), 'utf8'));
const cdragEn = JSON.parse(fs.readFileSync(path.join(RAW_DIR, 'cdragon_tft_en_us.json'), 'utf8'));

console.log('Fetching live TFT Academy official assets for Set 18...');
const [itemsRes, champsRes, augsRes, traitsRes] = await Promise.all([
  fetch('https://tftacademy.com/api/assets/items?set=18'),
  fetch('https://tftacademy.com/api/assets/champions?set=18'),
  fetch('https://tftacademy.com/api/assets/augments?set=18'),
  fetch('https://tftacademy.com/api/assets/traits?set=18')
]);

const academyItems: any[] = (await itemsRes.json()).items || [];
const academyChamps: any[] = (await champsRes.json()).champions || [];
const academyAugs: any[] = (await augsRes.json()).augments || [];
const academyTraits: any[] = (await traitsRes.json()).traits || [];

console.log(`Fetched ${academyItems.length} items, ${academyChamps.length} champs, ${academyAugs.length} augs, ${academyTraits.length} traits from TFT Academy`);

// Build Trait Icons map from Riot CDragon
const traitIconMap = new Map<string, string>();
for (const [k, v] of Object.entries(cdragVi.setData || {})) {
  for (const t of (v as any).traits || []) {
    if (t.name && t.icon) {
      const clean = cleanIcon(t.icon);
      traitIconMap.set(t.name.toLowerCase().trim(), clean);
      if (t.apiName) traitIconMap.set(t.apiName.toLowerCase().trim(), clean);
    }
  }
}
for (const t of cdragVi.setData?.['18']?.traits || []) {
  if (t.name && t.icon) {
    const clean = cleanIcon(t.icon);
    traitIconMap.set(t.name.toLowerCase().trim(), clean);
    if (t.apiName) traitIconMap.set(t.apiName.toLowerCase().trim(), clean);
  }
}

// Map Academy champions by ID and by apiName
const academyChampById = new Map<string, any>();
const academyChampByApi = new Map<string, any>();
for (const c of academyChamps) {
  if (c.id) academyChampById.set(c.id, c);
  if (c.apiName) academyChampByApi.set(c.apiName, c);
}

// 1. Process Champions
const championsDb: Record<string, any> = {};
const set18ChampsVi = cdragVi.sets?.['18']?.champions || [];
const set18ChampsEn = cdragEn.sets?.['18']?.champions || [];

for (const cVi of set18ChampsVi) {
  const apiName = cVi.apiName;
  const cEn = set18ChampsEn.find((x: any) => x.apiName === apiName) || {};
  const acChamp = academyChampByApi.get(apiName);

  const name_vi = cVi.name || apiName;
  const name_en = cEn.name || acChamp?.name || name_vi;
  const cost = acChamp?.cost || cVi.cost || 1;

  // Determine Role (matching TFT Academy)
  let role_en = acChamp?.role || 'Magic Caster';
  let role_vi = 'Pháp Sư';
  if (role_en === 'Attack Specialist' || role_en === 'Attack Fighter') role_vi = 'Đấu Sĩ Tấn Công';
  else if (role_en === 'Tank') role_vi = 'Đỡ Đòn';
  else if (role_en === 'Magic Specialist' || role_en === 'Magic Caster') role_vi = 'Pháp Sư';
  else if (role_en === 'Attack Carry' || role_en === 'Physical Carry') role_vi = 'Xạ Thủ Sát Lực';
  else if (role_en.includes('Fighter')) role_vi = 'Đấu Sĩ';

  const range = cVi.stats?.range || acChamp?.stats?.range || 1;
  const mana = cVi.stats?.mana || acChamp?.stats?.mana || 0;
  const initialMana = cVi.stats?.initialMana || 0;

  // Ability
  const abilityName_vi = cVi.ability?.name || acChamp?.abilityName || 'Kỹ năng';
  const abilityName_en = cEn.ability?.name || acChamp?.abilityName || abilityName_vi;
  const abilityDesc_vi = cleanText(interpolateDescription(cVi.ability?.desc || acChamp?.ability, cVi.ability?.variables || {}));
  const abilityDesc_en = cleanText(interpolateDescription(cEn.ability?.desc || acChamp?.ability, cEn.ability?.variables || {}));

  // Recommended Items from TFT Academy official data
  const recItems = acChamp?.recommendedItems || [];

  // Traits with real CommunityDragon icons
  const traitsList = (cVi.traits || []).map((tVi: string, idx: number) => {
    const tEn = cEn.traits?.[idx] || tVi;
    const realIcon = traitIconMap.get(tVi.toLowerCase().trim()) || 
                     traitIconMap.get(tEn.toLowerCase().trim()) || 
                     `assets/ux/traiticons/trait_icon_18_${tEn.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`;
    return {
      name_vi: tVi,
      name_en: tEn,
      icon: realIcon
    };
  });

  const icon = acChamp?.championSquareIcon 
    ? `https://assets.tftacademy.com/champions/champion_square_icons/${acChamp.championSquareIcon}`
    : cleanIcon(cVi.icon);

  const champData = {
    id: apiName,
    academyId: acChamp?.id,
    name_vi,
    name_en,
    cost,
    role_en,
    role_vi,
    range,
    mana,
    initialMana,
    traits: traitsList,
    ability: {
      name_vi: abilityName_vi,
      name_en: abilityName_en,
      mana: `${initialMana} / ${mana}`,
      desc_vi: abilityDesc_vi,
      desc_en: abilityDesc_en,
      icon: acChamp?.abilityIcon ? `https://assets.tftacademy.com/champions/ability_icons/${acChamp.abilityIcon}` : cleanIcon(cVi.ability?.icon)
    },
    recommendedItems: recItems.slice(0, 10),
    icon
  };

  championsDb[apiName] = champData;
  championsDb[apiName.toLowerCase()] = champData;
  if (acChamp?.id) championsDb[acChamp.id] = champData;
  const cleanId = apiName.replace(/^DA_18_/, '').replace(/^DA_/, '').replace(/18$/, '');
  championsDb[cleanId] = champData;
  championsDb[cleanId.toLowerCase()] = champData;
  championsDb[name_en.toLowerCase()] = champData;
  championsDb[name_vi.toLowerCase()] = champData;
}

// 2. Process Items
const itemsDb: Record<string, any> = {};
const allCdragItemsVi = cdragVi.items || [];
const allCdragItemsEn = cdragEn.items || [];

for (const acItem of academyItems) {
  const apiName = acItem.apiName;
  const cVi = allCdragItemsVi.find((x: any) => 
    x.apiName === apiName || 
    x.apiName === `TFT_Item_${apiName.replace('DA_', '').replace('Artifact_', 'Artifact_')}` ||
    x.name?.toLowerCase() === acItem.name?.toLowerCase()
  ) || {};

  const name_en = acItem.name || cVi.name || apiName;
  const name_vi = cVi.name || name_en;

  // Stats formatting
  const stats: Record<string, string> = {};
  const acStats = acItem.stats || {};
  const cEffects = cVi.effects || {};

  if (acStats.as || cEffects.AS) stats.as = `+${acStats.as || Math.round(cEffects.AS)}%`;
  if (acStats.ad || cEffects.AD) stats.ad = `+${acStats.ad || Math.round(cEffects.AD * 100)}%`;
  if (acStats.ap || cEffects.AP) stats.ap = `+${acStats.ap || Math.round(cEffects.AP)}`;
  if (acStats.ar || cEffects.Armor) stats.armor = `+${acStats.ar || Math.round(cEffects.Armor)}`;
  if (acStats.mr || cEffects.MagicResist) stats.mr = `+${acStats.mr || Math.round(cEffects.MagicResist)}`;
  if (acStats.hp || cEffects.Health) stats.hp = `+${acStats.hp || Math.round(cEffects.Health)}`;
  if (acStats.crit || cEffects.CritChance) stats.crit = `+${acStats.crit || Math.round(cEffects.CritChance * 100)}%`;
  if (acStats.mana || cEffects.Mana) stats.mana = `+${acStats.mana || Math.round(cEffects.Mana)}`;
  if (acStats.ov || cEffects.StatOmnivamp || cEffects.Omnivamp || cEffects.LifeSteal) {
    const val = acStats.ov || Math.round((cEffects.StatOmnivamp || cEffects.Omnivamp || cEffects.LifeSteal) * 100);
    stats.ov = `+${val}%`;
  }

  // Descriptions: Strip {{TFT_Keyword_*}}
  let desc_vi = cleanText(interpolateDescription(cVi.desc, cEffects));
  if (!desc_vi || desc_vi.trim() === '') {
    desc_vi = cleanText(acItem.description);
  }
  let desc_en = cleanText(acItem.description || interpolateDescription(cVi.desc, cEffects));

  // Recipe Components
  const recipe = (acItem.composition || []).map((compApi: string) => {
    const compAc = academyItems.find(x => x.apiName === compApi);
    const compVi = allCdragItemsVi.find((x: any) => x.apiName === compApi);
    return {
      id: compApi,
      name_en: compAc?.name || compApi,
      name_vi: compVi?.name || compAc?.name || compApi,
      icon: compAc?.icon ? `https://assets.tftacademy.com/items/${compAc.icon}` : cleanIcon(compVi?.icon)
    };
  });

  // Recommended Holders (Exact Match to TFT Academy: 4 champions!)
  const recHolders = (acItem.recommendedChampions || []).map((cId: string) => {
    const champ = academyChampById.get(cId);
    if (!champ) return null;
    const cData = championsDb[champ.apiName] || championsDb[champ.name.toLowerCase()];
    return {
      id: champ.apiName,
      name_en: champ.name,
      name_vi: cData?.name_vi || champ.name,
      cost: champ.cost,
      icon: champ.championSquareIcon 
        ? `https://assets.tftacademy.com/champions/champion_square_icons/${champ.championSquareIcon}`
        : (cData?.icon || `https://assets.tftacademy.com/champions/champion_icons/${champ.apiName}.webp`)
    };
  }).filter(Boolean);

  const icon = acItem.icon 
    ? `https://assets.tftacademy.com/items/${acItem.icon}`
    : cleanIcon(cVi.icon);

  const itemData = {
    id: apiName,
    name_vi,
    name_en,
    type: acItem.type,
    icon,
    stats,
    desc_vi,
    desc_en,
    recipe: recipe.length === 2 ? recipe : null,
    recommendedHolders: recHolders
  };

  itemsDb[apiName] = itemData;
  itemsDb[apiName.toLowerCase()] = itemData;
  if (acItem.id) itemsDb[acItem.id] = itemData;
  const shortId = apiName.replace('TFT_Item_', '').replace('DA_Artifact_', '').replace('DA_', '');
  itemsDb[shortId] = itemData;
  itemsDb[shortId.toLowerCase()] = itemData;
  itemsDb[name_en.toLowerCase()] = itemData;
  itemsDb[name_vi.toLowerCase()] = itemData;
}

// 3. Process Augments
const augmentsDb: Record<string, any> = {};

for (const acAug of academyAugs) {
  const apiName = acAug.apiName;
  const cVi = allCdragItemsVi.find((x: any) => x.apiName === apiName || x.name?.toLowerCase() === acAug.name?.toLowerCase()) || {};

  const name_en = acAug.name || cVi.name || apiName;
  const name_vi = cVi.name || name_en;

  const desc_vi = cleanText(interpolateDescription(cVi.desc || acAug.description, cVi.effects || {}));
  const desc_en = cleanText(acAug.description || interpolateDescription(cVi.desc, cVi.effects || {}));

  // Rules / Tournament subtitle
  let subtitle_vi = '';
  let subtitle_en = '';
  const ruleMatchVi = (cVi.desc || '').match(/<tftitemrules>(.*?)<\/tftitemrules>/i);
  if (ruleMatchVi) subtitle_vi = cleanText(ruleMatchVi[1]);
  const ruleMatchEn = (cVi.desc || '').match(/<tftitemrules>(.*?)<\/tftitemrules>/i);
  if (ruleMatchEn) subtitle_en = cleanText(ruleMatchEn[1]);

  const icon = acAug.icon 
    ? `https://assets.tftacademy.com/augments/${acAug.icon}`
    : cleanIcon(cVi.icon);

  const augData = {
    id: apiName,
    name_vi,
    name_en,
    tier: acAug.tier,
    icon,
    desc_vi,
    desc_en,
    subtitle_vi,
    subtitle_en
  };

  augmentsDb[apiName] = augData;
  augmentsDb[apiName.toLowerCase()] = augData;
  if (acAug.id) augmentsDb[acAug.id] = augData;
  const shortId = apiName.replace('TFT_Augment_', '').replace('DA_', '');
  augmentsDb[shortId] = augData;
  augmentsDb[shortId.toLowerCase()] = augData;
  augmentsDb[name_en.toLowerCase()] = augData;
  augmentsDb[name_vi.toLowerCase()] = augData;
}

// 4. Process Traits
const traitsDb: Record<string, any> = {};

for (const acTrait of academyTraits) {
  const apiName = acTrait.apiName;
  const cVi = cdragVi.setData?.['18']?.traits?.find((x: any) => x.apiName === apiName || x.name?.toLowerCase() === acTrait.name?.toLowerCase()) || {};

  const name_en = acTrait.name || cVi.name || apiName;
  const name_vi = cVi.name || name_en;

  const desc_vi = cleanText(interpolateDescription(cVi.desc || acTrait.description, cVi.effects || {}));
  const desc_en = cleanText(acTrait.description || interpolateDescription(cVi.desc, cVi.effects || {}));

  const realIcon = traitIconMap.get(name_vi.toLowerCase().trim()) || 
                   traitIconMap.get(name_en.toLowerCase().trim()) || 
                   `assets/ux/traiticons/trait_icon_18_${name_en.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`;

  const traitData = {
    id: apiName,
    name_vi,
    name_en,
    icon: realIcon,
    desc_vi,
    desc_en,
    effects: cVi.effects || []
  };

  traitsDb[apiName] = traitData;
  traitsDb[apiName.toLowerCase()] = traitData;
  if (acTrait.id) traitsDb[acTrait.id] = traitData;
  traitsDb[name_en.toLowerCase()] = traitData;
  traitsDb[name_vi.toLowerCase()] = traitData;
}

const fullDb = {
  champions: championsDb,
  items: itemsDb,
  augments: augmentsDb,
  traits: traitsDb
};

fs.writeFileSync(OUT_FILE, JSON.stringify(fullDb, null, 2), 'utf8');
console.log('Successfully saved unified tooltip DB to:', OUT_FILE, `(${(fs.statSync(OUT_FILE).size / 1024 / 1024).toFixed(2)} MB)`);
