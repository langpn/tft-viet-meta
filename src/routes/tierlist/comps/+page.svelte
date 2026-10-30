<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import HexAvatar from '$components/HexAvatar.svelte';
  import CompDetailPanel from '$components/CompDetailPanel.svelte';
  import CustomDropdown from '$components/CustomDropdown.svelte';
  import TftSearchBar, { type ActiveFilter } from '$components/TftSearchBar.svelte';
  import { resolveItemIcon, resolveAugmentIcon } from '$lib/utils/assets';
  import { matchesQuery } from '$lib/utils/search';
  import { interpolateDescription } from '$lib/utils/augment-cleaner';
  import { Flame, Shield, Sparkles, ExternalLink, Clock, Layers } from 'lucide-svelte';

  let { data }: { data: PageData } = $props();

  // Comp filters
  let activeFilters = $state<ActiveFilter[]>([]);
  let rawQueryText = $state('');
  let selectedStyle = $state('ALL');
  let selectedSet = $state('Set 18');
  let selectedCompId = $state<string | null>(data.initialCompId || null);

  const compStyleOptions = [
    { value: 'ALL', label: 'Lối Chơi' },
    { value: 'Show All', label: 'Tất cả lối chơi' },
    { value: '1-Cost Reroll', label: 'Reroll 1 Vàng' },
    { value: '2-Cost Reroll', label: 'Reroll 2 Vàng' },
    { value: '3-Cost Reroll', label: 'Reroll 3 Vàng' },
    { value: '4-Cost Fast 8', label: 'Lên Cấp 8 Nhanh (Fast 8)' },
    { value: 'Fast 9', label: 'Lên Cấp 9 Nhanh (Fast 9)' },
    { value: 'Lose Streak', label: 'Đánh Chuỗi Thua' }
  ];

  const setOptions = [
    { value: 'Set 18', label: 'Mùa 18' },
    { value: 'Set 17', label: 'Mùa 17' }
  ];

  // Filtering comps by style and multi-search filter chips
  const compsWithMatchStatus = $derived.by(() => {
    return data.comps.map((comp: any) => {
      // 1. Check style filter
      let matchStyle = true;
      if (selectedStyle !== 'ALL' && selectedStyle !== 'Show All') {
        matchStyle = Boolean(comp.compStyle?.toLowerCase().includes(selectedStyle.toLowerCase()));
      }

      // 2. Check typed text search (accent-insensitive)
      let matchText = true;
      if (rawQueryText.trim()) {
        const q = rawQueryText.trim();
        const inCarry = matchesQuery(comp.mainCarry?.name_en, q) || 
                        matchesQuery(comp.mainCarry?.name_vi, q) || 
                        matchesQuery(comp.mainCarry?.name, q) || 
                        matchesQuery(comp.mainCarry?.nameVi, q) ||
                        matchesQuery(comp.mainCarry?.id, q);
        const inTank = matchesQuery(comp.mainTank?.name_en, q) || 
                       matchesQuery(comp.mainTank?.name_vi, q) || 
                       matchesQuery(comp.mainTank?.name, q) || 
                       matchesQuery(comp.mainTank?.nameVi, q) ||
                       matchesQuery(comp.mainTank?.id, q);
        const inBoard = comp.board?.some((u: any) => 
          matchesQuery(u.name_en, q) || 
          matchesQuery(u.name_vi, q) || 
          matchesQuery(u.name, q) || 
          matchesQuery(u.id, q)
        );
        const inItems = comp.mainCarry?.items?.some((i: any) => matchesQuery(i.name_en, q) || matchesQuery(i.name_vi, q) || matchesQuery(i.id, q)) ||
                        comp.mainTank?.items?.some((i: any) => matchesQuery(i.name_en, q) || matchesQuery(i.name_vi, q) || matchesQuery(i.id, q));
        const inTraits = comp.traits?.some((t: any) => matchesQuery(t.name, q) || matchesQuery(t.name_vi, q) || matchesQuery(t.id, q));
        const inAugs = comp.augments?.some((a: any) => matchesQuery(a.name_en, q) || matchesQuery(a.name_vi, q) || matchesQuery(a.id, q));
        const inTitle = matchesQuery(comp.title, q) || matchesQuery(comp.metaTitle, q);

        matchText = inCarry || inTank || inBoard || inItems || inTraits || inAugs || inTitle;
      }

      // 3. Check multi-filters (units, items, traits, augments)
      let matchChips = true;
      if (activeFilters.length > 0) {
        matchChips = activeFilters.every(filter => {
          const fid = filter.id;
          const fnameVi = filter.nameVi;
          const fnameEn = filter.nameEn;

          // Check carry
          if (matchesQuery(comp.mainCarry?.id, fid) || 
              matchesQuery(comp.mainCarry?.name_en, fnameEn) || 
              matchesQuery(comp.mainCarry?.name_vi, fnameVi) ||
              matchesQuery(comp.mainCarry?.name, fnameEn) || 
              matchesQuery(comp.mainCarry?.nameVi, fnameVi)) return true;
          // Check tank
          if (matchesQuery(comp.mainTank?.id, fid) || 
              matchesQuery(comp.mainTank?.name_en, fnameEn) || 
              matchesQuery(comp.mainTank?.name_vi, fnameVi) ||
              matchesQuery(comp.mainTank?.name, fnameEn) || 
              matchesQuery(comp.mainTank?.nameVi, fnameVi)) return true;
          // Check board units
          if (comp.board?.some((u: any) => 
            matchesQuery(u.id, fid) || 
            matchesQuery(u.name_en, fnameEn) || 
            matchesQuery(u.name_vi, fnameVi) ||
            matchesQuery(u.name, fnameEn)
          )) return true;
          // Check items on carry or tank
          if (comp.mainCarry?.items?.some((i: any) => matchesQuery(i.id, fid) || matchesQuery(i.name_en, fnameEn) || matchesQuery(i.name_vi, fnameVi))) return true;
          if (comp.mainTank?.items?.some((i: any) => matchesQuery(i.id, fid) || matchesQuery(i.name_en, fnameEn) || matchesQuery(i.name_vi, fnameVi))) return true;
          // Check traits
          if (comp.traits?.some((t: any) => matchesQuery(t.id, fid) || matchesQuery(t.name, fnameEn) || matchesQuery(t.name_vi, fnameVi))) return true;
          // Check augments
          if (comp.augments?.some((a: any) => matchesQuery(a.id, fid) || matchesQuery(a.name_en, fnameEn) || matchesQuery(a.name_vi, fnameVi))) return true;
          // Check title
          if (matchesQuery(comp.title, fnameEn) || matchesQuery(comp.title, fnameVi) || matchesQuery(comp.metaTitle, fnameEn) || matchesQuery(comp.metaTitle, fnameVi)) return true;

          return false;
        });
      }

      const isMatch = matchStyle && matchText && matchChips;
      return { comp, isMatch };
    });
  });

  const isFiltering = $derived(
    Boolean(rawQueryText.trim() || activeFilters.length > 0 || (selectedStyle !== 'ALL' && selectedStyle !== 'Show All'))
  );

  const costBorderColors: Record<number, string> = {
    0: 'bg-slate-600',
    1: 'bg-slate-400',
    2: 'bg-emerald-500',
    3: 'bg-sky-500',
    4: 'bg-fuchsia-500',
    5: 'bg-amber-400'
  };

  const tiers = ['S', 'A', 'B', 'C', 'X'];

  const TIER_ORDER: Record<string, number> = {
    S: 5,
    A: 4,
    B: 3,
    C: 2,
    X: 1
  };

  interface TierCompGroup {
    champKey: string;
    primaryComp: any;
    hasVariation: boolean;
    comps: any[];
    isMatch: boolean;
    matchedComp: any;
  }

  // Group comps per tier by main champion carry (matching TFT Academy's exact shelf architecture)
  // and clicking automatically opens the best comp in that group.
  const tierGroups = $derived.by(() => {
    const map: Record<string, TierCompGroup[]> = {
      S: [],
      A: [],
      B: [],
      C: [],
      X: []
    };

    const origIndexMap = new Map<string, number>();
    data.comps.forEach((c: any, idx: number) => origIndexMap.set(c.id, idx));

    for (const t of tiers) {
      const tierComps = compsWithMatchStatus.filter((e) => e.comp.tier === t);
      
      const groupMap = new Map<string, {
        champKey: string;
        comps: any[];
        matchMap: Map<string, boolean>;
      }>();

      for (const entry of tierComps) {
        const { comp, isMatch } = entry;
        const key = comp.mainCarry?.id || comp.mainChampion?.apiName || comp.id;

        let g = groupMap.get(key);
        if (!g) {
          g = {
            champKey: key,
            comps: [comp],
            matchMap: new Map([[comp.id, isMatch]])
          };
          groupMap.set(key, g);
        } else {
          g.comps.push(comp);
          g.matchMap.set(comp.id, isMatch);
        }
      }

      for (const g of groupMap.values()) {
        // Sort comps in this group preserving TFT Academy's ranking order (best comp first)
        g.comps.sort((a, b) => (origIndexMap.get(a.id) ?? 0) - (origIndexMap.get(b.id) ?? 0));

        const primaryComp = g.comps[0];
        const hasVariation = g.comps.length > 1;

        let isMatch = false;
        let matchedComp = primaryComp;

        if (isFiltering) {
          const matchingComps = g.comps.filter((c) => g.matchMap.get(c.id));
          if (matchingComps.length > 0) {
            isMatch = true;
            matchedComp = matchingComps[0];
          } else {
            isMatch = false;
            matchedComp = primaryComp;
          }
        } else {
          isMatch = true;
          matchedComp = primaryComp;
        }

        const group: TierCompGroup = {
          champKey: g.champKey,
          primaryComp,
          hasVariation,
          comps: g.comps,
          isMatch,
          matchedComp
        };

        map[t].push(group);
      }
    }

    return map;
  });

  function findComp(param: string | null) {
    if (!param) return null;
    const p = param.toLowerCase().trim();
    return data.comps.find((c: any) => {
      if (c.id === param || c.id?.toLowerCase() === p) return true;
      if (c.slug === param || c.slug?.toLowerCase() === p) return true;
      const titleSlug = (c.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      if (titleSlug === p) return true;
      const metaSlug = (c.metaTitle || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      if (metaSlug === p) return true;
      return false;
    }) || null;
  }

  const selectedComp = $derived.by(() => {
    if (!selectedCompId) return null;
    return findComp(selectedCompId);
  });

  function selectComp(comp: any | null) {
    if (!comp) {
      selectedCompId = null;
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('comp');
        history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
      }
      return;
    }

    // Toggle behavior: if already open, clicking it again closes it
    if (selectedCompId === comp.id) {
      selectedCompId = null;
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('comp');
        history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
      }
      return;
    }

    selectedCompId = comp.id;
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const titleSlug = (comp.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      url.searchParams.set('comp', titleSlug || comp.slug || comp.id);
      history.replaceState({}, '', url.pathname + '?' + url.searchParams.toString());

      setTimeout(() => {
        const el = document.getElementById(`comp-detail-${comp.tier}`) || document.getElementById(`tier-${comp.tier}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 60);
    }
  }

  function handlePopState() {
    if (typeof window === 'undefined') return;
    const compParam = new URL(window.location.href).searchParams.get('comp');
    if (compParam) {
      const found = findComp(compParam);
      selectedCompId = found ? found.id : null;
    } else {
      selectedCompId = null;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && selectedCompId) {
      selectComp(null);
    }
  }

  onMount(() => {
    const compParam = new URL(window.location.href).searchParams.get('comp');
    if (compParam) {
      const found = findComp(compParam);
      if (found) {
        selectedCompId = found.id;
        setTimeout(() => {
          const el = document.getElementById(`comp-detail-${found.tier}`) || document.getElementById(`tier-${found.tier}`);
          el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 150);
      }
    }
  });

  const tierStyles: Record<string, {
    borderColor: string;
    boxBg: string;
    textColor: string;
    sublabel: string;
    hasTag?: string;
  }> = {
    S: { borderColor: 'border-[#FE3E4B]', boxBg: 'bg-[#3D0A10]', textColor: 'text-[#FE3E4B]', sublabel: 'BẬC S' },
    A: { borderColor: 'border-[#FF9C00]', boxBg: 'bg-[#3D1A08]', textColor: 'text-[#FF9C00]', sublabel: 'BẬC A' },
    B: { borderColor: 'border-[#FFDD00]', boxBg: 'bg-[#3D3208]', textColor: 'text-[#FFDD00]', sublabel: 'BẬC B' },
    C: { borderColor: 'border-[#63FC0D]', boxBg: 'bg-[#153608]', textColor: 'text-[#63FC0D]', sublabel: 'BẬC C' },
    X: { borderColor: 'border-[#38BDF8]', boxBg: 'bg-[#082936]', textColor: 'text-[#38BDF8]', sublabel: 'BẬC X', hasTag: 'TÌNH HUỐNG (Situational)' }
  };
</script>

<svelte:head>
  {#if selectedComp}
    <title>{selectedComp.title} - Đội Hình {selectedComp.mainCarry?.name_vi || selectedComp.mainCarry?.name_en || ''} ĐTCL Mùa 18 (Bậc {selectedComp.tier}) | TFT Academy VI</title>
    <meta name="title" content="{selectedComp.title} - Đội Hình {selectedComp.mainCarry?.name_vi || selectedComp.mainCarry?.name_en || ''} ĐTCL Mùa 18" />
    <meta name="description" content="Giáo án chi tiết đội hình {selectedComp.title} (Bậc {selectedComp.tier}) ĐTCL Mùa 18. Đầy đủ sơ đồ xếp cờ 28 ô hex, đồ chuẩn BIS, thứ tự nhặt đồ và hướng dẫn từng giai đoạn." />
    <meta property="og:title" content="{selectedComp.title} - Đội Hình ĐTCL Mùa 18 (Bậc {selectedComp.tier})" />
    <meta property="og:description" content="Giáo án chi tiết đội hình {selectedComp.title}: sơ đồ xếp cờ 28 ô hex, đồ chuẩn BIS và mẹo vận hành." />
    <link rel="canonical" href="https://tft.langpn.xyz/tierlist/comps?comp={(selectedComp.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || selectedComp.slug || selectedComp.id}" />
  {:else}
    <title>Bảng Xếp Hạng Đội Hình ĐTCL Mùa 18 (Bản 18.5c) · TFT Academy VI</title>
    <meta name="title" content="Bảng Xếp Hạng Đội Hình ĐTCL Mùa 18 (Bản 18.5c) · TFT Academy VI" />
    <meta name="description" content="Bảng xếp hạng 73 đội hình meta Đấu Trường Chân Lý Mùa 18 chuẩn nhất từ TFT Academy (Dishsoap & Frodan). Đầy đủ vị trí xếp cờ 28 ô, trang bị chuẩn BIS và mẹo vận hành tiếng Việt." />
    <meta property="og:title" content="Bảng Xếp Hạng Đội Hình ĐTCL Mùa 18 (Bản 18.5c) · TFT Academy VI" />
    <meta property="og:description" content="Bảng xếp hạng 73 đội hình meta Đấu Trường Chân Lý Mùa 18 chuẩn nhất từ TFT Academy." />
    <link rel="canonical" href="https://tft.langpn.xyz/tierlist/comps" />
  {/if}
</svelte:head>

<svelte:window onkeydown={handleKeydown} onpopstate={handlePopState} />

<div class="flex flex-col gap-6 pb-24">
  
  <!-- Top Banner: Patch & Title (Matching Screenshot 2 exactly!) -->
  <div class="flex flex-col gap-3">
    <!-- Patch & Update Tag -->
    <div class="flex items-center gap-3 text-xs font-bold">
      <div class="px-3.5 py-1 rounded-full bg-[#161B26] border border-white/10 text-white flex items-center gap-2">
        <span class="text-slate-400">Bản Cập Nhật</span>
        <span class="font-black text-amber-400">18.5c</span>
      </div>

      <a href="https://tftacademy.com/tierlist/updates/comps" target="_blank" class="text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1">
        <span>Cập nhật 13 giờ trước</span>
        <ExternalLink class="w-3 h-3 text-amber-400" />
      </a>
    </div>

    <!-- Stylized Header Title: Gold Crown Logo + COMPS • TIERLIST -->
    <div class="flex items-center gap-3 py-1">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-400/20 shrink-0">
        <span class="font-black text-black text-xl tracking-wider">T</span>
      </div>
      <h1 class="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white flex items-center gap-2" style="font-family: 'Plus Jakarta Sans', sans-serif;">
        <span>COMPS</span>
        <span class="text-amber-400">•</span>
        <span class="text-amber-400">TIERLIST</span>
      </h1>
    </div>
  </div>

  <!-- Subheader Navigation Bar (Matching Screenshot 2 & 6: SvelteKit client-side routing) -->
  <div class="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
    
    <!-- Subnav Tabs (Comps, Items, Augments) -->
    <div class="flex items-center gap-7 text-sm font-bold tracking-tight select-none">
      <a 
        href="/tierlist/comps"
        data-sveltekit-preload-data="hover"
        class="flex items-center gap-2 pb-1.5 transition-all text-amber-400 border-b-2 border-amber-400 font-black cursor-pointer"
      >
        <Flame class="w-4 h-4 fill-current" />
        <span>Đội Hình (Comps)</span>
      </a>

      <a 
        href="/tierlist/items"
        data-sveltekit-preload-data="hover"
        class="flex items-center gap-2 pb-1.5 transition-all text-slate-400 hover:text-white cursor-pointer"
      >
        <Shield class="w-4 h-4" />
        <span>Trang Bị (Items)</span>
      </a>

      <a 
        href="/tierlist/augments"
        data-sveltekit-preload-data="hover"
        class="flex items-center gap-2 pb-1.5 transition-all text-slate-400 hover:text-white cursor-pointer"
      >
        <Sparkles class="w-4 h-4" />
        <span>Lõi Nâng Cấp (Augments)</span>
      </a>
    </div>

    <!-- Right Controls: Multi-Search Bar, Comp Style Dropdown, Set Selector -->
    <div class="flex flex-wrap items-center gap-2.5">
      <!-- Search bar with chips & typeahead (Screenshot 3 & 4) -->
      <TftSearchBar 
        activeFilters={activeFilters}
        onfilterchange={(next) => (activeFilters = next)}
        ontextchange={(txt) => (rawQueryText = txt)}
      />

      <!-- Custom Dropdown for Comp Style (Screenshot 5) -->
      <CustomDropdown 
        options={compStyleOptions}
        selected={selectedStyle}
        onselect={(val) => (selectedStyle = val)}
        title="Lối Chơi ▼"
        variant="pill"
      />

      <!-- Custom Set Selector Dropdown -->
      <CustomDropdown 
        options={setOptions}
        selected={selectedSet}
        onselect={(val) => (selectedSet = val)}
        title="Mùa 18 ▼"
        variant="yellow-pill"
      />
    </div>
  </div>

  <!-- MAIN: COMPS TIERLIST (Exact Replica of TFT Academy: Inline Expandable Panels) -->
  <div class="flex flex-col gap-5">
      {#each tiers as t}
        {@const style = tierStyles[t]}
        {@const groups = tierGroups[t] || []}
        
        {#if groups.length > 0}
          <div id="tier-{t}" class="flex flex-col gap-3 scroll-mt-24">
            
            <!-- Shelf Box Container -->
            <div class="relative rounded-2xl bg-[#090C12] border-2 {style.borderColor} p-2 flex flex-col sm:flex-row items-stretch gap-3 shadow-xl">
              
              <!-- Situational Pill for X Tier -->
              {#if style.hasTag}
                <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-sky-400 text-black font-black text-[10px] tracking-widest uppercase shadow-md">
                  {style.hasTag}
                </div>
              {/if}

              <!-- Left Square Badge (S/A/B/C/X Tier) -->
              <div class="w-16 sm:w-22 shrink-0 rounded-xl {style.boxBg} border {style.borderColor} flex flex-col items-center justify-center p-2.5 text-center select-none">
                <span class="text-3xl sm:text-5xl font-black {style.textColor} leading-none tracking-tight">{t}</span>
                <span class="text-[9px] font-black uppercase tracking-wider text-slate-300 mt-1">{style.sublabel}</span>
              </div>

              <!-- Right Shelf Area: Compact Hexagon Champions (Grouped by Champion carry, NO visible scrollbars) -->
              <div class="{groups.length > 12 ? 'grid grid-rows-2 grid-flow-col auto-cols-max gap-3.5 py-3 px-3 overflow-x-auto overflow-y-hidden scrollbar-none no-scrollbar min-h-[176px] items-center' : 'flex flex-wrap items-center gap-3.5 flex-1 p-3 overflow-visible'}">
                {#each groups as group (group.champKey)}
                  {@const comp = group.primaryComp}
                  {@const isGroupSelected = selectedComp && (selectedComp.id === comp.id || group.comps.some((c: any) => c.id === selectedComp.id))}
                  <!-- Dimming effect when search filter is active, clean highlight for matched comps & active opened comp -->
                  <div 
                    class="relative transition-all duration-200 cursor-pointer select-none group {isGroupSelected ? 'ring-2 ring-amber-400 shadow-xl shadow-amber-400/40 scale-105 rounded-2xl' : isFiltering ? (group.isMatch ? 'opacity-100 scale-105 ring-2 ring-amber-400 shadow-lg shadow-amber-400/25 rounded-2xl' : 'opacity-20 hover:opacity-60') : (group.isMatch ? 'opacity-100 hover:scale-105' : 'opacity-25 hover:opacity-75')}"
                    title="{comp.title} ({comp.mainCarry?.name_vi || comp.mainCarry?.name_en || ''}){group.hasVariation ? ` (+${group.comps.length - 1} biến thể)` : ''}"
                    onclick={() => selectComp(group.matchedComp || comp)}
                    role="button"
                    tabindex="0"
                    onkeydown={(e) => { if (e.key === 'Enter') selectComp(group.matchedComp || comp); }}
                  >
                    {#if group.hasVariation}
                      <!-- Stacked double-hex effect for champion variations (TFT Academy style) -->
                      <div 
                        class="absolute -top-1 -right-1 w-16 h-16 pointer-events-none transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1"
                        aria-hidden="true"
                      >
                        <div class="absolute inset-0 hex-border {costBorderColors[comp.mainCarry?.cost || 4] ?? 'bg-slate-500'} opacity-40 shadow-md"></div>
                        <div class="absolute inset-[3px] hex-clip bg-[#090C14]"></div>
                      </div>

                      <!-- Small variation count pill -->
                      <div class="absolute -bottom-1 -right-1 z-30 px-1 py-0.5 rounded-md bg-black/90 border border-amber-400/60 text-[9px] font-black text-amber-300 flex items-center gap-0.5 shadow-md pointer-events-none">
                        <Layers class="w-2.5 h-2.5 text-amber-400" />
                        <span>{group.comps.length}</span>
                      </div>
                    {/if}

                    <HexAvatar 
                      id={comp.mainCarry?.id}
                      name={comp.mainCarry?.name_en || comp.mainCarry?.name}
                      nameVi={comp.mainCarry?.name_vi || comp.mainCarry?.name_en || comp.mainCarry?.name}
                      iconUrl={comp.mainCarry?.icon}
                      cost={comp.mainCarry?.cost || 4}
                      starLevel={1}
                      showStars={false}
                      items={[]} 
                      showItems={false}
                      trend={comp.trend}
                      sticker={comp.sticker}
                      situationalTier={comp.situationalTier}
                      coreBadges={comp.coreBadges || []}
                      size="md"
                    />

                    <!-- Active downward chevron indicator when this champion is currently expanded below -->
                    {#if isGroupSelected}
                      <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-amber-400 rotate-45 rounded-xs z-40 shadow-md pointer-events-none"></div>
                    {/if}
                  </div>
                {/each}
              </div>

            </div>

            <!-- INLINE DROPDOWN DETAIL PANEL: Expands directly below this shelf row! (Matching TFT Academy exactly) -->
            {#if selectedComp && selectedComp.tier === t}
              <div 
                id="comp-detail-{t}" 
                class="w-full mt-1 rounded-2xl border-2 {style.borderColor} overflow-hidden shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-3"
              >
                <CompDetailPanel 
                  comp={selectedComp} 
                  allComps={data.comps}
                  onclose={() => selectComp(null)} 
                  onselectcomp={(c) => selectComp(c)}
                />
              </div>
            {/if}

          </div>
        {/if}
      {/each}
    </div>

</div>
