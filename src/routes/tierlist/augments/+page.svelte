<script lang="ts">
  import type { PageData } from './$types';
  import { resolveAugmentIcon } from '$lib/utils/assets';
  import { Sparkles, Search, Clock } from 'lucide-svelte';

  let { data }: { data: PageData } = $props();

  let activeTierType = $state<'silver' | 'gold' | 'prismatic'>('gold');
  let selectedStage = $state<string>('All');
  let searchQuery = $state('');

  const tierTypeLabels = {
    silver: 'Lõi Bạc (Bậc 1)',
    gold: 'Lõi Vàng (Bậc 2)',
    prismatic: 'Lõi Kim Cương (Bậc 3)'
  };

  const stages = ['All', '2-1', '3-2', '4-2'];
  const tiers = ['S', 'A', 'B', 'C', 'D'];

  const currentTierData = $derived(data.augments[activeTierType] || {});

  const tierMeta: Record<string, { label: string; badge: string; border: string }> = {
    S: { label: 'S Tier', badge: 'bg-[#FE3E4B] text-white', border: 'border-[#FE3E4B]/40' },
    A: { label: 'A Tier', badge: 'bg-[#FF9C00] text-white', border: 'border-[#FF9C00]/40' },
    B: { label: 'B Tier', badge: 'bg-[#FFDD00] text-black font-black', border: 'border-[#FFDD00]/40' },
    C: { label: 'C Tier', badge: 'bg-[#63FC0D] text-black font-black', border: 'border-[#63FC0D]/40' },
    D: { label: 'D Tier', badge: 'bg-slate-600 text-white', border: 'border-slate-600/40' }
  };
</script>

<svelte:head>
  <title>Bảng Xếp Hạng Lõi Nâng Cấp TFT (Mùa 18) · TFT Academy VI</title>
</svelte:head>

<div class="flex flex-col gap-6 pb-20">
  
  <!-- Tier Selector & Stage Filter & Search Bar -->
  <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0F131C] border border-white/10 shadow-xl">
    
    <!-- Tier Category Switcher (Silver / Gold / Prismatic) -->
    <div class="flex items-center gap-1.5 p-1 bg-[#161B26] rounded-xl border border-white/5">
      {#each (['silver', 'gold', 'prismatic'] as const) as type}
        <button
          onclick={() => (activeTierType = type)}
          class="px-4 py-2 rounded-lg text-xs font-extrabold transition-all duration-150 whitespace-nowrap cursor-pointer {activeTierType === type ? 'bg-amber-400 text-black shadow-md' : 'text-slate-400 hover:text-white'}"
        >
          {tierTypeLabels[type]}
        </button>
      {/each}
    </div>

    <!-- Right Controls: Stage Filter & Search -->
    <div class="flex flex-wrap items-center gap-2.5">
      <!-- Stage Filter -->
      <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#161B26] border border-white/5 text-xs">
        <Clock class="w-3.5 h-3.5 text-slate-400" />
        <span class="text-slate-400 font-bold">Giai đoạn:</span>
        <select 
          bind:value={selectedStage}
          class="bg-transparent text-amber-400 font-bold focus:outline-none cursor-pointer"
        >
          {#each stages as st}
            <option value={st} class="bg-[#161B26] text-white">Stage {st}</option>
          {/each}
        </select>
      </div>

      <!-- Search Input -->
      <div class="relative w-full md:w-64">
        <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input 
          type="text" 
          bind:value={searchQuery}
          placeholder="Tìm tên lõi (Thăng Cấp, Vé Trúng...)"
          class="w-full pl-9 pr-3 py-2 rounded-xl bg-[#161B26] border border-white/5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-colors shadow-inner"
        />
      </div>
    </div>
  </div>

  <!-- Tier List Sections -->
  <div class="flex flex-col gap-8">
    {#each tiers as t}
      {@const tierAugments = (currentTierData[t] || []).filter((aug: any) => {
        const q = searchQuery.toLowerCase().trim();
        const matchQuery = !q || aug.name_vi?.toLowerCase().includes(q) || aug.name_en?.toLowerCase().includes(q) || aug.desc_vi?.toLowerCase().includes(q);
        const matchStage = selectedStage === 'All' || !aug.stage || aug.stage === selectedStage;
        return matchQuery && matchStage;
      })}

      {#if tierAugments.length > 0}
        <section class="flex flex-col gap-3">
          <div class="flex items-center gap-3 p-3 rounded-xl bg-[#121620] border-l-4 {tierMeta[t].border} border-t border-r border-b border-white/5">
            <span class="px-3.5 py-1 rounded-lg text-xs font-black {tierMeta[t].badge}">
              {tierMeta[t].label}
            </span>
            <span class="text-xs text-slate-300 font-bold">
              {tierAugments.length} Lõi nâng cấp
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {#each tierAugments as aug (aug.id || aug.name_en)}
              {@const iconSrc = resolveAugmentIcon(aug.icon, aug.id)}
              <div class="flex items-start gap-3.5 p-4 rounded-xl bg-[#131722] border border-white/5 hover:border-amber-400/60 hover:-translate-y-0.5 transition-all group shadow-md">
                <div class="w-13 h-13 rounded-xl border-2 border-white/10 overflow-hidden bg-black shrink-0 p-1 flex items-center justify-center shadow-lg">
                  {#if iconSrc}
                    <img 
                      src={iconSrc} 
                      alt={aug.name_vi || aug.name_en}
                      class="w-full h-full object-contain group-hover:scale-115 transition-transform"
                      loading="lazy"
                    />
                  {:else}
                    <div class="w-full h-full bg-amber-400/20"></div>
                  {/if}
                </div>
                
                <div class="flex flex-col flex-1 overflow-hidden">
                  <div class="flex items-center justify-between gap-2">
                    <span class="font-extrabold text-sm text-white group-hover:text-amber-400 transition-colors truncate">
                      {aug.name_vi || aug.name_en}
                    </span>
                    {#if aug.stage}
                      <span class="px-2 py-0.5 rounded bg-black/60 border border-white/10 text-[10px] font-black text-amber-400 shrink-0">
                        {aug.stage}
                      </span>
                    {/if}
                  </div>

                  {#if aug.name_en && aug.name_vi !== aug.name_en}
                    <span class="text-[11px] text-slate-400 font-medium truncate">{aug.name_en}</span>
                  {/if}
                  
                  {#if aug.desc_vi}
                    <p class="text-xs text-slate-300 mt-1.5 leading-relaxed">{aug.desc_vi}</p>
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
