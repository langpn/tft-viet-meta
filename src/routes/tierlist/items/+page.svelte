<script lang="ts">
  import type { PageData } from './$types';
  import { Shield, Sparkles, Search, Layers } from 'lucide-svelte';

  let { data }: { data: PageData } = $props();

  let activeCategory = $state<'craftables' | 'radiants' | 'artifacts' | 'emblems'>('craftables');
  let searchQuery = $state('');

  const categoryLabels = {
    craftables: 'Đồ Ghép Thường',
    radiants: 'Trang Bị Ánh Sáng',
    artifacts: 'Cổ Vật (Ornn)',
    emblems: 'Ấn Tộc Hệ'
  };

  const currentCategoryData = $derived(data.items[activeCategory] || {});

  const tiers = ['S', 'A', 'B', 'C', 'D'];

  const tierMeta: Record<string, { label: string; badge: string; border: string }> = {
    S: { label: 'S Tier', badge: 'bg-rose-500 text-white', border: 'border-rose-500/30' },
    A: { label: 'A Tier', badge: 'bg-orange-500 text-white', border: 'border-orange-500/30' },
    B: { label: 'B Tier', badge: 'bg-amber-400 text-black font-bold', border: 'border-amber-400/30' },
    C: { label: 'C Tier', badge: 'bg-lime-500 text-black font-bold', border: 'border-lime-500/30' },
    D: { label: 'D Tier', badge: 'bg-slate-600 text-white', border: 'border-slate-600/30' }
  };
</script>

<svelte:head>
  <title>Bảng Xếp Hạng Trang Bị TFT (Mùa 18) · TFT Academy VI</title>
</svelte:head>

<div class="flex flex-col gap-8 pb-16">
  
  <!-- Hero Heading -->
  <div class="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 pt-4 border-b border-white/5 pb-6">
    <div class="flex flex-col gap-2">
      <div class="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-amber-400">
        <Shield class="w-4 h-4" />
        <span>TFT Academy Item Tier List</span>
        <span class="text-slate-500">•</span>
        <span class="text-slate-400">Patch 18.5c</span>
      </div>
      <h1 class="text-3xl md:text-5xl font-black tracking-tight text-white">
        Bảng Xếp Hạng <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400">Trang Bị</span>
      </h1>
      <p class="text-slate-400 text-sm md:text-base max-w-2xl">
        Đánh giá sức mạnh trang bị chuẩn xác, ghép đồ tối ưu cho từng giai đoạn trận đấu.
      </p>
    </div>
  </div>

  <!-- Category Tabs & Search Bar -->
  <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-[#0F131C] border border-white/10 shadow-lg">
    
    <!-- Category Tabs -->
    <div class="flex items-center gap-1 overflow-x-auto p-1 bg-[#161B26] rounded-xl border border-white/5">
      {#each (['craftables', 'radiants', 'artifacts', 'emblems'] as const) as cat}
        <button
          onclick={() => (activeCategory = cat)}
          class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 whitespace-nowrap cursor-pointer {activeCategory === cat ? 'bg-amber-400 text-black shadow-md' : 'text-slate-400 hover:text-white'}"
        >
          {categoryLabels[cat]}
        </button>
      {/each}
    </div>

    <!-- Search Input -->
    <div class="relative w-full md:w-72">
      <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input 
        type="text" 
        bind:value={searchQuery}
        placeholder="Tìm trang bị..."
        class="w-full pl-10 pr-4 py-2 rounded-xl bg-[#161B26] border border-white/5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
      />
    </div>
  </div>

  <!-- Tier List Sections -->
  <div class="flex flex-col gap-10">
    {#each tiers as t}
      {@const tierItems = (currentCategoryData[t] || []).filter((item: any) => {
        const q = searchQuery.toLowerCase().trim();
        return !q || item.name_vi?.toLowerCase().includes(q) || item.name_en?.toLowerCase().includes(q);
      })}

      {#if tierItems.length > 0}
        <section class="flex flex-col gap-4">
          <div class="flex items-center gap-3 p-3 rounded-xl bg-[#121620] border-l-4 {tierMeta[t].border} border-t border-r border-b border-white/5">
            <span class="px-3 py-1 rounded-lg text-xs font-black {tierMeta[t].badge}">
              {tierMeta[t].label}
            </span>
            <span class="text-xs text-slate-400 font-medium">
              {tierItems.length} Trang bị
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {#each tierItems as item (item.id || item.name_en)}
              <div class="flex items-start gap-3 p-3 rounded-xl bg-[#131722] border border-white/5 hover:border-amber-400/50 hover:-translate-y-0.5 transition-all group">
                <div class="w-11 h-11 rounded-lg border border-white/10 overflow-hidden bg-black/60 shrink-0 shadow">
                  {#if item.icon}
                    <img 
                      src={item.icon.startsWith('http') ? item.icon : `https://assets.tftacademy.com/items/${item.icon}`} 
                      alt={item.name_vi}
                      class="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      loading="lazy"
                    />
                  {/if}
                </div>
                
                <div class="flex flex-col overflow-hidden">
                  <span class="font-bold text-sm text-white group-hover:text-amber-400 transition-colors truncate">
                    {item.name_vi || item.name_en}
                  </span>
                  {#if item.name_en && item.name_vi !== item.name_en}
                    <span class="text-[11px] text-slate-400 truncate">{item.name_en}</span>
                  {/if}
                  {#if item.desc_vi}
                    <p class="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">{item.desc_vi}</p>
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
