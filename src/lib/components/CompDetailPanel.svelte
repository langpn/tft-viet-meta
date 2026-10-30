<script lang="ts">
  import HexAvatar from './HexAvatar.svelte';
  import BoardHexMap from './BoardHexMap.svelte';
  import { resolveAugmentIcon, resolveItemIcon, resolveTraitIcon, resolveChampionIcon } from '$lib/utils/assets';
  import { translatePlaystyle, translateDifficulty, translateStrategyTip } from '$lib/utils/strategy-translator';
  import { showTooltip, hideTooltip } from '$lib/utils/tooltip-store.svelte';
  import { settingsStore } from '$lib/utils/settings-store.svelte';
  import { generateRiotTeamCode } from '$lib/utils/team-code';
  import newSetData from '$data/academy-new-set.json';
  import { Copy, X, Check, ExternalLink, Coins, Package, Swords, ChevronRight } from 'lucide-svelte';

  interface Props {
    comp: any;
    allComps?: any[];
    onclose?: () => void;
    onselectcomp?: (c: any) => void;
  }

  let { comp, allComps = [], onclose, onselectcomp }: Props = $props();

  let copied = $state(false);

  // Pre-index champions and traits from Set 18 data
  const champMap = new Map<string, any>();
  for (const c of newSetData.champions || []) {
    if (c.id) {
      champMap.set(c.id, c);
      champMap.set(c.id.toLowerCase(), c);
    }
    if (c.name_en) champMap.set(c.name_en.toLowerCase(), c);
    if (c.name_vi) champMap.set(c.name_vi.toLowerCase(), c);
  }

  const traitMap = new Map<string, any>();
  for (const t of newSetData.traits || []) {
    if (t.id) {
      traitMap.set(t.id, t);
      traitMap.set(t.id.toLowerCase(), t);
    }
    if (t.name_en) traitMap.set(t.name_en.toLowerCase(), t);
    if (t.name_vi) traitMap.set(t.name_vi.toLowerCase(), t);
  }

  const FALLBACK_COSTS: Record<string, number> = {
    gromp: 2,
    da_gromp18_ap: 2,
    sentinel: 4,
    da_sentinel18: 4,
    'blue golem': 1,
    golem: 1,
    tft_bluegolem: 1,
    lux: 5,
    da_lux18_base: 5,
    ivern: 5,
    da_18_ivern: 5,
    maokai: 5,
    da_18_maokai: 5,
    'elder dragon': 5,
    elderdragon: 5
  };

  function resolveUnitCost(unit: any): number {
    const id = (unit?.id || '').toLowerCase();
    const name = (unit?.name_en || unit?.name || '').toLowerCase();

    if (FALLBACK_COSTS[id] !== undefined) return FALLBACK_COSTS[id];
    if (FALLBACK_COSTS[name] !== undefined) return FALLBACK_COSTS[name];

    const champ = champMap.get(id) || champMap.get(name);
    if (champ?.cost !== undefined) return champ.cost;

    if (unit?.cost !== undefined && unit.cost !== null && unit.cost !== 0) {
      return unit.cost;
    }

    return 1;
  }

  const traitTierClasses: Record<string, string> = {
    bronze: 'bg-[#A86445] text-black',
    silver: 'bg-[#A3B3C2] text-black',
    gold: 'bg-[#E5A83B] text-black',
    prismatic: 'bg-gradient-to-r from-purple-400 to-pink-400 text-black'
  };

  function copyCompCode() {
    if (typeof navigator !== 'undefined' && comp) {
      const code = generateRiotTeamCode(comp.finalComp || comp.board);
      navigator.clipboard.writeText(code || `${comp.title} - TFT Academy Meta Comp`);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    }
  }

  // Derive variation tabs (sharing same main champion carry and same tier, matching Screenshot 2)
  const variationComps = $derived.by(() => {
    if (!comp?.mainCarry?.id || !allComps || allComps.length === 0) return [comp];
    const vars = allComps.filter((c: any) => c.mainCarry?.id === comp.mainCarry?.id && c.tier === comp.tier);
    return vars.length > 0 ? vars : [comp];
  });

  // Derive active trait badges (matching Screenshot 3: compact colored pills under playstyle)
  const traits = $derived.by(() => {
    if (comp?.traits && Array.isArray(comp.traits) && comp.traits.length > 0 && comp.traits[0].count) {
      return comp.traits;
    }

    const units = finalChampions && finalChampions.length > 0 ? finalChampions : (comp?.board || []);
    if (!units || units.length === 0) return [];

    const traitCounts = new Map<string, number>();
    const seenChamps = new Set<string>();

    for (const u of units) {
      if (!u || !u.id) continue;
      const champ = champMap.get(u.id) || champMap.get(u.id.toLowerCase()) || champMap.get((u.name_en || u.name || '').toLowerCase());
      if (!champ) continue;

      if (seenChamps.has(champ.id)) continue;
      seenChamps.add(champ.id);

      for (const t of champ.traits || []) {
        const traitDef = traitMap.get(t.id) || traitMap.get(t.id?.toLowerCase()) || traitMap.get((t.name_en || t.name || '').toLowerCase());
        const traitId = traitDef ? traitDef.id : t.id;
        traitCounts.set(traitId, (traitCounts.get(traitId) || 0) + 1);
      }
    }

    const activeList: any[] = [];
    for (const [traitId, count] of traitCounts.entries()) {
      const tDef = traitMap.get(traitId) || traitMap.get(traitId.toLowerCase());
      if (!tDef || !tDef.breakpoints || tDef.breakpoints.length === 0) continue;

      let tierIndex = -1;
      for (let i = tDef.breakpoints.length - 1; i >= 0; i--) {
        if (tDef.breakpoints[i] > 0 && count >= tDef.breakpoints[i]) {
          tierIndex = i;
          break;
        }
      }

      if (tierIndex >= 0) {
        const colorCode = tDef.colors ? tDef.colors[tierIndex] : 1;
        let tier: 'bronze' | 'silver' | 'gold' | 'prismatic' = 'bronze';
        if (colorCode >= 6) {
          tier = 'prismatic';
        } else if (colorCode === 4 || colorCode === 5) {
          tier = 'gold';
        } else if (colorCode === 2 || colorCode === 3) {
          tier = 'silver';
        } else {
          tier = 'bronze';
        }

        activeList.push({
          id: tDef.id,
          name_en: tDef.name_en,
          name_vi: tDef.name_vi,
          icon: tDef.icon,
          count,
          tier,
          colorCode,
          minUnits: tDef.breakpoints[tierIndex]
        });
      }
    }

    // Sort: highest count first, then highest tier
    const tierWeight: Record<string, number> = { prismatic: 4, gold: 3, silver: 2, bronze: 1 };
    activeList.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return (tierWeight[b.tier] || 0) - (tierWeight[a.tier] || 0);
    });

    return activeList;
  });

  // Derive Item Priority list (directly from official TFT Academy comp.carousel)
  const itemPriority = $derived.by(() => {
    if (comp?.carousel && comp.carousel.length > 0) return comp.carousel;
    const list: any[] = [];
    if (comp?.mainCarry?.items) {
      for (const it of comp.mainCarry.items) {
        if (!list.some(x => x.id === it.id)) list.push(it);
      }
    }
    if (comp?.mainTank?.items) {
      for (const it of comp.mainTank.items) {
        if (!list.some(x => x.id === it.id)) list.push(it);
      }
    }
    return list;
  });

  // Derive Alt Builds (directly from official TFT Academy comp.altBuildsList)
  const altBuilds = $derived.by(() => {
    if (comp?.altBuildsList && comp.altBuildsList.length > 0) return comp.altBuildsList;
    return [
      {
        champ: comp?.mainCarry,
        items: comp?.mainCarry?.items?.slice(0, 3) || []
      }
    ];
  });

  // Final Champions row (filters out summon trees/props, exactly like TFT Academy Screenshot 4)
  const finalChampions = $derived.by(() => {
    if (comp?.finalChampions && comp.finalChampions.length > 0) return comp.finalChampions;
    const NON_CHAMPION_UNITS = new Set([
      'DA_Elderwood18_StonebarkTree',
      'DA_Elderwood18_Lifeblossom',
      'DA_Elderwood18_Protector',
      'TFT_TrainingDummy',
      'TFT_Voidspawn',
      'TFT17_Relic',
      'TFT17_Summon'
    ]);
    return (comp?.board || []).filter((u: any) => !NON_CHAMPION_UNITS.has(u.id));
  });
</script>

{#if comp}
  <!-- TFT Academy Exact Replica Container (Ultra Dark Jet-Black Palette, Full Width Inline) -->
  <div class="w-full rounded-2xl bg-[#0B0D12] border border-[#1C202B] shadow-2xl overflow-hidden flex flex-col lg:flex-row">
    
    <!-- LEFT COLUMN: Core Carry Showcase, Traits, Augments & Priority (32% width) -->
    <div class="lg:w-[32%] bg-[#0E1118] border-b lg:border-b-0 lg:border-r border-[#1C202B] p-5 sm:p-6 flex flex-col gap-5 select-none">
      
      <!-- Top Angular Gold Header Card for Main Carry -->
      <div class="relative rounded-2xl bg-gradient-to-b from-amber-500/15 via-[#131722]/60 to-transparent p-5 border border-amber-500/20 flex flex-col items-center shadow-lg">
        {#if comp.mainCarry}
          <div class="relative py-2">
            <HexAvatar 
              id={comp.mainCarry.id}
              name={comp.mainCarry.name_en || comp.mainCarry.name}
              nameVi={comp.mainCarry.name_vi || comp.mainCarry.name_en || comp.mainCarry.name}
              iconUrl={comp.mainCarry.icon}
              cost={comp.mainCarry.cost}
              starLevel={1}
              showStars={false}
              items={comp.mainCarry.items}
              showItems={true}
              size="xl"
            />
          </div>
        {/if}

        <!-- Title & Subtitle -->
        <h2 class="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white text-center mt-2">
          {comp.title}
        </h2>
        {#if comp.metaTitle && comp.metaTitle !== comp.title}
          <span class="text-xs text-slate-400 font-medium text-center">{comp.metaTitle}</span>
        {/if}

        <!-- Playstyle & Difficulty Pill -->
        <div class="mt-2.5 flex items-center justify-center gap-1.5 flex-wrap">
          <span class="text-[11px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
            PLAYSTYLE: {translatePlaystyle(comp.compStyle)} {comp.difficulty ? `(${translateDifficulty(comp.difficulty)})` : ''}
          </span>
        </div>

        <!-- Trait Badges Row (Matching Screenshot 3) -->
        {#if traits.length > 0}
          <div class="flex flex-wrap items-center justify-center gap-1.5 mt-3 pt-3 border-t border-white/5 w-full">
            {#each traits as trait}
              {@const tIcon = resolveTraitIcon(trait.icon, trait.id)}
              <div 
                class="flex items-center gap-1 px-1.5 py-0.5 rounded font-black text-xs shadow-sm cursor-pointer hover:scale-110 transition-transform {traitTierClasses[trait.tier] || traitTierClasses.bronze}"
                onmouseenter={(e) => showTooltip({ type: 'trait', id: trait.id, name: trait.name_vi }, e.currentTarget)}
                onmouseleave={() => hideTooltip()}
              >
                {#if tIcon}
                  <img src={tIcon} alt="" class="w-3.5 h-3.5 object-contain brightness-0" />
                {/if}
                <span class="text-[11px] font-black leading-none">{trait.count}</span>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Augments Showcase (2 Rows of 4, Matching Screenshot 4) -->
      {#if comp.augments && comp.augments.length > 0}
        <div class="flex flex-col gap-2 pt-2">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
            Augments
          </span>
          <div class="grid grid-cols-4 gap-2 pt-1 justify-items-center">
            {#each comp.augments.slice(0, 8) as aug}
              {@const aIcon = resolveAugmentIcon(aug.icon, aug.id)}
              <div 
                class="w-12 h-12 rounded-xl bg-black border border-white/10 overflow-hidden p-1 flex items-center justify-center hover:scale-115 hover:border-amber-400 transition-all shadow-md cursor-pointer"
                onmouseenter={(e) => showTooltip({ type: 'augment', id: aug.id, name: aug.name_vi }, e.currentTarget)}
                onmouseleave={() => hideTooltip()}
              >
                {#if aIcon}
                  <img src={aIcon} alt="" class="w-full h-full object-contain" loading="lazy" />
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Augment Priority: ECON ➔ ITEMS ➔ COMBAT (Exact Match to Screenshot 4) -->
      <div class="flex flex-col gap-2 pt-2 border-t border-white/5">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
          Augment Priority
        </span>
        <div class="flex items-center justify-center gap-3 text-xs font-black text-slate-300 py-1">
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141824] border border-white/5">
            <Coins class="w-3.5 h-3.5 text-amber-400" />
            <span class="text-[11px]">ECON</span>
          </div>
          <ChevronRight class="w-3.5 h-3.5 text-slate-500" />
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141824] border border-white/5">
            <Package class="w-3.5 h-3.5 text-sky-400" />
            <span class="text-[11px]">ITEMS</span>
          </div>
          <ChevronRight class="w-3.5 h-3.5 text-slate-500" />
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141824] border border-white/5">
            <Swords class="w-3.5 h-3.5 text-rose-400" />
            <span class="text-[11px]">COMBAT</span>
          </div>
        </div>
      </div>

    </div>

    <!-- RIGHT COLUMN: Final Comp, Early, Priority, Board, Tips & Stages (68% width) -->
    <div class="lg:w-[68%] p-6 sm:p-7 flex flex-col gap-6 justify-between bg-[#0B0D12] select-none">
      
      <!-- Top Action Bar with Variation Tabs (Matching Screenshot 4) -->
      <div class="flex items-center justify-between border-b border-[#1C202B] pb-3.5">
        <!-- Variation Tabs: [ S Draven Ezreal 9 ] [ A Draven Dragon 9 ] -->
        <div class="flex items-center gap-2 overflow-x-auto">
          {#if variationComps && variationComps.length > 1}
            {#each variationComps as vComp}
              <button
                type="button"
                onclick={() => onselectcomp ? onselectcomp(vComp) : (comp = vComp)}
                class="flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer {comp.id === vComp.id ? 'bg-[#141824] border border-amber-400 text-white shadow-md' : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'}"
              >
                <span class="px-1.5 py-0.5 rounded text-[10px] uppercase font-black {vComp.tier === 'S' ? 'bg-rose-500 text-white' : vComp.tier === 'A' ? 'bg-orange-500 text-white' : 'bg-amber-400 text-black'}">
                  {vComp.tier}
                </span>
                <span>{vComp.title}</span>
              </button>
            {/each}
          {:else}
            <div class="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#141824] border border-amber-400/40 text-xs font-black text-white shadow-md">
              <span class="px-1.5 py-0.5 rounded text-[10px] uppercase font-black {comp.tier === 'S' ? 'bg-rose-500 text-white' : comp.tier === 'A' ? 'bg-orange-500 text-white' : 'bg-amber-400 text-black'}">
                {comp.tier}
              </span>
              <span>{comp.title}</span>
            </div>
          {/if}
        </div>

        <!-- Copy & Close Buttons -->
        <div class="flex items-center gap-2 shrink-0">
          <button 
            type="button"
            onclick={copyCompCode}
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141824] hover:bg-[#1E2538] border border-white/10 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
          >
            {#if copied}
              <Check class="w-3.5 h-3.5 text-emerald-400" />
              <span class="text-emerald-400">Đã chép!</span>
            {:else}
              <Copy class="w-3.5 h-3.5 text-amber-400" />
              <span>Copy</span>
            {/if}
          </button>

          {#if onclose}
            <button 
              type="button"
              onclick={onclose}
              aria-label="Đóng chi tiết"
              class="w-8 h-8 rounded-xl bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 flex items-center justify-center text-slate-400 transition-colors cursor-pointer"
            >
              <X class="w-4 h-4" />
            </button>
          {/if}
        </div>
      </div>

      <!-- Final Comp Lineup (Matching Screenshot 4: 9 Champions with Items, NO summon trees) -->
      {#if finalChampions && finalChampions.length > 0}
        <div class="flex flex-col gap-2">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Final Comp
          </span>
          <div class="flex flex-wrap items-center gap-3 py-1">
            {#each finalChampions as unit}
              <HexAvatar 
                id={unit.id}
                name={unit.name_en || unit.name}
                nameVi={unit.name_vi || unit.name_en || unit.name}
                iconUrl={unit.icon}
                cost={unit.cost}
                starLevel={unit.stars || 1}
                showStars={unit.stars === 3}
                items={unit.items}
                showItems={true}
                size="md"
                showName={settingsStore.showNames}
              />
            {/each}
          </div>
        </div>
      {/if}

      <!-- 3 Sub-columns: Early Units, Item Priority, Flex Units -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <!-- Early Units -->
        <div class="p-3.5 rounded-xl bg-[#10131B] border border-[#1D2230] flex flex-col gap-2">
          <span class="text-xs font-bold text-slate-300 uppercase tracking-wider text-center">
            Early Units
          </span>
          <div class="flex flex-wrap items-center justify-center gap-2 pt-1">
            {#if comp.levelingCurve?.earlyComp && comp.levelingCurve.earlyComp.length > 0}
              {#each comp.levelingCurve.earlyComp as u}
                <HexAvatar 
                  id={u.id}
                  name={u.name_en || u.name}
                  nameVi={u.name_vi || u.name_en || u.name}
                  iconUrl={u.icon}
                  cost={u.cost}
                  size="sm"
                  showName={settingsStore.showNames}
                />
              {/each}
            {:else}
              <span class="text-xs text-slate-500">Form bài đầu trận</span>
            {/if}
          </div>
        </div>

        <!-- Item Priority (Directly from comp.carousel matching Screenshot 4!) -->
        <div class="p-3.5 rounded-xl bg-[#10131B] border border-[#1D2230] flex flex-col gap-2">
          <span class="text-xs font-bold text-slate-300 uppercase tracking-wider text-center">
            Item Priority
          </span>
          <div class="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            {#each itemPriority.slice(0, 5) as item, idx}
              {@const itIcon = resolveItemIcon(item.icon, item.id)}
              <div 
                class="w-9 h-9 rounded-lg bg-black border border-white/20 p-0.5 overflow-hidden shadow hover:scale-120 hover:border-amber-400 transition-all cursor-pointer"
                onmouseenter={(e) => showTooltip({ type: 'item', id: item.id, name: item.name_vi || item.name_en }, e.currentTarget)}
                onmouseleave={() => hideTooltip()}
              >
                {#if itIcon}
                  <img src={itIcon} alt="" class="w-full h-full object-contain" />
                {/if}
              </div>
              {#if idx < Math.min(itemPriority.length, 5) - 1}
                <ChevronRight class="w-3 h-3 text-slate-500 shrink-0" />
              {/if}
            {/each}
          </div>
        </div>

        <!-- Flex Units -->
        <div class="p-3.5 rounded-xl bg-[#10131B] border border-[#1D2230] flex flex-col gap-2">
          <span class="text-xs font-bold text-slate-300 uppercase tracking-wider text-center">
            Flex Units
          </span>
          <div class="flex flex-wrap items-center justify-center gap-2 pt-1">
            {#if comp.maxCap && comp.maxCap.length > 0}
              {#each comp.maxCap.slice(0, 3) as cap}
                {@const unitCost = resolveUnitCost(cap)}
                <HexAvatar 
                  id={cap.id}
                  name={cap.name_en || cap.name}
                  nameVi={cap.name_vi || cap.name_en || cap.name}
                  iconUrl={cap.icon}
                  cost={unitCost}
                  size="sm"
                  showName={settingsStore.showNames}
                />
              {/each}
            {:else}
              <span class="text-xs text-slate-500">Tướng kẹp thêm</span>
            {/if}
          </div>
        </div>
      </div>

      <!-- Positioning Board + Alt Builds Side-by-Side (Matching Screenshot 4) -->
      <div class="flex flex-col lg:flex-row items-center gap-4">
        <!-- 28-Hex Board -->
        <div class="flex-1 w-full">
          <div class="text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Positioning Example
          </div>
          {#if comp.board && comp.board.length > 0}
            <BoardHexMap units={comp.board.map((u: any) => ({
              id: u.id,
              name: u.name_en || u.name,
              nameVi: u.name_vi || u.name_en || u.name,
              iconUrl: u.icon,
              cost: u.cost,
              starLevel: u.stars || 1,
              position: u.boardIndex ?? (u.hex ? u.hex.row * 7 + u.hex.col : 0),
              items: u.items
            }))} />
          {/if}
        </div>

        <!-- Alt Builds (Directly from comp.altBuildsList matching Screenshot 4!) -->
        <div class="lg:w-36 flex flex-col items-center gap-2 p-3 rounded-xl bg-[#10131B] border border-[#1D2230]">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
            Alt Builds
          </span>
          <div class="flex flex-col gap-3 py-1">
            {#each altBuilds as alt}
              <div class="flex flex-col items-center gap-1">
                <HexAvatar 
                  id={alt.champ?.id}
                  name={alt.champ?.name_en || alt.champ?.name}
                  nameVi={alt.champ?.name_vi || alt.champ?.name_en || alt.champ?.name}
                  iconUrl={alt.champ?.icon}
                  cost={alt.champ?.cost || 4}
                  size="sm"
                />
                <div class="flex items-center gap-1 -mt-2">
                  {#each alt.items as item}
                    {@const aIcon = resolveItemIcon(item.icon, item.id)}
                    <div 
                      class="w-6 h-6 rounded bg-black border border-amber-400/60 p-0.5 cursor-pointer hover:scale-120 transition-transform"
                      onmouseenter={(e) => showTooltip({ type: 'item', id: item.id, name: item.name_vi || item.name_en }, e.currentTarget)}
                      onmouseleave={() => hideTooltip()}
                    >
                      <img src={aIcon} alt="" class="w-full h-full object-contain" />
                    </div>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- Tips Section (Matching Screenshot 2 exactly!) -->
      <div class="flex flex-col gap-3 pt-2">
        <div class="flex items-center justify-center">
          <span class="px-5 py-1 rounded-full bg-[#141824] border border-white/10 text-xs font-black text-slate-300 uppercase tracking-widest shadow-sm">
            Tips
          </span>
        </div>

        <!-- General Tip Card -->
        {#if comp.augmentsTip}
          <div class="p-4 rounded-xl bg-[#10131B] border border-[#1D2230] text-xs leading-relaxed text-slate-200 shadow-md">
            {translateStrategyTip(comp.augmentsTip)}
          </div>
        {/if}

        <!-- 3 Stage Cards: Stage 2, Stage 3, Stage 4 -->
        {#if comp.tips && Array.isArray(comp.tips) && comp.tips.length > 0}
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            {#each comp.tips as step}
              <div class="p-4 rounded-xl bg-[#10131B] border border-[#1D2230] flex flex-col gap-2.5 shadow-md">
                <div class="flex items-center justify-center">
                  <span class="px-4 py-0.5 rounded-full bg-[#141824] border border-white/10 text-[11px] font-black text-slate-300 uppercase tracking-wider">
                    {step.stage === 'Stage 2' ? 'Giai đoạn 2' : step.stage === 'Stage 3' ? 'Giai đoạn 3' : step.stage === 'Stage 4' ? 'Giai đoạn 4' : step.stage}
                  </span>
                </div>
                <p class="text-xs text-slate-300 leading-relaxed font-normal">
                  {translateStrategyTip(step.tip)}
                </p>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Bottom Controls: Open in Builder + Show Names Toggle (Matching Screenshot 4) -->
      <div class="flex items-center justify-end gap-5 pt-3 border-t border-[#1C202B]">
        <a 
          href="/explorer"
          class="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors"
        >
          <span>Open in Builder</span>
          <ExternalLink class="w-3.5 h-3.5 text-amber-400" />
        </a>

        <label class="flex items-center gap-2 text-xs font-bold text-slate-400 cursor-pointer select-none">
          <span>Show names</span>
          <input 
            type="checkbox" 
            bind:checked={settingsStore.showNames}
            class="toggle-checkbox w-9 h-5 rounded-full bg-slate-700 checked:bg-amber-400 transition-colors cursor-pointer appearance-none relative before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:w-4 before:h-4 before:rounded-full before:bg-white before:transition-transform checked:before:translate-x-4"
          />
        </label>
      </div>

    </div>

  </div>
{/if}
