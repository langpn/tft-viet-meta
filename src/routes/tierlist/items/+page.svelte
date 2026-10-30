<script lang="ts">
  import type { PageData } from './$types';
  import { resolveItemIcon } from '$lib/utils/assets';
  import { Shield, Sparkles, Search } from 'lucide-svelte';

  let { data }: { data: PageData } = $props();

  let activeCategory = $state<'craftables' | 'radiants' | 'artifacts' | 'emblems'>('craftables');
  let searchQuery = $state('');

  const categoryLabels = {
    craftables: 'Đồ Ghép Thường (Craftables)',
    radiants: 'Trang Bị Ánh Sáng (Radiants)',
    artifacts: 'Cổ Vật Ornn (Artifacts)',
    emblems: 'Ấn Tộc Hệ (Emblems)'
  };

  const currentCategoryData = $derived(data.items[activeCategory] || {});
  const tiers = ['S', 'A', 'B', 'C', 'D'];

  const tierMeta: Record<string, { label: string; badge: string; border: string }> = {
    S: { label: 'S Tier', badge: 'bg-[#FE3E4B] text-white', border: 'border-[#FE3E4B]/40' },
    A: { label: 'A Tier', badge: 'bg-[#FF9C00] text-white', border: 'border-[#FF9C00]/40' },
    B: { label: 'B Tier', badge: 'bg-[#FFDD00] text-black font-black', border: 'border-[#FFDD00]/40' },
    C: { label: 'C Tier', badge: 'bg-[#63FC0D] text-black font-black', border: 'border-[#63FC0D]/40' },
    D: { label: 'D Tier', badge: 'bg-slate-600 text-white', border: 'border-slate-600/40' }
  };
</script>

<svelte:head>
  <title>Bảng Xếp Hạng Trang Bị TFT (Mùa 18) · TFT Academy VI</title>
</svelte:head>

<div class="flex flex-col gap-6 pb-20">
  
  <!-- Category Filter Buttons & Search Bar -->
  <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0F131C] border border-white/10 shadow-xl">
    
    <!-- Category Tabs -->
    <div class="flex items-center gap-1.5 overflow-x-auto p-1 bg-[#161B26] rounded-xl border border-white/5">
      {#each (['craftables', 'radiants', 'artifacts', 'emblems'] as const) as cat}
        <button
          onclick={() => (activeCategory = cat)}
          class="px-4 py-2 rounded-lg text-xs font-extrabold transition-all duration-150 whitespace-nowrap cursor-pointer {activeCategory === cat ? 'bg-amber-400 text-black shadow-md' : 'text-slate-400 hover:text-white'}"
        >
          {categoryLabels[cat]}
        </button>
      {/each}
    </div>

    <!-- Search Input -->
    <div class="relative w-full md:w-80">
      <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input 
        type="text" 
        bind:value={searchQuery}
        placeholder="Tìm trang bị (Vô Cực, Cuồng Đao, Huyết Kiếm...)"
        class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#161B26] border border-white/5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-colors shadow-inner"
      />
    </div>
  </div>

  <!-- Tier List Sections -->
  <div class="flex flex-col gap-8">
    {#each tiers as t}
      {@const tierItems = (currentCategoryData[t] || []).filter((item: any) => {
        const q = searchQuery.toLowerCase().trim();
        return !q || item.name_vi?.toLowerCase().includes(q) || item.name_en?.toLowerCase().includes(q) || item.desc_vi?.toLowerCase().includes(q);
      })}

      {#if tierItems.length > 0}
        <section class="flex flex-col gap-3">
          <!-- Tier Header -->
          <div class="flex items-center gap-3 p-3 rounded-xl bg-[#121620] border-l-4 {tierMeta[t].border} border-t border-r border-b border-white/5">
            <span class="px-3.5 py-1 rounded-lg text-xs font-black {tierMeta[t].badge}">
              {tierMeta[t].label}
            </span>
            <span class="text-xs text-slate-300 font-bold">
              {tierItems.length} Trang bị
            </span>
          </div>

          <!-- Items Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {#each tierItems as item (item.id || item.name_en)}
              {@const iconSrc = resolveItemIcon(item.icon, item.id)}
              <div class="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#131722] border border-white/5 hover:border-amber-400/60 hover:-translate-y-0.5 transition-all group shadow-md">
                <div class="w-13 h-13 rounded-xl border-2 border-white/10 overflow-hidden bg-black shrink-0 shadow-lg p-0.5 flex items-center justify-center">
                  {#if iconSrc}
                    <img 
                      src={iconSrc} 
                      alt={item.name_vi || item.name_en}
                      class="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform"
                      loading="lazy"
                    />
                  {:else}
                    <div class="w-full h-full bg-amber-400/20"></div>
                  {/if}
                </div>
                
                <div class="flex flex-col flex-1 overflow-hidden">
                  <span class="font-extrabold text-sm text-white group-hover:text-amber-400 transition-colors truncate">
                    {item.name_vi || item.name_en}
                  </span>
                  {#if item.name_en && item.name_vi !== item.name_en}
                    <span class="text-[11px] text-slate-400 font-medium truncate">{item.name_en}</span>
                  {/if}
                  {#if item.desc_vi}
                    <p class="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-2">{item.desc_vi}</p>
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
