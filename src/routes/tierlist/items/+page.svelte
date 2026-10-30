<script lang="ts">
  import type { PageData } from './$types';
  import { resolveItemIcon } from '$lib/utils/assets';
  import { matchesQuery } from '$lib/utils/search';
  import { showTooltip, hideTooltip } from '$lib/utils/tooltip-store.svelte';
  import { Flame, Shield, Sparkles, Search, ExternalLink } from 'lucide-svelte';

  let { data }: { data: PageData } = $props();

  let activeCategory = $state<'craftables' | 'radiants' | 'artifacts' | 'emblems'>(
    (data.initialCategory as any) || 'craftables'
  );
  let searchQuery = $state('');

  function selectCategory(cat: 'craftables' | 'radiants' | 'artifacts' | 'emblems') {
    activeCategory = cat;
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', cat);
      history.replaceState({}, '', url);
    }
  }

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
  <title>Bảng Xếp Hạng Trang Bị ĐTCL Mùa 18 (Cổ Vật Ornn, Đồ Ánh Sáng, Đồ Ghép) · TFT Academy VI</title>
  <meta name="title" content="Bảng Xếp Hạng Trang Bị ĐTCL Mùa 18 (Cổ Vật Ornn, Đồ Ánh Sáng, Đồ Ghép) · TFT Academy VI" />
  <meta name="description" content="Bảng xếp hạng 123 trang bị ĐTCL Mùa 18 phân loại theo bậc S, A, B, C, D: Đồ ghép thường, Trang bị ánh sáng, 30 Cổ vật Ornn tiếng Việt và 21 Ấn tộc hệ chuẩn in-game." />
  <meta property="og:title" content="Bảng Xếp Hạng Trang Bị ĐTCL Mùa 18 · TFT Academy VI" />
  <meta property="og:description" content="Bảng xếp hạng 123 trang bị ĐTCL Mùa 18: Đồ ghép thường, Trang bị ánh sáng, 30 Cổ vật Ornn tiếng Việt và 21 Ấn tộc hệ." />
  <meta property="og:url" content="https://tft.langpn.xyz/tierlist/items" />
  <link rel="canonical" href="https://tft.langpn.xyz/tierlist/items" />
</svelte:head>

<div class="flex flex-col gap-6 pb-20">
  
  <!-- Top Banner: Patch & Title (Matching Screenshot 2 exactly!) -->
  <div class="flex flex-col gap-3">
    <!-- Patch & Update Tag -->
    <div class="flex items-center gap-3 text-xs font-bold">
      <div class="px-3.5 py-1 rounded-full bg-[#161B26] border border-white/10 text-white flex items-center gap-2">
        <span class="text-slate-400">Bản Cập Nhật</span>
        <span class="font-black text-amber-400">18.5c</span>
      </div>

      <a href="https://tftacademy.com/tierlist/updates/comps" target="_blank" class="text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1">
        <span>Cập nhật 13 giờ trước</span>
        <ExternalLink class="w-3 h-3 text-amber-400" />
      </a>
    </div>

    <!-- Stylized Header Title: Gold Crown Logo + ITEMS • TIERLIST -->
    <div class="flex items-center gap-3 py-1">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-400/20 shrink-0">
        <span class="font-black text-black text-xl tracking-wider">T</span>
      </div>
      <h1 class="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white flex items-center gap-2" style="font-family: 'Plus Jakarta Sans', sans-serif;">
        <span>TRANG BỊ</span>
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
        class="flex items-center gap-2 pb-1.5 transition-all text-slate-400 hover:text-white cursor-pointer"
      >
        <Flame class="w-4 h-4" />
        <span>Đội Hình (Comps)</span>
      </a>

      <a 
        href="/tierlist/items"
        data-sveltekit-preload-data="hover"
        class="flex items-center gap-2 pb-1.5 transition-all text-amber-400 border-b-2 border-amber-400 font-black cursor-pointer"
      >
        <Shield class="w-4 h-4 fill-current" />
        <span>Trang Bị (Items)</span>
      </a>

      <a 
        href="/tierlist/augments"
        data-sveltekit-preload-data="hover"
        class="flex items-center gap-2 pb-1.5 transition-all text-slate-400 hover:text-white cursor-pointer"
      >
        <Sparkles class="w-4 h-4" />
        <span>Lõi Nâng Cấp (Augments)</span>
      </a>
    </div>
  </div>

  <!-- Category Filter Buttons & Search Bar -->
  <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0F131C] border border-white/10 shadow-xl">
    
    <!-- Category Tabs -->
    <div class="flex items-center gap-1.5 overflow-x-auto p-1 bg-[#161B26] rounded-xl border border-white/5">
      {#each (['craftables', 'radiants', 'artifacts', 'emblems'] as const) as cat}
        <button
          onclick={() => selectCategory(cat)}
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
        return matchesQuery(item.name_vi, searchQuery) || 
               matchesQuery(item.name_en, searchQuery) || 
               matchesQuery(item.desc_vi, searchQuery);
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
              <div 
                class="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#131722] border border-white/5 hover:border-amber-400/60 hover:-translate-y-0.5 transition-all group shadow-md cursor-pointer"
                onmouseenter={(e) => showTooltip({ type: 'item', id: item.id, name: item.name_vi }, e.currentTarget)}
                onmouseleave={() => hideTooltip()}
              >
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
