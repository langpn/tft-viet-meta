<script lang="ts">
  import type { PageData } from './$types';
  import HexAvatar from '$components/HexAvatar.svelte';
  import SeasonLinks from '$components/SeasonLinks.svelte';
  import { matchesQuery } from '$lib/utils/search';
  import { Sparkles, Wand2, Users, Flame, Shield, Search } from 'lucide-svelte';

  let { data }: { data: PageData } = $props();
  let title = $derived(`Khám Phá Mùa ${data.set}: ${data.setName} · TFT Academy VI`);
  let description = $derived(`Thông tin ĐTCL Mùa ${data.set}, gồm ${data.newSet.champions.length} tướng, ${data.newSet.traits.length} tộc hệ và ${data.newSet.augments.length} lõi nâng cấp.`);
  let hasWisps = $derived(data.newSet.wisps.length > 0);
  let canonical = $derived(`https://tft.langpn.xyz/learn/new-set${data.set === 18 ? '?set=18' : ''}`);

  let activeTab = $state<'wisps' | 'champions' | 'traits'>('wisps');
  let selectedWispCategory = $state('All');
  let searchQuery = $state('');

  const wispCategories = ['All', 'Combat', 'Champion', 'Shop', 'Gold', 'XP', 'Risky', 'Item'];
  const wispCategoryLabels: Record<string, string> = {
    All: 'Tất cả',
    Combat: 'Giao tranh',
    Champion: 'Tướng',
    Shop: 'Cửa hàng',
    Gold: 'Kinh tế',
    XP: 'Kinh nghiệm',
    Risky: 'Rủi ro',
    Item: 'Trang bị'
  };

  const filteredWisps = $derived.by(() => {
    return data.newSet.wisps.filter((w) => {
      const matchQuery = matchesQuery(w.name_vi, searchQuery) || 
                         matchesQuery(w.name_en, searchQuery) || 
                         matchesQuery(w.desc_vi || w.desc_en, searchQuery);
      const matchCategory = selectedWispCategory === 'All' || w.category === selectedWispCategory;
      return matchQuery && matchCategory;
    });
  });

  const filteredChampions = $derived.by(() => {
    return data.newSet.champions.filter((c) => {
      return matchesQuery(c.name_vi, searchQuery) || 
             matchesQuery(c.name_en, searchQuery) ||
             c.traits.some((t) => matchesQuery(t.name_vi, searchQuery) || matchesQuery(t.name_en, searchQuery));
    });
  });

  const filteredTraits = $derived.by(() => {
    return data.newSet.traits.filter((t) => {
      return matchesQuery(t.name_vi, searchQuery) || 
             matchesQuery(t.name_en, searchQuery);
    });
  });
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonical} />
  <link rel="canonical" href={canonical} />
</svelte:head>

<div class="flex flex-col gap-8 pb-16" data-tft-set={data.set}>
  
  <!-- Hero Set 18 Banner -->
  <div class="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-r from-emerald-950/60 via-[#0F131C] to-purple-950/40 p-8 md:p-12 shadow-2xl">
    <div class="relative z-10 flex flex-col gap-4 max-w-3xl">
      <SeasonLinks set={data.set} patch={data.patch} path="/learn/new-set" />
      <h1 class="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
        TFT Set {data.set}: <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">{data.setName}</span>
      </h1>
      <p class="text-slate-300 text-sm md:text-base leading-relaxed">
        {#if hasWisps}
          Bước vào vùng đất cổ xưa nơi các Linh Linh (Wisps) ma thuật xuất hiện tại cửa hàng, mang lại các hiệu ứng chiến đấu, đột phá kinh tế và phần thưởng rủi ro cao.
        {:else}
          Tướng và tộc hệ trong Prismatic Tour. <a href="https://tftacademy.com/learn/new-set" class="text-amber-400 hover:underline">Xem tổng quan tại TFT Academy</a>.
        {/if}
      </p>
    </div>
  </div>

  <!-- Navigation Tabs & Search Controls -->
  <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-[#0F131C] border border-white/10 shadow-lg">
    <div class="flex items-center gap-1.5 overflow-x-auto p-1 bg-[#161B26] rounded-xl border border-white/5">
      {#if hasWisps}<button
        onclick={() => (activeTab = 'wisps')}
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap {activeTab === 'wisps' ? 'bg-amber-400 text-black shadow-md' : 'text-slate-400 hover:text-white'}"
      >
        <Wand2 class="w-4 h-4" />
        <span>Linh Linh (Wisps)</span>
      </button>{/if}

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
        placeholder={`Tìm kiếm nội dung Mùa ${data.set}...`}
        class="w-full pl-10 pr-4 py-2 rounded-xl bg-[#161B26] border border-white/5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
      />
    </div>
  </div>

  <!-- Content Sections -->
  {#if activeTab === 'wisps' && hasWisps}
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
            {wispCategoryLabels[cat] || cat}
          </button>
        {/each}
      </div>

      <!-- Wisps Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {#each filteredWisps as wisp (wisp.name_en)}
          <div class="flex flex-col justify-between p-3.5 rounded-xl bg-[#121620] border border-white/5 hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all">
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center justify-between gap-2">
                <span class="font-extrabold text-sm text-white">{wisp.name_vi || wisp.name_en}</span>
                <span class="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-black">
                  {wisp.cost}V
                </span>
              </div>
              <span class="text-[11px] text-slate-400">{wisp.name_en} • <b class="text-emerald-400">{wisp.category}</b></span>
              {#if wisp.desc_vi || wisp.desc_en}
                <p class="text-xs text-slate-300 mt-1 leading-relaxed">{wisp.desc_vi || wisp.desc_en}</p>
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

  {:else if activeTab !== 'traits'}
    <!-- Champions Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {#each filteredChampions as champ (champ.id)}
        <div class="flex flex-col p-4 rounded-xl bg-[#121620] border border-white/5 hover:border-amber-400/40 transition-all gap-3">
          <div class="flex items-center gap-3">
            <HexAvatar 
              id={champ.id}
              name={champ.name_en}
              nameVi={champ.name_vi}
              iconUrl={champ.icon}
              cost={champ.cost}
              size="md"
            />
            <div class="flex flex-col">
              <span class="font-black text-base text-white">{champ.name_vi || champ.name_en}</span>
              <span class="text-xs text-slate-400">Giá: {champ.cost} Vàng</span>
            </div>
          </div>

          <!-- Traits -->
          <div class="flex flex-wrap gap-1">
            {#each (champ.traits || []) as trait}
              <span class="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-[10px] font-semibold text-amber-300">
                {trait.name_vi || trait.name_en}
              </span>
            {/each}
          </div>

          <!-- Ability -->
          {#if champ.abilityName}
            <div class="flex flex-col gap-1 p-2.5 rounded-lg bg-black/40 border border-white/5 text-xs">
              <div class="flex items-center justify-between font-bold text-amber-400">
                <span lang={'abilityNameVi' in champ && champ.abilityNameVi ? 'vi' : 'en'}>{'abilityNameVi' in champ && champ.abilityNameVi ? champ.abilityNameVi : champ.abilityName}</span>
                {#if champ.abilityMana}
                  <span class="text-[11px] text-sky-400">💧 {champ.abilityMana}</span>
                {/if}
              </div>
              <p lang={champ.desc_vi && champ.desc_vi !== champ.ability ? 'vi' : 'en'} class="text-[11px] text-slate-300 leading-snug line-clamp-3">{champ.desc_vi || champ.ability}</p>
            </div>
          {/if}
        </div>
      {/each}
    </div>

  {:else if activeTab === 'traits'}
    <!-- Traits Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      {#each filteredTraits as trait (trait.id)}
        <div class="flex flex-col p-4.5 rounded-xl bg-[#121620] border border-white/5 gap-3">
          <div class="flex items-center justify-between border-b border-white/5 pb-2">
            <div class="flex items-center gap-2">
              <span class="font-black text-lg text-white">{trait.name_vi || trait.name_en}</span>
              {#if trait.name_vi && trait.name_vi !== trait.name_en}
                <span class="text-xs text-slate-400">({trait.name_en})</span>
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

          {#if trait.desc_vi || trait.desc_en}
            <p lang={trait.desc_vi && trait.desc_vi !== trait.desc_en ? 'vi' : 'en'} class="text-xs text-slate-300 leading-relaxed">{trait.desc_vi || trait.desc_en}</p>
          {/if}
        </div>
      {/each}
    </div>
  {/if}

</div>
