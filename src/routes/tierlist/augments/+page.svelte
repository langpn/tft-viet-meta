<script lang="ts">
  import type { PageData } from './$types';
  import { Sparkles, Search, Layers, Clock } from 'lucide-svelte';

  let { data }: { data: PageData } = $props();

  let activeTierType = $state<'silver' | 'gold' | 'prismatic'>('gold');
  let selectedStage = $state<string>('All');
  let searchQuery = $state('');

  const tierTypeLabels = {
    silver: 'Lõi Bạc (Bậc 1)',
    gold: 'Lõi Vàng (Bậc 2)',
    prismatic: 'Lõi Kim Cương (Bậc 3)'
  };

  const tierTypeBadgeStyles = {
    silver: 'bg-slate-400/20 text-slate-300 border-slate-400/30',
    gold: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
    prismatic: 'bg-fuchsia-400/20 text-fuchsia-300 border-fuchsia-400/30'
  };

  const stages = ['All', '2-1', '3-2', '4-2'];
  const tiers = ['S', 'A', 'B', 'C', 'D'];

  const currentTierData = $derived(data.augments[activeTierType] || {});

  const tierMeta: Record<string, { label: string; badge: string; border: string }> = {
    S: { label: 'S Tier', badge: 'bg-rose-500 text-white', border: 'border-rose-500/30' },
    A: { label: 'A Tier', badge: 'bg-orange-500 text-white', border: 'border-orange-500/30' },
    B: { label: 'B Tier', badge: 'bg-amber-400 text-black font-bold', border: 'border-amber-400/30' },
    C: { label: 'C Tier', badge: 'bg-lime-500 text-black font-bold', border: 'border-lime-500/30' },
    D: { label: 'D Tier', badge: 'bg-slate-600 text-white', border: 'border-slate-600/30' }
  };
</script>

<svelte:head>
  <title>Bảng Xếp Hạng Lõi Nâng Cấp TFT (Mùa 18) · TFT Academy VI</title>
</svelte:head>

<div class="flex flex-col gap-8 pb-16">
  
  <!-- Hero Heading -->
  <div class="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 pt-4 border-b border-white/5 pb-6">
    <div class="flex flex-col gap-2">
      <div class="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-amber-400">
        <Sparkles class="w-4 h-4" />
        <span>TFT Academy Augments Tier List</span>
        <span class="text-slate-500">•</span>
        <span class="text-slate-400">Patch 18.5c</span>
      </div>
      <h1 class="text-3xl md:text-5xl font-black tracking-tight text-white">
        Bảng Xếp Hạng <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400">Lõi Nâng Cấp</span>
      </h1>
      <p class="text-slate-400 text-sm md:text-base max-w-2xl">
        Lựa chọn lõi công nghệ tối ưu theo từng giai đoạn (2-1, 3-2, 4-2) gia tăng tỷ lệ thắng cao nhất.
      </p>
    </div>
  </div>

  <!-- Tier Selector & Stage Filter & Search Bar -->
  <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-[#0F131C] border border-white/10 shadow-lg">
    
    <!-- Tier Category Switcher (Silver / Gold / Prismatic) -->
    <div class="flex items-center gap-1 p-1 bg-[#161B26] rounded-xl border border-white/5">
      {#each (['silver', 'gold', 'prismatic'] as const) as type}
        <button
          onclick={() => (activeTierType = type)}
          class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 whitespace-nowrap cursor-pointer {activeTierType === type ? 'bg-amber-400 text-black shadow-md' : 'text-slate-400 hover:text-white'}"
        >
          {tierTypeLabels[type]}
        </button>
      {/each}
    </div>

    <!-- Right Controls: Stage Filter & Search -->
    <div class="flex items-center gap-2">
      <!-- Stage Filter -->
      <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161B26] border border-white/5 text-xs">
        <Clock class="w-3.5 h-3.5 text-slate-400" />
        <span class="text-slate-400">Giai đoạn:</span>
        <select 
          bind:value={selectedStage}
          class="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
        >
          {#each stages as st}
            <option value={st} class="bg-[#161B26] text-white">Stage {st}</option>
          {/each}
        </select>
      </div>

      <!-- Search Input -->
      <div class="relative w-full md:w-60">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input 
          type="text" 
          bind:value={searchQuery}
          placeholder="Tìm tên lõi..."
          class="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#161B26] border border-white/5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
        />
      </div>
    </div>
  </div>

  <!-- Tier List Sections -->
  <div class="flex flex-col gap-10">
    {#each tiers as t}
      {@const tierAugments = (currentTierData[t] || []).filter((aug: any) => {
        const q = searchQuery.toLowerCase().trim();
        const matchQuery = !q || aug.name_vi?.toLowerCase().includes(q) || aug.name_en?.toLowerCase().includes(q);
        const matchStage = selectedStage === 'All' || !aug.stage || aug.stage === selectedStage;
        return matchQuery && matchStage;
      })}

      {#if tierAugments.length > 0}
        <section class="flex flex-col gap-4">
          <div class="flex items-center gap-3 p-3 rounded-xl bg-[#121620] border-l-4 {tierMeta[t].border} border-t border-r border-b border-white/5">
            <span class="px-3 py-1 rounded-lg text-xs font-black {tierMeta[t].badge}">
              {tierMeta[t].label}
            </span>
            <span class="text-xs text-slate-400 font-medium">
              {tierAugments.length} Lõi nâng cấp
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {#each tierAugments as aug (aug.id || aug.name_en)}
              <div class="flex items-start gap-3 p-3.5 rounded-xl bg-[#131722] border border-white/5 hover:border-amber-400/50 hover:-translate-y-0.5 transition-all group">
                <div class="w-12 h-12 rounded-xl border border-white/10 overflow-hidden bg-black/60 shrink-0 p-1 flex items-center justify-center shadow">
                  {#if aug.icon}
                    <img 
                      src={aug.icon.startsWith('http') ? aug.icon : `https://assets.tftacademy.com/augments/${aug.icon}`} 
                      alt={aug.name_vi}
                      class="w-full h-full object-contain group-hover:scale-110 transition-transform"
                      loading="lazy"
                    />
                  {/if}
                </div>
                
                <div class="flex flex-col flex-1 overflow-hidden">
                  <div class="flex items-center justify-between gap-2">
                    <span class="font-bold text-sm text-white group-hover:text-amber-400 transition-colors truncate">
                      {aug.name_vi || aug.name_en}
                    </span>
                    {#if aug.stage}
                      <span class="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-[10px] font-bold text-amber-400 shrink-0">
                        {aug.stage}
                      </span>
                    {/if}
                  </div>

                  {#if aug.name_en && aug.name_vi !== aug.name_en}
                    <span class="text-[11px] text-slate-400 truncate">{aug.name_en}</span>
                  {/if}
                  
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
