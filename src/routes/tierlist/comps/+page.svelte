<script lang="ts">
  import type { PageData } from './$types';
  import HexAvatar from '$components/HexAvatar.svelte';
  import CompDetailPanel from '$components/CompDetailPanel.svelte';
  import { Search, Flame, Shield, Sparkles, SlidersHorizontal, ChevronDown, Check } from 'lucide-svelte';

  let { data }: { data: PageData } = $props();

  let searchQuery = $state('');
  let selectedStyle = $state('ALL');
  let selectedSet = $state('Set 18');
  let selectedCompId = $state<string>(data.comps[0]?.id || '');

  const compStyles = [
    'ALL',
    'Fast 9',
    '4-Cost Fast 8',
    '3-Cost Reroll',
    '2-Cost Reroll',
    '1-Cost Reroll',
    'Standard'
  ];

  const filteredComps = $derived.by(() => {
    return data.comps.filter((c: any) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        c.title.toLowerCase().includes(q) || 
        (c.metaTitle && c.metaTitle.toLowerCase().includes(q)) ||
        (c.mainCarry?.name && c.mainCarry.name.toLowerCase().includes(q)) ||
        (c.mainCarry?.nameVi && c.mainCarry.nameVi.toLowerCase().includes(q));

      const matchStyle = selectedStyle === 'ALL' || c.compStyle?.toLowerCase().includes(selectedStyle.toLowerCase());
      return matchQuery && matchStyle;
    });
  });

  const selectedComp = $derived.by(() => {
    return data.comps.find((c: any) => c.id === selectedCompId) || filteredComps[0] || data.comps[0];
  });

  const tiers = ['S', 'A', 'B', 'C', 'X'];

  const tierStyles: Record<string, {
    borderColor: string;
    boxBg: string;
    textColor: string;
    sublabel: string;
    hasTag?: string;
  }> = {
    S: {
      borderColor: 'border-[#FE3E4B]',
      boxBg: 'bg-[#400A10]',
      textColor: 'text-[#FE3E4B]',
      sublabel: 'S TIER'
    },
    A: {
      borderColor: 'border-[#FF9C00]',
      boxBg: 'bg-[#401C08]',
      textColor: 'text-[#FF9C00]',
      sublabel: 'A TIER'
    },
    B: {
      borderColor: 'border-[#FFDD00]',
      boxBg: 'bg-[#403508]',
      textColor: 'text-[#FFDD00]',
      sublabel: 'B TIER'
    },
    C: {
      borderColor: 'border-[#63FC0D]',
      boxBg: 'bg-[#183A08]',
      textColor: 'text-[#63FC0D]',
      sublabel: 'C TIER'
    },
    X: {
      borderColor: 'border-[#38BDF8]',
      boxBg: 'bg-[#082E3D]',
      textColor: 'text-[#38BDF8]',
      sublabel: 'X TIER',
      hasTag: 'SITUATIONAL'
    }
  };
</script>

<svelte:head>
  <title>TFT Academy · Meta Comps Tier List (Set 18)</title>
</svelte:head>

<div class="flex flex-col gap-6 pb-20">
  
  <!-- Subheader Navigation Bar (Matching TFT Academy exactly) -->
  <div class="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
    
    <!-- Left Navigation Tabs: Comps, Items, Augments -->
    <div class="flex items-center gap-6 text-sm font-bold tracking-tight">
      <a href="/tierlist/comps" class="text-amber-400 border-b-2 border-amber-400 pb-1 flex items-center gap-1.5">
        <Flame class="w-4 h-4" />
        <span>Comps</span>
      </a>
      <a href="/tierlist/items" class="text-slate-400 hover:text-white pb-1 transition-colors flex items-center gap-1.5">
        <Shield class="w-4 h-4" />
        <span>Items</span>
      </a>
      <a href="/tierlist/augments" class="text-slate-400 hover:text-white pb-1 transition-colors flex items-center gap-1.5">
        <Sparkles class="w-4 h-4" />
        <span>Augments</span>
      </a>
    </div>

    <!-- Right Controls: Search, Comp Style, Set Selector -->
    <div class="flex flex-wrap items-center gap-3">
      <!-- Search Input -->
      <div class="relative w-44 sm:w-56">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input 
          type="text"
          bind:value={searchQuery}
          placeholder="Search..."
          class="w-full pl-8 pr-3 py-1.5 rounded-full bg-[#141824] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-colors"
        />
      </div>

      <!-- Comp Style Dropdown -->
      <div class="relative flex items-center">
        <select 
          bind:value={selectedStyle}
          class="appearance-none px-3.5 py-1.5 pr-8 rounded-full bg-[#141824] border border-white/10 text-xs font-bold text-slate-200 cursor-pointer focus:outline-none focus:border-amber-400"
        >
          {#each compStyles as style}
            <option value={style} class="bg-[#141824] text-white">
              {style === 'ALL' ? 'Comp Style ▼' : style}
            </option>
          {/each}
        </select>
        <ChevronDown class="absolute right-2.5 w-3 h-3 text-slate-400 pointer-events-none" />
      </div>

      <!-- Set Selector (Yellow Active Pill) -->
      <button 
        type="button"
        class="px-3.5 py-1.5 rounded-full bg-amber-400 text-black text-xs font-black tracking-wider cursor-pointer hover:bg-amber-300 transition-colors"
      >
        Set 18 ▼
      </button>
    </div>
  </div>

  <!-- The 5 Horizontal Tier Shelves (S, A, B, C, X) -->
  <div class="flex flex-col gap-4">
    {#each tiers as t}
      {@const style = tierStyles[t]}
      {@const tierComps = filteredComps.filter((c: any) => c.tier === t)}
      
      {#if tierComps.length > 0}
        <div class="relative rounded-2xl bg-[#090C12] border-2 {style.borderColor} p-2 flex flex-col sm:flex-row items-stretch gap-3">
          
          <!-- Situational Pill for X Tier -->
          {#if style.hasTag}
            <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-teal-500 text-black font-black text-[10px] tracking-widest uppercase shadow">
              {style.hasTag}
            </div>
          {/if}

          <!-- Left Square Badge -->
          <div class="w-16 sm:w-20 shrink-0 rounded-xl {style.boxBg} border {style.borderColor} flex flex-col items-center justify-center p-2 text-center select-none">
            <span class="text-3xl sm:text-4xl font-black {style.textColor} leading-none tracking-tight">
              {t}
            </span>
            <span class="text-[9px] font-black uppercase tracking-wider text-slate-300 mt-1">
              {style.sublabel}
            </span>
          </div>

          <!-- Right Area: Horizontal Row of Hexagon Comp Avatars -->
          <div class="flex flex-wrap items-center gap-2.5 flex-1 p-2 overflow-x-auto">
            {#each tierComps as comp (comp.id)}
              {@const isSelected = selectedComp?.id === comp.id}
              
              <div 
                class="relative transition-transform duration-150 {isSelected ? 'ring-2 ring-amber-400 rounded-full scale-105' : 'hover:scale-105'}"
                title="{comp.title} ({comp.mainCarry?.nameVi || comp.mainCarry?.name || ''})"
              >
                <HexAvatar 
                  id={comp.mainCarry?.id}
                  name={comp.mainCarry?.name}
                  nameVi={comp.mainCarry?.nameVi}
                  iconUrl={comp.mainCarry?.iconUrl}
                  cost={comp.mainCarry?.cost || 4}
                  starLevel={comp.mainCarry?.starLevel || 2}
                  items={comp.mainCarry?.items}
                  trend={comp.trend}
                  size="md"
                  isSelected={isSelected}
                  onclick={() => (selectedCompId = comp.id)}
                />
              </div>
            {/each}
          </div>

        </div>
      {/if}
    {/each}
  </div>

  <!-- Selected Comp Detail Split Panel (Matches Bottom Area of Screenshot) -->
  {#if selectedComp}
    <div class="flex flex-col gap-2">
      <div class="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5 px-1">
        <Sparkles class="w-4 h-4" />
        <span>Chi Tiết Giáo Án Đang Chọn: {selectedComp.title}</span>
      </div>
      
      <CompDetailPanel comp={selectedComp} />
    </div>
  {/if}

</div>
