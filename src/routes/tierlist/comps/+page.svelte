<script lang="ts">
  import type { PageData } from './$types';
  import HexAvatar from '$components/HexAvatar.svelte';
  import CompDetailPanel from '$components/CompDetailPanel.svelte';
  import CustomDropdown from '$components/CustomDropdown.svelte';
  import TftSearchBar, { type ActiveFilter } from '$components/TftSearchBar.svelte';
  import { resolveItemIcon, resolveAugmentIcon } from '$lib/utils/assets';
  import { Flame, Shield, Sparkles, ExternalLink, Clock, Layers } from 'lucide-svelte';

  let { data }: { data: PageData } = $props();

  // Instant SPA Tab Switcher (0ms switch, zero reload)
  let activeMainTab = $state<'comps' | 'items' | 'augments'>('comps');

  // Comp filters
  let activeFilters = $state<ActiveFilter[]>([]);
  let selectedStyle = $state('ALL');
  let selectedSet = $state('Set 18');
  let selectedCompId = $state<string | null>(null);
  let showDetailModal = $state(false);

  // Item filters
  let activeItemCategory = $state<'craftables' | 'radiants' | 'artifacts' | 'emblems'>('craftables');
  let itemSearchText = $state('');

  // Augment filters
  let activeAugmentTier = $state<'silver' | 'gold' | 'prismatic'>('gold');
  let selectedAugmentStage = $state('All');
  let augmentSearchText = $state('');

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

      // 2. Check multi-filters (units, items, traits, augments)
      let matchSearch = true;
      if (activeFilters.length > 0) {
        matchSearch = activeFilters.every(filter => {
          const fid = filter.id.toLowerCase();
          const fnameVi = filter.nameVi.toLowerCase();
          const fnameEn = filter.nameEn.toLowerCase();

          // Check carry
          if (comp.mainCarry?.id?.toLowerCase().includes(fid) || comp.mainCarry?.name?.toLowerCase().includes(fnameEn) || comp.mainCarry?.nameVi?.toLowerCase().includes(fnameVi)) return true;
          // Check tank
          if (comp.mainTank?.id?.toLowerCase().includes(fid) || comp.mainTank?.name?.toLowerCase().includes(fnameEn) || comp.mainTank?.nameVi?.toLowerCase().includes(fnameVi)) return true;
          // Check board units
          if (comp.board?.some((u: any) => u.id?.toLowerCase().includes(fid) || u.name_en?.toLowerCase().includes(fnameEn) || u.name_vi?.toLowerCase().includes(fnameVi))) return true;
          // Check items on carry or tank
          if (comp.mainCarry?.items?.some((i: any) => i.id?.toLowerCase().includes(fid) || i.name_en?.toLowerCase().includes(fnameEn) || i.name_vi?.toLowerCase().includes(fnameVi))) return true;
          if (comp.mainTank?.items?.some((i: any) => i.id?.toLowerCase().includes(fid) || i.name_en?.toLowerCase().includes(fnameEn) || i.name_vi?.toLowerCase().includes(fnameVi))) return true;
          // Check traits
          if (comp.traits?.some((t: any) => t.name?.toLowerCase().includes(fnameEn) || t.name_vi?.toLowerCase().includes(fnameVi))) return true;
          // Check augments
          if (comp.augments?.some((a: any) => a.id?.toLowerCase().includes(fid) || a.name_en?.toLowerCase().includes(fnameEn) || a.name_vi?.toLowerCase().includes(fnameVi))) return true;
          // Check title
          if (comp.title?.toLowerCase().includes(fnameEn) || comp.title?.toLowerCase().includes(fnameVi)) return true;

          return false;
        });
      }

      const isMatch = matchStyle && matchSearch;
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
        <span>{activeMainTab === 'comps' ? 'COMPS' : activeMainTab === 'items' ? 'ITEMS' : 'AUGMENTS'}</span>
        <span class="text-amber-400">•</span>
        <span class="text-amber-400">TIERLIST</span>
      </h1>
    </div>
  </div>

  <!-- Subheader Navigation Bar (Matching Screenshot 2 & 6: SPA instantaneous tabs) -->
  <div class="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
    
    <!-- Subnav Tabs (Comps, Items, Augments) -->
    <div class="flex items-center gap-7 text-sm font-bold tracking-tight select-none">
      <button 
        type="button"
        onclick={() => (activeMainTab = 'comps')}
        class="flex items-center gap-2 pb-1.5 transition-all cursor-pointer {activeMainTab === 'comps' ? 'text-amber-400 border-b-2 border-amber-400 font-black' : 'text-slate-400 hover:text-white'}"
      >
        <Flame class="w-4 h-4 fill-current" />
        <span>Comps</span>
      </button>

      <button 
        type="button"
        onclick={() => (activeMainTab = 'items')}
        class="flex items-center gap-2 pb-1.5 transition-all cursor-pointer {activeMainTab === 'items' ? 'text-amber-400 border-b-2 border-amber-400 font-black' : 'text-slate-400 hover:text-white'}"
      >
        <Shield class="w-4 h-4" />
        <span>Items</span>
      </button>

      <button 
        type="button"
        onclick={() => (activeMainTab = 'augments')}
        class="flex items-center gap-2 pb-1.5 transition-all cursor-pointer {activeMainTab === 'augments' ? 'text-amber-400 border-b-2 border-amber-400 font-black' : 'text-slate-400 hover:text-white'}"
      >
        <Sparkles class="w-4 h-4" />
        <span>Augments</span>
      </button>
    </div>

    <!-- Right Controls: Multi-Search Bar, Comp Style Dropdown, Set Selector -->
    <div class="flex flex-wrap items-center gap-2.5">
      {#if activeMainTab === 'comps'}
        <!-- Search bar with chips & typeahead (Screenshot 3 & 4) -->
        <TftSearchBar 
          activeFilters={activeFilters}
          onfilterchange={(next) => (activeFilters = next)}
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
      {/if}
    </div>
  </div>

  <!-- MAIN TAB 1: COMPS TIERLIST (Exact Replica of Screenshot 2 & 4) -->
  {#if activeMainTab === 'comps'}
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
                    starLevel={comp.mainCarry?.starLevel || 2}
                    items={[]} 
                    showItems={false}
                    trend={comp.trend}
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

  <!-- MAIN TAB 2: ITEMS TIERLIST (100% Fixed Images & Vietnamese) -->
  {:else if activeMainTab === 'items'}
    {@const currentCategoryData = data.items[activeItemCategory] || {}}

    <div class="flex flex-col gap-6">
      <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-[#0F131C] border border-white/10 shadow-lg">
        <div class="flex items-center gap-1.5 overflow-x-auto p-1 bg-[#161B26] rounded-xl border border-white/5">
          {#each (['craftables', 'radiants', 'artifacts', 'emblems'] as const) as cat}
            <button
              onclick={() => (activeItemCategory = cat)}
              class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap {activeItemCategory === cat ? 'bg-amber-400 text-black shadow-md' : 'text-slate-400 hover:text-white'}"
            >
              {cat === 'craftables' ? 'Đồ Ghép' : cat === 'radiants' ? 'Ánh Sáng' : cat === 'artifacts' ? 'Cổ Vật' : 'Ấn Tộc Hệ'}
            </button>
          {/each}
        </div>

        <div class="relative w-full md:w-72">
          <input 
            type="text" 
            bind:value={itemSearchText}
            placeholder="Tìm kiếm trang bị..."
            class="w-full px-4 py-2 rounded-xl bg-[#161B26] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      <div class="flex flex-col gap-6">
        {#each tiers as t}
          {@const tierItems = (currentCategoryData[t] || []).filter((item: any) => {
            const q = itemSearchText.toLowerCase().trim();
            return !q || item.name_vi?.toLowerCase().includes(q) || item.name_en?.toLowerCase().includes(q);
          })}

          {#if tierItems.length > 0}
            <section class="flex flex-col gap-3">
              <div class="flex items-center gap-3 p-2.5 rounded-xl bg-[#121620] border-l-4 border-amber-400 border-t border-r border-b border-white/5 text-xs font-black">
                <span class="px-2.5 py-0.5 rounded bg-amber-400 text-black">{t} Tier</span>
                <span class="text-slate-400">{tierItems.length} Trang bị</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {#each tierItems as item (item.id || item.name_en)}
                  {@const iconSrc = resolveItemIcon(item.icon, item.id)}
                  <div class="flex items-start gap-3 p-3 rounded-xl bg-[#131722] border border-white/5 hover:border-amber-400/50 transition-all shadow-md">
                    <div class="w-12 h-12 rounded-xl border border-white/10 overflow-hidden bg-black shrink-0 p-0.5 flex items-center justify-center">
                      {#if iconSrc}
                        <img src={iconSrc} alt="" class="w-full h-full object-cover rounded-lg" loading="lazy" />
                      {/if}
                    </div>
                    <div class="flex flex-col flex-1 overflow-hidden">
                      <span class="font-extrabold text-xs text-white truncate">{item.name_vi || item.name_en}</span>
                      <span class="text-[10px] text-slate-400 truncate">{item.name_en}</span>
                      {#if item.desc_vi}
                        <p class="text-[11px] text-slate-300 mt-1 leading-snug line-clamp-2">{item.desc_vi}</p>
                      {/if}
                    </div>
                  </div>
                {/each}
              </div>
            </section>
          {/if}
        {/each}
      </div>
    </div>

  <!-- MAIN TAB 3: AUGMENTS TIERLIST (100% Fixed Images & Vietnamese) -->
  {:else if activeMainTab === 'augments'}
    {@const currentAugmentData = data.augments[activeAugmentTier] || {}}

    <div class="flex flex-col gap-6">
      <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-[#0F131C] border border-white/10 shadow-lg">
        <div class="flex items-center gap-1.5 p-1 bg-[#161B26] rounded-xl border border-white/5">
          {#each (['silver', 'gold', 'prismatic'] as const) as type}
            <button
              onclick={() => (activeAugmentTier = type)}
              class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap {activeAugmentTier === type ? 'bg-amber-400 text-black shadow-md' : 'text-slate-400 hover:text-white'}"
            >
              {type === 'silver' ? 'Lõi Bạc' : type === 'gold' ? 'Lõi Vàng' : 'Lõi Kim Cương'}
            </button>
          {/each}
        </div>

        <div class="flex items-center gap-2">
          <select 
            bind:value={selectedAugmentStage}
            class="px-3 py-1.5 rounded-xl bg-[#161B26] border border-white/10 text-xs font-bold text-amber-400 focus:outline-none cursor-pointer"
          >
            <option value="All">Tất cả Vòng</option>
            <option value="2-1">Vòng 2-1</option>
            <option value="3-2">Vòng 3-2</option>
            <option value="4-2">Vòng 4-2</option>
          </select>

          <input 
            type="text" 
            bind:value={augmentSearchText}
            placeholder="Tìm kiếm lõi..."
            class="px-3 py-1.5 rounded-xl bg-[#161B26] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 w-48"
          />
        </div>
      </div>

      <div class="flex flex-col gap-6">
        {#each tiers as t}
          {@const tierAugments = (currentAugmentData[t] || []).filter((aug: any) => {
            const q = augmentSearchText.toLowerCase().trim();
            const matchQ = !q || aug.name_vi?.toLowerCase().includes(q) || aug.name_en?.toLowerCase().includes(q) || aug.desc_vi?.toLowerCase().includes(q);
            const matchSt = selectedAugmentStage === 'All' || !aug.stage || aug.stage === selectedAugmentStage;
            return matchQ && matchSt;
          })}

          {#if tierAugments.length > 0}
            <section class="flex flex-col gap-3">
              <div class="flex items-center gap-3 p-2.5 rounded-xl bg-[#121620] border-l-4 border-amber-400 border-t border-r border-b border-white/5 text-xs font-black">
                <span class="px-2.5 py-0.5 rounded bg-amber-400 text-black">{t} Tier</span>
                <span class="text-slate-400">{tierAugments.length} Lõi nâng cấp</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {#each tierAugments as aug (aug.id || aug.name_en)}
                  {@const iconSrc = resolveAugmentIcon(aug.icon, aug.id)}
                  <div class="flex items-start gap-3 p-3.5 rounded-xl bg-[#131722] border border-white/5 hover:border-amber-400/50 transition-all shadow-md">
                    <div class="w-12 h-12 rounded-xl border border-white/10 overflow-hidden bg-black shrink-0 p-1 flex items-center justify-center">
                      {#if iconSrc}
                        <img src={iconSrc} alt="" class="w-full h-full object-contain" loading="lazy" />
                      {/if}
                    </div>
                    <div class="flex flex-col flex-1 overflow-hidden">
                      <div class="flex items-center justify-between gap-1">
                        <span class="font-bold text-xs text-white truncate">{aug.name_vi || aug.name_en}</span>
                        {#if aug.stage}
                          <span class="text-[9px] font-black text-amber-400 px-1 py-0.5 rounded bg-black/40">{aug.stage}</span>
                        {/if}
                      </div>
                      <span class="text-[10px] text-slate-400 truncate">{aug.name_en}</span>
                      {#if aug.desc_vi}
                        <p class="text-xs text-slate-300 mt-1 leading-relaxed">{aug.desc_vi}</p>
                      {/if}
                    </div>
                  </div>
                {/each}
              </div>
            </section>
          {/if}
        {/each}
      </div>
    </div>
  {/if}

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
