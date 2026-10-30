<script lang="ts">
  import type { PageData } from './$types';
  import HexAvatar from '$components/HexAvatar.svelte';
  import CompDetailPanel from '$components/CompDetailPanel.svelte';
  import { Search, Flame, Shield, Sparkles, ChevronDown } from 'lucide-svelte';

  let { data }: { data: PageData } = $props();

  let searchQuery = $state('');
  let selectedStyle = $state('ALL');
  let selectedCompId = $state<string | null>(data.foundComp?.id || data.comps[0]?.id || null);
  let showDetailModal = $state(true); // Open immediately when visited by slug

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
    if (!selectedCompId) return null;
    return data.comps.find((c: any) => c.id === selectedCompId || c.slug === selectedCompId) || null;
  });

  function openCompModal(comp: any) {
    selectedCompId = comp.id;
    showDetailModal = true;
  }

  function closeCompModal() {
    showDetailModal = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && showDetailModal) {
      closeCompModal();
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
  <title>{data.foundComp?.title || 'Đội Hình'} · TFT Academy VI</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<div class="flex flex-col gap-6 pb-24">
  <div class="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
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

    <div class="flex flex-wrap items-center gap-3">
      <div class="relative w-48 sm:w-64">
        <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input 
          type="text"
          bind:value={searchQuery}
          placeholder="Tìm đội hình, tướng..."
          class="w-full pl-9 pr-3 py-2 rounded-full bg-[#141824] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-colors shadow-inner"
        />
      </div>

      <div class="relative flex items-center">
        <select 
          bind:value={selectedStyle}
          class="appearance-none px-4 py-2 pr-8 rounded-full bg-[#141824] border border-white/10 text-xs font-bold text-slate-200 cursor-pointer focus:outline-none focus:border-amber-400"
        >
          {#each compStyles as style}
            <option value={style} class="bg-[#141824] text-white">
              {style === 'ALL' ? 'Comp Style ▼' : style}
            </option>
          {/each}
        </select>
        <ChevronDown class="absolute right-3 w-3 h-3 text-slate-400 pointer-events-none" />
      </div>

      <a 
        href="/tierlist/comps"
        class="px-4 py-2 rounded-full bg-amber-400 text-black text-xs font-black tracking-wider shadow-md"
      >
        Set 18 ▼
      </a>
    </div>
  </div>

  <div class="flex flex-col gap-5">
    {#each tiers as t}
      {@const style = tierStyles[t]}
      {@const tierComps = filteredComps.filter((c: any) => c.tier === t)}
      
      {#if tierComps.length > 0}
        <div class="relative rounded-2xl bg-[#090C12] border-2 {style.borderColor} p-2.5 flex flex-col sm:flex-row items-stretch gap-3 shadow-xl">
          {#if style.hasTag}
            <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-sky-400 text-black font-black text-[10px] tracking-widest uppercase shadow-md">
              {style.hasTag}
            </div>
          {/if}

          <div class="w-16 sm:w-22 shrink-0 rounded-xl {style.boxBg} border {style.borderColor} flex flex-col items-center justify-center p-3 text-center select-none">
            <span class="text-3xl sm:text-5xl font-black {style.textColor} leading-none tracking-tight">{t}</span>
            <span class="text-[9px] font-black uppercase tracking-wider text-slate-300 mt-1.5">{style.sublabel}</span>
          </div>

          <div class="flex flex-wrap items-center gap-3.5 flex-1 p-2 overflow-x-auto">
            {#each tierComps as comp (comp.id)}
              <div 
                class="relative transition-transform duration-150 hover:scale-110 cursor-pointer"
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
                  onclick={() => openCompModal(comp)}
                />
              </div>
            {/each}
          </div>
        </div>
      {/if}
    {/each}
  </div>

  {#if showDetailModal && selectedComp}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div 
      class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onclick={closeCompModal}
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
        <CompDetailPanel comp={selectedComp} onclose={closeCompModal} />
      </div>
    </div>
  {/if}
</div>
