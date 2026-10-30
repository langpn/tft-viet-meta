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
    .replace(/&nbsp;/g, ' ')
    .replace(/\r/g, ' ')
    .replace(/\n/g, ' ')
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

function cleanAbilityDesc(txt: string | undefined | null): string {
  if (!txt) return '';
  return txt
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/%i:[a-zA-Z0-9]+%/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\\r|\\n/g, '\n')
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/ +/g, ' ')
    .trim();
}

const cdragVi = JSON.parse(fs.readFileSync(path.join(RAW_DIR, 'cdragon_tft_vi_vn.json'), 'utf8'));
const cdragEn = JSON.parse(fs.readFileSync(path.join(RAW_DIR, 'cdragon_tft_en_us.json'), 'utf8'));
const comps = JSON.parse(fs.readFileSync(path.resolve(import.meta.dir, '../src/lib/data/academy-comps.json'), 'utf8'));

// Build trait name -> icon map
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

// 1. Build Item <-> Champion co-occurrence map from 73 comps
const champToItemsMap = new Map<string, Map<string, number>>();
const itemToChampsMap = new Map<string, Map<string, number>>();

for (const comp of comps) {
  for (const u of comp.board || []) {
    const cid = u.id;
    if (!champToItemsMap.has(cid)) champToItemsMap.set(cid, new Map());
    for (const it of u.items || []) {
      const iid = it.id;
      champToItemsMap.get(cid)!.set(iid, (champToItemsMap.get(cid)!.get(iid) || 0) + 1);

      if (!itemToChampsMap.has(iid)) itemToChampsMap.set(iid, new Map());
      itemToChampsMap.get(iid)!.set(cid, (itemToChampsMap.get(iid)!.get(cid) || 0) + 1);
    }
  }
}

// Global generic items fallback for champions without comp data
const fallbackAdItems = ['DA_InfinityEdge', 'DA_GuinsoosRageblade', 'DA_Bloodthirster', 'DA_LastWhisper', 'DA_EdgeOfNight', 'DA_TitansResolve'];
const fallbackApItems = ['DA_JeweledGauntlet', 'DA_RabadonsDeathcap', 'DA_SpearOfShojin', 'DA_ArchangelsStaff', 'DA_Morellonomicon', 'DA_NashorsTooth'];
const fallbackTankItems = ['DA_WarmogsArmor', 'DA_BrambleVest', 'DA_DragonsClaw', 'DA_GargoyleStoneplate', 'DA_Redemption', 'DA_SunfireCape'];

// 2. Build Champions DB
const championsDb: Record<string, any> = {};
const set18ChampsVi = cdragVi.sets?.['18']?.champions || [];
const set18ChampsEn = cdragEn.sets?.['18']?.champions || [];

for (const cVi of set18ChampsVi) {
  const apiName = cVi.apiName;
  const cEn = set18ChampsEn.find((x: any) => x.apiName === apiName) || {};

  const name_vi = cVi.name || apiName;
  const name_en = cEn.name || name_vi;
  const cost = cVi.cost || 1;

  // Determine Role (matching Image 3 & 5)
  const range = cVi.stats?.range || 1;
  const mana = cVi.stats?.mana || 0;
  const initialMana = cVi.stats?.initialMana || 0;
  const armor = cVi.stats?.armor || 30;
  const hp = cVi.stats?.hp || 600;
  const damage = cVi.stats?.damage || 50;

  let role_en = 'Magic Caster';
  let role_vi = 'Pháp Sư';

  const traitsStr = (cVi.traits || []).join(' ').toLowerCase();
  if (apiName.includes('_AD') || (damage >= 60 && cVi.stats?.attackSpeed >= 0.75)) {
    role_en = 'Attack Specialist';
    role_vi = 'Đấu Sĩ Tấn Công';
  } else if (apiName.includes('_AP') || (range >= 3 && mana >= 25)) {
    role_en = 'Magic Caster';
    role_vi = 'Pháp Sư';
  } else if (traitsStr.includes('vệ quân') || traitsStr.includes('hộ pháp') || (range === 1 && hp >= 850 && armor >= 50 && damage < 60)) {
    role_en = 'Tank';
    role_vi = 'Đỡ Đòn';
  } else if (range === 1 && damage >= 55) {
    role_en = 'Attack Specialist';
    role_vi = 'Đấu Sĩ Sát Thương';
  } else if (range >= 3 && damage >= 50) {
    role_en = 'Physical Carry';
    role_vi = 'Xạ Thủ Sát Lực';
  } else if (range === 1) {
    role_en = 'Frontline Bruiser';
    role_vi = 'Đấu Sĩ Tuyến Đầu';
  }

  // Ability
  const abilityName_vi = cVi.ability?.name || 'Kỹ năng';
  const abilityName_en = cEn.ability?.name || abilityName_vi;
  const abilityDesc_vi = cleanAbilityDesc(interpolateDescription(cVi.ability?.desc, cVi.ability?.variables || {}));
  const abilityDesc_en = cleanAbilityDesc(interpolateDescription(cEn.ability?.desc, cEn.ability?.variables || {}));

  // Recommended Items (top items held in comps)
  const itemCounts = champToItemsMap.get(apiName);
  let recItems: string[] = [];
  if (itemCounts && itemCounts.size > 0) {
    recItems = Array.from(itemCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);
  }
  if (recItems.length < 5) {
    const pool = role_en === 'Tank' || role_en === 'Frontline Bruiser' ? fallbackTankItems :
                 role_en === 'Attack Specialist' || role_en === 'Physical Carry' ? fallbackAdItems : fallbackApItems;
    for (const it of pool) {
      if (!recItems.includes(it)) recItems.push(it);
    }
  }

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

  const icon = cleanIcon(cVi.icon || `assets/characters/${apiName.toLowerCase()}/skins/base/images/${apiName.toLowerCase()}_splash_tile_0.png`);

  const champData = {
    id: apiName,
    name_vi,
    name_en,
    cost,
    role_en,
    role_vi,
    range,
    mana,
    initialMana,
    hp,
    armor,
    damage,
    traits: traitsList,
    ability: {
      name_vi: abilityName_vi,
      name_en: abilityName_en,
      mana: `${initialMana} / ${mana}`,
      desc_vi: abilityDesc_vi,
      desc_en: abilityDesc_en,
      icon: cleanIcon(cVi.ability?.icon)
    },
    recommendedItems: recItems.slice(0, 10),
    icon
  };

  championsDb[apiName] = champData;
  championsDb[apiName.toLowerCase()] = champData;
  const cleanId = apiName.replace(/^DA_18_/, '').replace(/^DA_/, '').replace(/18$/, '');
  championsDb[cleanId] = champData;
  championsDb[cleanId.toLowerCase()] = champData;
  championsDb[name_en.toLowerCase()] = champData;
  championsDb[name_vi.toLowerCase()] = champData;
}

// 3. Build Canonical Items Lookup Table
const canonicalItemsByNameVi = new Map<string, any>();
const canonicalItemsByNameEn = new Map<string, any>();
const allItemsVi = cdragVi.items || [];
const allItemsEn = cdragEn.items || [];

for (const itVi of allItemsVi) {
  if (itVi.isAugment) continue;
  if (itVi.name && itVi.desc && itVi.desc.trim() !== '') {
    canonicalItemsByNameVi.set(itVi.name.toLowerCase().trim(), itVi);
  }
}
for (const itEn of allItemsEn) {
  if (itEn.isAugment) continue;
  if (itEn.name && itEn.desc && itEn.desc.trim() !== '') {
    canonicalItemsByNameEn.set(itEn.name.toLowerCase().trim(), itEn);
  }
}

const itemsDb: Record<string, any> = {};

for (const itVi of allItemsVi) {
  if (itVi.isAugment) continue;
  const apiName = itVi.apiName;
  if (!apiName) continue;
  const itEn = allItemsEn.find((x: any) => x.apiName === apiName) || {};

  const name_vi = itVi.name || apiName;
  const name_en = itEn.name || name_vi;

  // Merge canonical fallback if this is a wrapper item (like DA_)
  let resolvedVi = itVi;
  let resolvedEn = itEn;
  if (!itVi.desc || itVi.desc.trim() === '') {
    const matched = canonicalItemsByNameVi.get(name_vi.toLowerCase()) || canonicalItemsByNameEn.get(name_en.toLowerCase());
    if (matched && matched.desc) {
      resolvedVi = matched;
      const matchedEn = canonicalItemsByNameEn.get(name_en.toLowerCase()) || allItemsEn.find((x: any) => x.apiName === matched.apiName);
      if (matchedEn && matchedEn.desc) {
        resolvedEn = matchedEn;
      }
    }
  }

  const effects = resolvedVi.effects || itVi.effects || {};
  const stats: Record<string, string> = {};
  if (effects.AD) stats.ad = `+${Math.round(effects.AD * 100)}%`;
  if (effects.AP) stats.ap = `+${Math.round(effects.AP)}`;
  if (effects.Armor) stats.armor = `+${Math.round(effects.Armor)}`;
  if (effects.AS) stats.as = `+${Math.round(effects.AS)}%`;
  if (effects.Health) stats.hp = `+${Math.round(effects.Health)}`;
  if (effects.MagicResist) stats.mr = `+${Math.round(effects.MagicResist)}`;
  if (effects.CritChance) stats.crit = `+${Math.round(effects.CritChance * 100)}%`;
  if (effects.Mana) stats.mana = `+${Math.round(effects.Mana)}`;

  const desc_vi = cleanText(interpolateDescription(resolvedVi.desc, effects));
  const desc_en = cleanText(interpolateDescription(resolvedEn.desc || resolvedVi.desc, resolvedEn.effects || effects));

  // Recipe composition
  const rawComp = resolvedVi.composition || itVi.composition || [];
  const recipe = rawComp.map((compApi: string) => {
    const compVi = allItemsVi.find((x: any) => x.apiName === compApi);
    return {
      id: compApi,
      name_vi: compVi?.name || compApi,
      icon: cleanIcon(compVi?.icon)
    };
  });

  // Recommended Holders
  const champCounts = itemToChampsMap.get(apiName) || itemToChampsMap.get(`DA_${apiName.replace('TFT_Item_', '')}`);
  let recHolders: any[] = [];
  if (champCounts && champCounts.size > 0) {
    recHolders = Array.from(champCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([cid]) => {
        const c = championsDb[cid] || { id: cid, name_vi: cid, name_en: cid, cost: 3, icon: '' };
        return {
          id: c.id,
          name_vi: c.name_vi,
          name_en: c.name_en,
          cost: c.cost,
          icon: c.icon
        };
      });
  }

  const icon = cleanIcon(itVi.icon || resolvedVi.icon);

  const itemData = {
    id: apiName,
    name_vi,
    name_en,
    icon,
    stats,
    desc_vi,
    desc_en,
    recipe: recipe.length > 0 ? recipe : null,
    recommendedHolders: recHolders
  };

  itemsDb[apiName] = itemData;
  itemsDb[apiName.toLowerCase()] = itemData;
  const shortId = apiName.replace('TFT_Item_', '').replace('TFT18_Item_', '').replace('TFT18_', '');
  itemsDb[shortId] = itemData;
  itemsDb[shortId.toLowerCase()] = itemData;
  itemsDb[`DA_${shortId}`] = itemData;
  itemsDb[`DA_${shortId}`.toLowerCase()] = itemData;
  itemsDb[name_en.toLowerCase()] = itemData;
  itemsDb[name_vi.toLowerCase()] = itemData;
}

// 4. Build Augments DB
const canonicalAugsByNameVi = new Map<string, any>();
const canonicalAugsByNameEn = new Map<string, any>();
for (const augVi of allItemsVi) {
  if (!augVi.isAugment) continue;
  if (augVi.name && augVi.desc && augVi.desc.trim() !== '') {
    canonicalAugsByNameVi.set(augVi.name.toLowerCase().trim(), augVi);
  }
}
for (const augEn of allItemsEn) {
  if (!augEn.isAugment) continue;
  if (augEn.name && augEn.desc && augEn.desc.trim() !== '') {
    canonicalAugsByNameEn.set(augEn.name.toLowerCase().trim(), augEn);
  }
}

const augmentsDb: Record<string, any> = {};

for (const augVi of allItemsVi) {
  if (!augVi.isAugment) continue;
  const apiName = augVi.apiName;
  if (!apiName) continue;
  const augEn = allItemsEn.find((x: any) => x.apiName === apiName) || {};

  const name_vi = augVi.name || apiName;
  const name_en = augEn.name || name_vi;

  let resolvedVi = augVi;
  let resolvedEn = augEn;
  if (!augVi.desc || augVi.desc.trim() === '') {
    const matched = canonicalAugsByNameVi.get(name_vi.toLowerCase()) || canonicalAugsByNameEn.get(name_en.toLowerCase());
    if (matched && matched.desc) {
      resolvedVi = matched;
      const matchedEn = canonicalAugsByNameEn.get(name_en.toLowerCase()) || allItemsEn.find((x: any) => x.apiName === matched.apiName);
      if (matchedEn && matchedEn.desc) {
        resolvedEn = matchedEn;
      }
    }
  }

  const effects = resolvedVi.effects || augVi.effects || {};
  const desc_vi = cleanText(interpolateDescription(resolvedVi.desc, effects));
  const desc_en = cleanText(interpolateDescription(resolvedEn.desc || resolvedVi.desc, resolvedEn.effects || effects));

  // Extract rules / tournament subtitle
  let subtitle_vi = '';
  let subtitle_en = '';
  const ruleMatchVi = (resolvedVi.desc || '').match(/<tftitemrules>(.*?)<\/tftitemrules>/i);
  if (ruleMatchVi) subtitle_vi = cleanText(ruleMatchVi[1]);
  const ruleMatchEn = (resolvedEn.desc || '').match(/<tftitemrules>(.*?)<\/tftitemrules>/i);
  if (ruleMatchEn) subtitle_en = cleanText(ruleMatchEn[1]);

  const icon = cleanIcon(augVi.icon || resolvedVi.icon);

  const augData = {
    id: apiName,
    name_vi,
    name_en,
    icon,
    desc_vi,
    desc_en,
    subtitle_vi,
    subtitle_en
  };

  augmentsDb[apiName] = augData;
  augmentsDb[apiName.toLowerCase()] = augData;
  const shortId = apiName.replace('TFT_Augment_', '').replace('TFT18_Augment_', '').replace('TFT18_', '');
  augmentsDb[shortId] = augData;
  augmentsDb[shortId.toLowerCase()] = augData;
  augmentsDb[`DA_${shortId}`] = augData;
  augmentsDb[`DA_${shortId}`.toLowerCase()] = augData;
  augmentsDb[name_en.toLowerCase()] = augData;
  augmentsDb[name_vi.toLowerCase()] = augData;
}

// 5. Build Traits DB
const traitsDb: Record<string, any> = {};
const allTraitsVi = cdragVi.setData?.['18']?.traits || [];
const allTraitsEn = cdragEn.setData?.['18']?.traits || [];

for (const tVi of allTraitsVi) {
  const apiName = tVi.apiName;
  const tEn = allTraitsEn.find((x: any) => x.apiName === apiName) || {};

  const name_vi = tVi.name || apiName;
  const name_en = tEn.name || name_vi;

  const desc_vi = cleanText(interpolateDescription(tVi.desc, tVi.effects || {}));
  const desc_en = cleanText(interpolateDescription(tEn.desc, tEn.effects || {}));

  const icon = cleanIcon(tVi.icon);

  const traitData = {
    id: apiName,
    name_vi,
    name_en,
    icon,
    desc_vi,
    desc_en,
    effects: tVi.effects || []
  };

  traitsDb[apiName] = traitData;
  traitsDb[apiName.toLowerCase()] = traitData;
  traitsDb[name_en.toLowerCase()] = traitData;
  traitsDb[name_vi.toLowerCase()] = traitData;
}

// Save everything into unified DB
const fullDb = {
  champions: championsDb,
  items: itemsDb,
  augments: augmentsDb,
  traits: traitsDb
};

fs.writeFileSync(OUT_FILE, JSON.stringify(fullDb, null, 2), 'utf8');
console.log('Saved tooltip DB to:', OUT_FILE, `(${(fs.statSync(OUT_FILE).size / 1024 / 1024).toFixed(2)} MB)`);
