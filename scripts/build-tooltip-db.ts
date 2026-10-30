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
const set18TraitsVi = cdragVi.sets?.['18']?.traits || [];
const set18TraitsEn = cdragEn.sets?.['18']?.traits || [];

for (const t of set18TraitsVi) {
  if (t.name && t.icon) {
    const clean = cleanIcon(t.icon);
    traitIconMap.set(t.name.toLowerCase().trim(), clean);
    if (t.apiName) traitIconMap.set(t.apiName.toLowerCase().trim(), clean);
  }
}
for (const t of set18TraitsEn) {
  if (t.name && t.icon) {
    const clean = cleanIcon(t.icon);
    traitIconMap.set(t.name.toLowerCase().trim(), clean);
    if (t.apiName) traitIconMap.set(t.apiName.toLowerCase().trim(), clean);
  }
}
for (const acTrait of academyTraits) {
  const match = set18TraitsVi.find((x: any) => x.apiName === acTrait.apiName) ||
                set18TraitsEn.find((x: any) => x.apiName === acTrait.apiName);
  if (match?.icon) {
    const clean = cleanIcon(match.icon);
    traitIconMap.set(acTrait.name.toLowerCase().trim(), clean);
    if (acTrait.apiName) traitIconMap.set(acTrait.apiName.toLowerCase().trim(), clean);
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

  // In official TFT in-game client, champions ALWAYS display international names
  // (e.g. Master Yi, Gromp, Krug, Murkwolf, Brambleback, Sentry, Sentinel, Elder Dragon)
  let name_en = cEn.name || acChamp?.name || apiName;
  if (apiName === 'TFT_BlueGolem') {
    name_en = 'Blue Golem';
  }
  const name_vi = name_en;
  let cost = acChamp?.cost || cVi.cost || 1;

  // Accurate champion costs (Gromp=2, Blue Golem=1, Lux=5, Ivern=5, Maokai=5, Taric=5, Elder Dragon=5)
  const cleanId = apiName.replace(/^DA_18_/, '').replace(/^DA_/, '').replace(/18$/, '');
  const costLookup = name_en.toLowerCase().trim();
  if (costLookup === 'gromp' || cleanId.toLowerCase() === 'gromp') cost = 2;
  else if (costLookup === 'blue golem' || costLookup === 'golem' || apiName === 'TFT_BlueGolem') cost = 1;
  else if (costLookup === 'lux' || cleanId.toLowerCase().startsWith('lux')) cost = 5;
  else if (costLookup === 'ivern' || cleanId.toLowerCase() === 'ivern') cost = 5;
  else if (costLookup === 'maokai' || cleanId.toLowerCase() === 'maokai') cost = 5;
  else if (costLookup === 'taric' || cleanId.toLowerCase() === 'taric') cost = 5;
  else if (costLookup === 'elder dragon' || cleanId.toLowerCase().includes('elderdragon') || apiName.includes('ElderDragon')) cost = 5;

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
  championsDb[cleanId] = champData;
  championsDb[cleanId.toLowerCase()] = champData;
  championsDb[name_en.toLowerCase()] = champData;
  championsDb[name_vi.toLowerCase()] = champData;

  if (apiName === 'TFT_BlueGolem') {
    championsDb['blue golem'] = champData;
    championsDb['bluegolem'] = champData;
    championsDb['golem'] = champData;
  }
  if (name_en.toLowerCase() === 'elder dragon' || apiName.includes('ElderDragon')) {
    championsDb['elder dragon'] = champData;
    championsDb['elderdragon'] = champData;
  }
}

// 1.1 Index any remaining Academy champions (summons, flex units, etc.)
for (const acChamp of academyChamps) {
  if (championsDb[acChamp.apiName] || (acChamp.id && championsDb[acChamp.id])) continue;

  const apiName = acChamp.apiName;
  let name_en = acChamp.name || apiName;
  if (apiName === 'TFT_BlueGolem') name_en = 'Blue Golem';
  const name_vi = name_en;

  let cost = acChamp.cost || 1;
  const costLookup = name_en.toLowerCase().trim();
  if (costLookup === 'gromp') cost = 2;
  else if (costLookup === 'blue golem' || costLookup === 'golem' || apiName === 'TFT_BlueGolem') cost = 1;
  else if (costLookup === 'lux') cost = 5;
  else if (costLookup === 'ivern') cost = 5;
  else if (costLookup === 'maokai') cost = 5;
  else if (costLookup === 'taric') cost = 5;
  else if (costLookup === 'elder dragon' || apiName.includes('ElderDragon')) cost = 5;
  const role_en = acChamp.role || 'Tank';
  const role_vi = role_en === 'Tank' ? 'Đỡ Đòn' : 'Triệu Hồi';

  const icon = acChamp.championSquareIcon 
    ? `https://assets.tftacademy.com/champions/champion_square_icons/${acChamp.championSquareIcon}`
    : (acChamp.championIcon ? `https://assets.tftacademy.com/champions/champion_icons/${acChamp.championIcon}` : '');

  const traitsList = (acChamp.traits || []).map((tId: string) => {
    const acTrait = academyTraits.find(x => x.id === tId);
    const tName = acTrait?.name || 'Elderwood';
    return {
      name_en: tName,
      name_vi: tName === 'Elderwood' ? 'Thần Rừng' : tName,
      icon: traitIconMap.get(tName.toLowerCase()) || 'assets/ux/traiticons/trait_icon_18_elderwood.png'
    };
  });

  const champData = {
    id: apiName,
    academyId: acChamp.id,
    name_vi,
    name_en,
    cost,
    role_en,
    role_vi,
    range: acChamp.stats?.range || 1,
    mana: acChamp.stats?.mana || 0,
    initialMana: 0,
    traits: traitsList.length > 0 ? traitsList : [{ name_en: 'Summon', name_vi: 'Triệu Hồi', icon: 'assets/ux/traiticons/trait_icon_18_elderwood.png' }],
    ability: {
      name_vi: acChamp.abilityName || 'Bảo Hộ Rừng Già',
      name_en: acChamp.abilityName || 'Forest Protection',
      mana: `0 / ${acChamp.stats?.mana || 0}`,
      desc_vi: cleanText(acChamp.ability) || 'Triệu hồi cổ thụ che chắn và hỗ trợ đồng minh trong giao tranh.',
      desc_en: cleanText(acChamp.ability) || 'Summon an ancient forest protector.',
      icon: ''
    },
    recommendedItems: acChamp.recommendedItems || [],
    icon
  };

  championsDb[apiName] = champData;
  championsDb[apiName.toLowerCase()] = champData;
  if (acChamp.id) championsDb[acChamp.id] = champData;
  championsDb[name_en.toLowerCase()] = champData;
  championsDb[name_vi.toLowerCase()] = champData;
}

// 2. Process Items
const itemsDb: Record<string, any> = {};
const allCdragItemsVi = cdragVi.items || [];
const allCdragItemsEn = cdragEn.items || [];

for (const acItem of academyItems) {
  const apiName = acItem.apiName;

  // 1. Prioritize exact apiName match
  let cVi = allCdragItemsVi.find((x: any) => x.apiName === apiName);
  
  // For DA_RedBuff, do NOT fall back to TFT_Item_RedBuff (which is Sunfire Cape / Áo Choàng Lửa in legacy Riot IDs)
  const isRedBuff = apiName === 'DA_RedBuff' || acItem.name === 'Red Buff';
  const isRedBuffRadiant = apiName === 'DA_RedBuffRadiant' || acItem.name === 'Radiant Red Buff';

  let fallbackVi: any = null;
  if (isRedBuff) {
    fallbackVi = allCdragItemsVi.find((x: any) => x.apiName === 'TFT_Item_RapidFireCannon');
  } else if (isRedBuffRadiant) {
    fallbackVi = allCdragItemsVi.find((x: any) => x.apiName === 'TFT5_Item_RapidFirecannonRadiant');
  } else {
    fallbackVi = allCdragItemsVi.find((x: any) => 
      x.apiName === `TFT_Item_${apiName.replace('DA_', '').replace('Artifact_', 'Artifact_')}` ||
      x.name?.toLowerCase() === acItem.name?.toLowerCase()
    );
  }

  if (!cVi) {
    cVi = fallbackVi || {};
  }

  let name_en = acItem.name || cVi.name || apiName;
  let name_vi = cVi.name || name_en;

  // Red Buff explicit fix: DA_RedBuff must be "Bùa Đỏ" / "Red Buff"
  if (isRedBuff) {
    name_vi = 'Bùa Đỏ';
    name_en = 'Red Buff';
  } else if (isRedBuffRadiant) {
    name_vi = 'Bùa Đỏ Ánh Sáng';
    name_en = 'Radiant Red Buff';
  }

  // Use official Riot Vietnamese item names for all items including Ornn Artifacts

  // Stats formatting
  const stats: Record<string, string> = {};
  const acStats = acItem.stats || {};
  const cEffects = { ...(fallbackVi?.effects || {}), ...(cVi.effects || {}) };

  function normalizePercent(val: any): number {
    if (val === undefined || val === null) return 0;
    const num = Number(val);
    return num <= 1 ? Math.round(num * 100) : Math.round(num);
  }

  if (acStats.as || cEffects.AS) stats.as = `+${normalizePercent(acStats.as || cEffects.AS)}%`;
  if (acStats.ad || cEffects.AD) stats.ad = `+${normalizePercent(acStats.ad || cEffects.AD)}%`;
  if (acStats.ap || cEffects.AP) stats.ap = `+${Math.round(acStats.ap || cEffects.AP)}`;
  if (acStats.ar || cEffects.Armor) stats.armor = `+${Math.round(acStats.ar || cEffects.Armor)}`;
  if (acStats.mr || cEffects.MagicResist) stats.mr = `+${Math.round(acStats.mr || cEffects.MagicResist)}`;
  if (acStats.hp || cEffects.Health) stats.hp = `+${Math.round(acStats.hp || cEffects.Health)}`;
  if (acStats.crit || cEffects.CritChance) stats.crit = `+${normalizePercent(acStats.crit || cEffects.CritChance)}%`;
  if (acStats.manaRegen) stats.manaRegen = `+${Math.round(acStats.manaRegen)}`;
  else if (acStats.mana || cEffects.Mana) stats.mana = `+${Math.round(acStats.mana || cEffects.Mana)}`;
  if (acStats.ov || cEffects.StatOmnivamp || cEffects.Omnivamp || cEffects.LifeSteal) {
    const rawVal = acStats.ov || cEffects.StatOmnivamp || cEffects.Omnivamp || cEffects.LifeSteal;
    stats.ov = `+${normalizePercent(rawVal)}%`;
  }

  // Descriptions: Strip {{TFT_Keyword_*}}
  const rawItemDesc = cVi.desc || fallbackVi?.desc;
  let desc_vi = cleanText(interpolateDescription(rawItemDesc, cEffects));
  if (!desc_vi || desc_vi.trim() === '') {
    desc_vi = cleanText(acItem.description)
      .replace(/Attacks and Abilities (\d+)% Burn and (\d+)% Wound enemies for (\d+) seconds\.?/gi, 'Đòn đánh và kỹ năng gây $1% Thiêu Đốt và $2% Vết Thương Sâu lên kẻ địch trong $3 giây.')
      .replace(/\+10% Attack Damage/gi, '+10% Sức Mạnh Công Kích')
      .replace(/\+10% Attack Speed/gi, '+10% Tốc Độ Đánh')
      .replace(/\+10% Ability Power/gi, '+10% Sức Mạnh Phép Thuật')
      .replace(/\+20 Magic Resist/gi, '+20 Kháng Phép')
      .replace(/\+150 Health/gi, '+150 Máu')
      .replace(/\+1 Mana Regeneration/gi, '+1 Hồi Năng Lượng')
      .replace(/\+20% Critical Strike Chance/gi, '+20% Tỉ Lệ Chí Mạng')
      .replace(/\+20 Armor/gi, '+20 Giáp')
      .replace(/Combat start:/gi, 'Bắt đầu giao tranh:')
      .replace(/Gain (\d+)% Ability Power every (\d+) seconds in combat/gi, 'Nhận $1% Sức Mạnh Phép Thuật mỗi $2 giây trong giao tranh')
      .replace(/Gain (\d+)% max Health/gi, 'Nhận $1% Máu tối đa')
      .replace(/Every (\d+) seconds, heal (\d+)% max Health/gi, 'Mỗi $1 giây, hồi $2% Máu tối đa')
      .replace(/Gain (\d+)% Durability/gi, 'Nhận $1% Giảm Sát Thương')
      .replace(/While above (\d+)% Health, instead gain (\d+)% Durability/gi, 'Khi còn trên $1% Máu, thay vào đó nhận $2% Giảm Sát Thương')
      .replace(/Gain (\d+)% stacking Attack Speed every second/gi, 'Nhận $1% Tốc Độ Đánh cộng dồn mỗi giây')
      .replace(/Gain \+1 Attack Range, increased by 1 whenever the holder kills an enemy/gi, 'Tăng +1 Tầm Đánh, tăng thêm 1 mỗi khi chủ sở hữu hạ gục một kẻ địch')
      .replace(/Gain a (\d+)% max Health Shield for (\d+) seconds/gi, 'Nhận lá chắn bằng $1% Máu tối đa trong $2 giây')
      .replace(/When the shield expires, gain (\d+)% Ability Power/gi, 'Khi lá chắn hết hiệu lực, nhận $1% Sức Mạnh Phép Thuật')
      .replace(/Gain 2 effects:/gi, 'Nhận 2 hiệu ứng:')
      .replace(/Combat Start:/gi, 'Bắt đầu giao tranh:')
      .replace(/At (\d+)% Health/gi, 'Khi còn $1% Máu')
      .replace(/gain (\d+) Mana/gi, 'nhận $1 Năng Lượng')
      .replace(/and a Shield equal to (\d+)% max Health/gi, 'và lá chắn tương đương $1% Máu tối đa')
      .replace(/While above 50% health, double the Attack Damage and Ability Power/gi, 'Khi còn trên 50% Máu, tăng gấp đôi Sức Mạnh Công Kích và Sức Mạnh Phép Thuật')
      .replace(/While below 50% Health, double the Omnivamp/gi, 'Khi còn dưới 50% Máu, nhận gấp đôi lượng Hút Máu Toàn Phần')
      .replace(/Heal the lowest percent Health ally for (\d+)% of damage dealt/gi, 'Hồi máu cho đồng minh thấp Máu nhất bằng $1% lượng sát thương gây ra');
  }
  let desc_en = cleanText(acItem.description || interpolateDescription(rawItemDesc, cEffects));

  // Recipe Components
  const recipe = (acItem.composition || []).map((compApi: string) => {
    const compAc = academyItems.find(x => x.apiName === compApi);
    const compVi = allCdragItemsVi.find((x: any) => x.apiName === compApi);
    const compPbIcon = compAc?.icon && compAc?.collectionId && compAc?.id
      ? `https://api.tftacademy.com/api/files/${compAc.collectionId}/${compAc.id}/${compAc.icon}`
      : '';
    const compCdIcon = cleanIcon(compVi?.icon);
    return {
      id: compApi,
      name_en: compAc?.name || compApi,
      name_vi: compVi?.name || compAc?.name || compApi,
      icon: compCdIcon || compPbIcon
    };
  });

  // Recommended Holders (Exact Match to TFT Academy: 4 champions!)
  const recHolders = (acItem.recommendedChampions || []).map((cId: string) => {
    const champ = academyChampById.get(cId);
    if (!champ) return null;
    const cData = championsDb[champ.apiName] || championsDb[champ.name.toLowerCase()];
    const hPbIcon = champ.championSquareIcon && champ.collectionId && champ.id
      ? `https://api.tftacademy.com/api/files/${champ.collectionId}/${champ.id}/${champ.championSquareIcon}`
      : '';
    const hCdIcon = cleanIcon(cData?.icon);
    return {
      id: champ.apiName,
      name_en: champ.name,
      name_vi: cData?.name_vi || champ.name,
      cost: champ.cost,
      icon: hPbIcon || hCdIcon
    };
  }).filter(Boolean);

  const pbIcon = acItem.icon && acItem.collectionId && acItem.id
    ? `https://api.tftacademy.com/api/files/${acItem.collectionId}/${acItem.id}/${acItem.icon}`
    : '';
  const cdIcon = cleanIcon(cVi.icon) || cleanIcon(fallbackVi?.icon);
  const icon = cdIcon || pbIcon;

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

const untranslatedAugmentNames = new Set([
  'Double Trouble',
  'Level Up!',
  'Late Game Specialist',
  'Late Game Scaling',
  'AFK',
  'Pandora\'s Items',
  'Pandora\'s Items II',
  'Bronze For Life',
  'Portable Forge',
  'Cursed Crown',
  'Trait Ladder',
  'Tiny Titans',
  'Birthday Present',
  'U.R.F.',
  '10.000 IQ',
  'Isekai',
  'Aura Farming',
  'Kamekameha',
  'Arcane Viktor-y',
  'Cruel Pact',
  'Trade Sector',
  'Golden Ticket',
  'Rich Get Richer',
  'Clear Mind',
  'Cluttered Mind',
  'March of Progress'
]);

for (const acAug of academyAugs) {
  const apiName = acAug.apiName;
  const cVi = allCdragItemsVi.find((x: any) => x.apiName === apiName || x.name?.toLowerCase() === acAug.name?.toLowerCase()) || {};

  const name_en = acAug.name || cVi.name || apiName;
  let name_vi = cVi.name || name_en;
  if (untranslatedAugmentNames.has(name_en)) {
    name_vi = name_en;
  }

  let desc_vi = cleanText(interpolateDescription(cVi.desc || acAug.description, cVi.effects || {}));
  let desc_en = cleanText(acAug.description || interpolateDescription(cVi.desc, cVi.effects || {}));

  if (name_en === 'Double Trouble') {
    desc_vi = 'Khi bạn ra sân đúng 2 bản sao của một tướng, cả hai đều nhận thêm 30% Sức Mạnh Công Kích, 30 Sức Mạnh Phép Thuật, 30 Giáp và 30 Kháng Phép. Khi bạn nâng cấp lên 3 sao, nhận 1 bản sao 2 sao.';
  } else if (name_en.includes('Pandora')) {
    desc_vi = 'Bắt đầu vòng đấu: các trang bị trên hàng dự bị được biến đổi ngẫu nhiên. Nhận 2 trang bị thành phần ngẫu nhiên.';
  }

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
  const cVi = set18TraitsVi.find((x: any) => 
    x.apiName === apiName || 
    x.apiName?.toLowerCase() === apiName?.toLowerCase() ||
    x.name?.toLowerCase() === acTrait.name?.toLowerCase()
  ) || {};
  const cEn = set18TraitsEn.find((x: any) =>
    x.apiName === apiName ||
    x.apiName?.toLowerCase() === apiName?.toLowerCase() ||
    x.name?.toLowerCase() === acTrait.name?.toLowerCase()
  ) || {};

  const name_en = acTrait.name || cEn.name || apiName;
  const name_vi = cVi.name || name_en;

  const desc_vi = cleanText(interpolateDescription(cVi.desc || acTrait.description, cVi.effects || {}));
  const desc_en = cleanText(acTrait.description || interpolateDescription(cEn.desc || cVi.desc, cVi.effects || {}));

  const realIcon = cleanIcon(cVi.icon) || 
                   traitIconMap.get(name_vi.toLowerCase().trim()) || 
                   traitIconMap.get(name_en.toLowerCase().trim()) || 
                   traitIconMap.get(apiName.toLowerCase().trim()) ||
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
  const cleanId = apiName.replace(/^DA_18_/, '').replace(/^DA_/, '').replace(/18$/, '');
  traitsDb[cleanId] = traitData;
  traitsDb[cleanId.toLowerCase()] = traitData;
}

const fullDb = {
  champions: championsDb,
  items: itemsDb,
  augments: augmentsDb,
  traits: traitsDb
};

fs.writeFileSync(OUT_FILE, JSON.stringify(fullDb, null, 2), 'utf8');
console.log('Successfully saved unified tooltip DB to:', OUT_FILE, `(${(fs.statSync(OUT_FILE).size / 1024 / 1024).toFixed(2)} MB)`);
