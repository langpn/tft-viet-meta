<script lang="ts">
  import type { PageData } from './$types';
  import HexAvatar from '$components/HexAvatar.svelte';
  import { matchesQuery } from '$lib/utils/search';
  import { Sparkles, Wand2, Users, Flame, Shield, Search } from 'lucide-svelte';

  let { data }: { data: PageData } = $props();

  let activeTab = $state<'wisps' | 'champions' | 'traits' | 'augments'>('wisps');
  let selectedWispCategory = $state('All');
  let searchQuery = $state('');

  const wispCategories = ['All', 'Combat', 'Champion', 'Shop', 'Gold', 'XP', 'Risky', 'Item'];

  const filteredWisps = $derived.by(() => {
    return (data.newSet.wisps || []).filter((w: any) => {
      const matchQuery = matchesQuery(w.name_vi, searchQuery) || 
                         matchesQuery(w.name_en, searchQuery) || 
                         matchesQuery(w.desc_vi, searchQuery);
      const matchCategory = selectedWispCategory === 'All' || w.category === selectedWispCategory;
      return matchQuery && matchCategory;
    });
  });

  const filteredChampions = $derived.by(() => {
    return (data.newSet.champions || []).filter((c: any) => {
      return matchesQuery(c.name_vi, searchQuery) || 
             matchesQuery(c.name, searchQuery) || 
             c.traits?.some((t: string) => matchesQuery(t, searchQuery));
    });
  });

  const filteredTraits = $derived.by(() => {
    return (data.newSet.traits || []).filter((t: any) => {
      return matchesQuery(t.name_vi, searchQuery) || 
             matchesQuery(t.name, searchQuery);
    });
  });
</script>

<svelte:head>
  <title>Khám Phá Mùa 18: Enchanted Wilds (Rừng Phép Thuật) · TFT Academy VI</title>
</svelte:head>

<div class="flex flex-col gap-8 pb-16">
  
  <!-- Hero Set 18 Banner -->
  <div class="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-r from-emerald-950/60 via-[#0F131C] to-purple-950/40 p-8 md:p-12 shadow-2xl">
    <div class="relative z-10 flex flex-col gap-4 max-w-3xl">
      <div class="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-emerald-400">
        <Sparkles class="w-4 h-4" />
        <span>MÙA 18 CHÍNH THỨC KHỞI TRANH</span>
      </div>
      <h1 class="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
        TFT Set 18: <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">Enchanted Wilds</span>
      </h1>
      <p class="text-slate-300 text-sm md:text-base leading-relaxed">
        Bước vào vùng đất cổ xưa nơi các Linh Linh (Wisps) ma thuật xuất hiện tại cửa hàng, mang lại các hiệu ứng chiến đấu, đột phá kinh tế và phần thưởng rủi ro cao.
      </p>
    </div>
  </div>

  <!-- Navigation Tabs & Search Controls -->
  <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-[#0F131C] border border-white/10 shadow-lg">
    <div class="flex items-center gap-1.5 overflow-x-auto p-1 bg-[#161B26] rounded-xl border border-white/5">
      <button
        onclick={() => (activeTab = 'wisps')}
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap {activeTab === 'wisps' ? 'bg-amber-400 text-black shadow-md' : 'text-slate-400 hover:text-white'}"
      >
        <Wand2 class="w-4 h-4" />
        <span>Linh Linh (Wisps)</span>
      </button>

      <button
        onclick={() => (activeTab = 'champions')}
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap {activeTab === 'champions' ? 'bg-amber-400 text-black shadow-md' : 'text-slate-400 hover:text-white'}"
      >
        <Users class="w-4 h-4" />
        <span>Tướng Mới ({data.newSet.champions?.length || 0})</span>
      </button>

      <button
        onclick={() => (activeTab = 'traits')}
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap {activeTab === 'traits' ? 'bg-amber-400 text-black shadow-md' : 'text-slate-400 hover:text-white'}"
      >
        <Shield class="w-4 h-4" />
        <span>Tộc Hệ ({data.newSet.traits?.length || 0})</span>
      </button>
    </div>

    <!-- Search Input -->
    <div class="relative w-full md:w-72">
      <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input 
        type="text" 
        bind:value={searchQuery}
        placeholder="Tìm kiếm nội dung Mùa 18..."
        class="w-full pl-10 pr-4 py-2 rounded-xl bg-[#161B26] border border-white/5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
      />
    </div>
  </div>

  <!-- Content Sections -->
  {#if activeTab === 'wisps'}
    <!-- Wisps Section -->
    <div class="flex flex-col gap-6">
      
      <!-- Wisps Category Selector -->
      <div class="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-[#121620] border border-white/5 text-xs">
        <span class="text-slate-400 mr-2 font-bold">Phân loại:</span>
        {#each wispCategories as cat}
          <button
            onclick={() => (selectedWispCategory = cat)}
            class="px-3 py-1 rounded-lg font-bold transition-all cursor-pointer {selectedWispCategory === cat ? 'bg-emerald-500 text-black' : 'bg-black/40 text-slate-300 hover:text-white'}"
          >
            {cat}
          </button>
        {/each}
      </div>

      <!-- Wisps Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {#each filteredWisps as wisp (wisp.id || wisp.name_en)}
          <div class="flex flex-col justify-between p-3.5 rounded-xl bg-[#121620] border border-white/5 hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all">
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center justify-between gap-2">
                <span class="font-extrabold text-sm text-white">{wisp.name_vi || wisp.name_en}</span>
                <span class="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-black">
                  {wisp.cost}V
                </span>
              </div>
              <span class="text-[11px] text-slate-400">{wisp.name_en} • <b class="text-emerald-400">{wisp.category}</b></span>
              {#if wisp.desc_vi}
                <p class="text-xs text-slate-300 mt-1 leading-relaxed">{wisp.desc_vi}</p>
              {/if}
            </div>
            {#if wisp.rules}
              <div class="mt-2 pt-2 border-t border-white/5 text-[10px] text-slate-400 italic">
                {wisp.rules}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>

  {:else if activeTab === 'champions'}
    <!-- Champions Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {#each filteredChampions as champ (champ.name)}
        <div class="flex flex-col p-4 rounded-xl bg-[#121620] border border-white/5 hover:border-amber-400/40 transition-all gap-3">
          <div class="flex items-center gap-3">
            <HexAvatar 
              name={champ.name}
              nameVi={champ.name_vi}
              iconUrl={champ.icon}
              cost={champ.cost}
              size="md"
            />
            <div class="flex flex-col">
              <span class="font-black text-base text-white">{champ.name_vi || champ.name}</span>
              <span class="text-xs text-slate-400">Giá: {champ.cost} Vàng</span>
            </div>
          </div>

          <!-- Traits -->
          <div class="flex flex-wrap gap-1">
            {#each (champ.traits || []) as trait}
              <span class="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-[10px] font-semibold text-amber-300">
                {trait}
              </span>
            {/each}
          </div>

          <!-- Ability -->
          {#if champ.abilityName}
            <div class="flex flex-col gap-1 p-2.5 rounded-lg bg-black/40 border border-white/5 text-xs">
              <div class="flex items-center justify-between font-bold text-amber-400">
                <span>{champ.abilityName}</span>
                {#if champ.abilityMana}
                  <span class="text-[11px] text-sky-400">💧 {champ.abilityMana}</span>
                {/if}
              </div>
              <p class="text-[11px] text-slate-300 leading-snug line-clamp-3">{champ.ability}</p>
            </div>
          {/if}
        </div>
      {/each}
    </div>

  {:else if activeTab === 'traits'}
    <!-- Traits Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      {#each filteredTraits as trait (trait.name)}
        <div class="flex flex-col p-4.5 rounded-xl bg-[#121620] border border-white/5 gap-3">
          <div class="flex items-center justify-between border-b border-white/5 pb-2">
            <div class="flex items-center gap-2">
              <span class="font-black text-lg text-white">{trait.name_vi || trait.name}</span>
              {#if trait.name_vi && trait.name_vi !== trait.name}
                <span class="text-xs text-slate-400">({trait.name})</span>
              {/if}
            </div>
            {#if trait.breakpoints}
              <div class="flex gap-1">
                {#each trait.breakpoints as bp}
                  <span class="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold text-xs">
                    {bp}
                  </span>
                {/each}
              </div>
            {/if}
          </div>

          {#if trait.desc_vi || trait.description}
            <p class="text-xs text-slate-300 leading-relaxed">{trait.desc_vi || trait.description}</p>
          {/if}
        </div>
      {/each}
    </div>
  {/if}

</div>
