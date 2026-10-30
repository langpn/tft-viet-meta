<script lang="ts">
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
  let selectedCompId = $state<string | null>(null);
  let showDetailModal = $state(false);

  const compStyleOptions = [
    { value: 'ALL', label: 'Comp Style' },
    { value: 'Show All', label: 'Show All' },
    { value: '1-Cost Reroll', label: '1-Cost Reroll' },
    { value: '2-Cost Reroll', label: '2-Cost Reroll' },
    { value: '3-Cost Reroll', label: '3-Cost Reroll' },
    { value: '4-Cost Fast 8', label: '4-Cost Fast 8' },
    { value: 'Fast 9', label: 'Fast 9' },
    { value: 'Lose Streak', label: 'Lose Streak' }
  ];

  const setOptions = [
    { value: 'Set 18', label: 'Set 18' },
    { value: 'Set 17', label: 'Set 17' }
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
        const inCarry = matchesQuery(comp.mainCarry?.name, q) || matchesQuery(comp.mainCarry?.nameVi, q);
        const inTank = matchesQuery(comp.mainTank?.name, q) || matchesQuery(comp.mainTank?.nameVi, q);
        const inBoard = comp.board?.some((u: any) => matchesQuery(u.name_en, q) || matchesQuery(u.name_vi, q));
        const inItems = comp.mainCarry?.items?.some((i: any) => matchesQuery(i.name_en, q) || matchesQuery(i.name_vi, q)) ||
                        comp.mainTank?.items?.some((i: any) => matchesQuery(i.name_en, q) || matchesQuery(i.name_vi, q));
        const inTraits = comp.traits?.some((t: any) => matchesQuery(t.name, q) || matchesQuery(t.name_vi, q));
        const inAugs = comp.augments?.some((a: any) => matchesQuery(a.name_en, q) || matchesQuery(a.name_vi, q));
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
          if (matchesQuery(comp.mainCarry?.id, fid) || matchesQuery(comp.mainCarry?.name, fnameEn) || matchesQuery(comp.mainCarry?.nameVi, fnameVi)) return true;
          // Check tank
          if (matchesQuery(comp.mainTank?.id, fid) || matchesQuery(comp.mainTank?.name, fnameEn) || matchesQuery(comp.mainTank?.nameVi, fnameVi)) return true;
          // Check board units
          if (comp.board?.some((u: any) => matchesQuery(u.id, fid) || matchesQuery(u.name_en, fnameEn) || matchesQuery(u.name_vi, fnameVi))) return true;
          // Check items on carry or tank
          if (comp.mainCarry?.items?.some((i: any) => matchesQuery(i.id, fid) || matchesQuery(i.name_en, fnameEn) || matchesQuery(i.name_vi, fnameVi))) return true;
          if (comp.mainTank?.items?.some((i: any) => matchesQuery(i.id, fid) || matchesQuery(i.name_en, fnameEn) || matchesQuery(i.name_vi, fnameVi))) return true;
          // Check traits
          if (comp.traits?.some((t: any) => matchesQuery(t.name, fnameEn) || matchesQuery(t.name_vi, fnameVi))) return true;
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

  const selectedComp = $derived.by(() => {
    if (!selectedCompId) return null;
    return data.comps.find((c: any) => c.id === selectedCompId || c.slug === selectedCompId) || null;
  });

  function openModal(comp: any) {
    selectedCompId = comp.id;
    showDetailModal = true;
  }

  function closeModal() {
    showDetailModal = false;
    selectedCompId = null;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && showDetailModal) {
      closeModal();
    }
  }

  const tiers = ['S', 'A', 'B', 'C', 'X'];

  const tierStyles: Record<string, {
    borderColor: string;
    boxBg: string;
    textColor: string;
    sublabel: string;
    hasTag?: string;
  }> = {
    S: { borderColor: 'border-[#FE3E4B]', boxBg: 'bg-[#3D0A10]', textColor: 'text-[#FE3E4B]', sublabel: 'S TIER' },
    A: { borderColor: 'border-[#FF9C00]', boxBg: 'bg-[#3D1A08]', textColor: 'text-[#FF9C00]', sublabel: 'A TIER' },
    B: { borderColor: 'border-[#FFDD00]', boxBg: 'bg-[#3D3208]', textColor: 'text-[#FFDD00]', sublabel: 'B TIER' },
    C: { borderColor: 'border-[#63FC0D]', boxBg: 'bg-[#153608]', textColor: 'text-[#63FC0D]', sublabel: 'C TIER' },
    X: { borderColor: 'border-[#38BDF8]', boxBg: 'bg-[#082936]', textColor: 'text-[#38BDF8]', sublabel: 'X TIER', hasTag: 'SITUATIONAL' }
  };
</script>

<svelte:head>
  <title>TFT Academy · Bảng Xếp Hạng Đội Hình, Trang Bị, Lõi Nâng Cấp (Set 18)</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<div class="flex flex-col gap-6 pb-24">
  
  <!-- Top Banner: Patch & Title (Matching Screenshot 2 exactly!) -->
  <div class="flex flex-col gap-3">
    <!-- Patch & Update Tag -->
    <div class="flex items-center gap-3 text-xs font-bold">
      <div class="px-3.5 py-1 rounded-full bg-[#161B26] border border-white/10 text-white flex items-center gap-2">
        <span class="text-slate-400">Patch</span>
        <span class="font-black text-amber-400">18.5c</span>
      </div>

      <a href="https://tftacademy.com/tierlist/updates/comps" target="_blank" class="text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1">
        <span>Last Updated 13 Hours Ago</span>
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
        <span>Comps</span>
      </a>

      <a 
        href="/tierlist/items"
        data-sveltekit-preload-data="hover"
        class="flex items-center gap-2 pb-1.5 transition-all text-slate-400 hover:text-white cursor-pointer"
      >
        <Shield class="w-4 h-4" />
        <span>Items</span>
      </a>

      <a 
        href="/tierlist/augments"
        data-sveltekit-preload-data="hover"
        class="flex items-center gap-2 pb-1.5 transition-all text-slate-400 hover:text-white cursor-pointer"
      >
        <Sparkles class="w-4 h-4" />
        <span>Augments</span>
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
        title="Comp Style ▼"
        variant="pill"
      />

      <!-- Custom Set Selector Dropdown -->
      <CustomDropdown 
        options={setOptions}
        selected={selectedSet}
        onselect={(val) => (selectedSet = val)}
        title="Set 18 ▼"
        variant="yellow-pill"
      />
    </div>
  </div>

  <!-- MAIN: COMPS TIERLIST (Exact Replica of Screenshot 2 & 4) -->
  <div class="flex flex-col gap-4">
      {#each tiers as t}
        {@const style = tierStyles[t]}
        {@const tierCompEntries = compsWithMatchStatus.filter(({ comp }) => comp.tier === t)}
        
        {#if tierCompEntries.length > 0}
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

            <!-- Right Shelf Area: Compact Hexagon Champions (NO items glued on shelf!) -->
            <div class="flex flex-wrap items-center gap-3 flex-1 p-2 overflow-x-auto">
              {#each tierCompEntries as { comp, isMatch } (comp.id)}
                <!-- Dimming effect when search filter is active (Screenshot 4) -->
                <div 
                  class="relative transition-all duration-200 cursor-pointer {isMatch ? 'opacity-100 hover:scale-110' : 'opacity-25 hover:opacity-75'}"
                  title="{comp.title} ({comp.mainCarry?.nameVi || comp.mainCarry?.name || ''})"
                >
                  <HexAvatar 
                    id={comp.mainCarry?.id}
                    name={comp.mainCarry?.name}
                    nameVi={comp.mainCarry?.nameVi}
                    iconUrl={comp.mainCarry?.iconUrl}
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
                    onclick={() => openModal(comp)}
                  />
                </div>
              {/each}
            </div>

          </div>
        {/if}
      {/each}
    </div>



  <!-- FLOATING POPUP / OVERLAY MODAL FOR COMP DETAILS -->
  {#if showDetailModal && selectedComp}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div 
      class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onclick={closeModal}
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <div 
        class="relative w-full max-w-5xl my-auto animate-in zoom-in-95 duration-200"
        onclick={(e) => e.stopPropagation()}
        role="document"
      >
        <CompDetailPanel comp={selectedComp} onclose={closeModal} />
      </div>
    </div>
  {/if}

</div>
