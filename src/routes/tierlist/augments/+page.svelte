<script lang="ts">
  import type { PageData } from './$types';
  import { resolveAugmentIcon } from '$lib/utils/assets';
  import { matchesQuery } from '$lib/utils/search';
  import { interpolateDescription } from '$lib/utils/augment-cleaner';
  import { showTooltip, hideTooltip } from '$lib/utils/tooltip-store.svelte';
  import { Flame, Shield, Sparkles, Search, Clock, ExternalLink } from 'lucide-svelte';

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

  const currentTierData = $derived.by(() => {
    if (selectedStage !== 'All' && data.augments?.stages?.[activeTierType]?.[selectedStage]) {
      return data.augments.stages[activeTierType][selectedStage];
    }
    return data.augments[activeTierType] || {};
  });

  const tierMeta: Record<string, { borderColor: string; boxBg: string; textColor: string; label: string }> = {
    S: { borderColor: 'border-[#FE3E4B]', boxBg: 'bg-[#3D0A10]', textColor: 'text-[#FE3E4B]', label: 'S TIER' },
    A: { borderColor: 'border-[#FF9C00]', boxBg: 'bg-[#3D1A08]', textColor: 'text-[#FF9C00]', label: 'A TIER' },
    B: { borderColor: 'border-[#FFDD00]', boxBg: 'bg-[#3D3208]', textColor: 'text-[#FFDD00]', label: 'B TIER' },
    C: { borderColor: 'border-[#63FC0D]', boxBg: 'bg-[#153608]', textColor: 'text-[#63FC0D]', label: 'C TIER' },
    D: { borderColor: 'border-slate-600', boxBg: 'bg-[#181D2A]', textColor: 'text-slate-400', label: 'D TIER' }
  };
</script>

<svelte:head>
  <title>Bảng Xếp Hạng Lõi Nâng Cấp ĐTCL Mùa 18 (Bạc, Vàng, Kim Cương) · TFT Academy VI</title>
  <meta name="title" content="Bảng Xếp Hạng Lõi Nâng Cấp ĐTCL Mùa 18 (Bạc, Vàng, Kim Cương) · TFT Academy VI" />
  <meta name="description" content="Bảng xếp hạng 249 lõi nâng cấp ĐTCL Mùa 18: Lõi Bạc, Lõi Vàng, Lõi Kim Cương theo từng giai đoạn 2-1, 3-2, 4-2. Bố cục kệ thu gọn chuẩn TFT Academy, tooltip tiếng Việt 100%." />
  <meta property="og:title" content="Bảng Xếp Hạng Lõi Nâng Cấp ĐTCL Mùa 18 · TFT Academy VI" />
  <meta property="og:description" content="Bảng xếp hạng 249 lõi nâng cấp ĐTCL Mùa 18 theo bậc S, A, B, C, D và giai đoạn vòng đấu." />
  <link rel="canonical" href="https://tft.langpn.xyz/tierlist/augments" />
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

    <!-- Stylized Header Title: Gold Crown Logo + AUGMENTS • TIERLIST -->
    <div class="flex items-center gap-3 py-1">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-400/20 shrink-0">
        <span class="font-black text-black text-xl tracking-wider">T</span>
      </div>
      <h1 class="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white flex items-center gap-2" style="font-family: 'Plus Jakarta Sans', sans-serif;">
        <span>LÕI NÂNG CẤP</span>
        <span class="text-amber-400">•</span>
        <span class="text-amber-400">TIERLIST</span>
      </h1>
    </div>
  </div>

  <!-- Subheader Navigation Bar (Matching Screenshot 1: Subnav on Left, Search + Tier Switcher on Right) -->
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
        class="flex items-center gap-2 pb-1.5 transition-all text-slate-400 hover:text-white cursor-pointer"
      >
        <Shield class="w-4 h-4" />
        <span>Trang Bị (Items)</span>
      </a>

      <a 
        href="/tierlist/augments"
        data-sveltekit-preload-data="hover"
        class="flex items-center gap-2 pb-1.5 transition-all text-amber-400 border-b-2 border-amber-400 font-black cursor-pointer"
      >
        <Sparkles class="w-4 h-4 fill-current" />
        <span>Lõi Nâng Cấp (Augments)</span>
      </a>
    </div>

    <!-- Right Controls: Search + Stage Filter + Tier Switcher (Screenshot 1) -->
    <div class="flex flex-wrap items-center gap-3">
      <!-- Search Input -->
      <div class="relative w-48 sm:w-60">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input 
          type="text" 
          bind:value={searchQuery}
          placeholder="Tìm lõi nâng cấp..."
          class="w-full pl-8.5 pr-3 py-1.5 rounded-full bg-[#121620] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-colors shadow-inner"
        />
      </div>

      <!-- Stage Filter Pill -->
      <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#121620] border border-white/10 text-xs text-slate-300">
        <Clock class="w-3 h-3 text-slate-400" />
        <span class="text-slate-400 font-medium">Vòng:</span>
        <select 
          bind:value={selectedStage}
          class="bg-transparent text-amber-400 font-bold focus:outline-none cursor-pointer"
        >
          {#each stages as st}
            <option value={st} class="bg-[#121620] text-white">{st === 'All' ? 'Tất cả' : st}</option>
          {/each}
        </select>
      </div>

      <!-- Tier Category Switcher (Silver / Gold / Prismatic Pills matching Screenshot 1) -->
      <div class="flex items-center gap-1 p-0.5 bg-[#121620] rounded-full border border-white/10">
        {#each (['silver', 'gold', 'prismatic'] as const) as type}
          <button
            onclick={() => (activeTierType = type)}
            class="px-3.5 py-1 rounded-full text-xs font-bold transition-all duration-150 whitespace-nowrap cursor-pointer {activeTierType === type ? 'bg-amber-400 text-black font-extrabold shadow-md' : 'text-slate-400 hover:text-white'}"
          >
            {type === 'silver' ? 'Silver' : type === 'gold' ? 'Gold' : 'Prismatic'}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- 5 Tier Shelves: S, A, B, C, D (Exact Replica of TFT Academy Screenshot 1) -->
  <div class="flex flex-col gap-4">
    {#each tiers as t}
      {@const meta = tierMeta[t]}
      {@const tierAugments = (currentTierData[t] || []).filter((aug: any) => {
        return matchesQuery(aug.name_vi, searchQuery) || 
               matchesQuery(aug.name_en, searchQuery) || 
               matchesQuery(aug.desc_vi, searchQuery);
      })}

      {#if tierAugments.length > 0}
        <div class="relative rounded-2xl bg-[#090C12] border-2 {meta.borderColor} p-2 flex flex-col sm:flex-row items-stretch gap-3 shadow-xl">
          
          <!-- Left Square Badge (S/A/B/C/D Tier) -->
          <div class="w-16 sm:w-22 shrink-0 rounded-xl {meta.boxBg} border {meta.borderColor} flex flex-col items-center justify-center p-2.5 text-center select-none">
            <span class="text-3xl sm:text-5xl font-black {meta.textColor} leading-none tracking-tight">{t}</span>
            <span class="text-[9px] font-black uppercase tracking-wider text-slate-300 mt-1">{meta.label}</span>
          </div>

          <!-- Right Shelf Area: Compact Augment Items (Icon + Name underneath) -->
          <div class="flex flex-wrap items-start gap-x-3 gap-y-3.5 flex-1 p-2.5 overflow-visible">
            {#each tierAugments as aug (aug.id || aug.name_en)}
              {@const iconSrc = resolveAugmentIcon(aug.icon, aug.id)}
              <div 
                class="flex flex-col items-center gap-1.5 w-18 sm:w-20 group cursor-pointer transition-transform duration-150 hover:scale-105 select-none"
                onmouseenter={(e) => showTooltip({ type: 'augment', id: aug.id, name: aug.name_vi }, e.currentTarget)}
                onmouseleave={() => hideTooltip()}
                role="button"
                tabindex="0"
              >
                <!-- Augment Icon Box -->
                <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-black border border-white/10 group-hover:border-amber-400 p-1 flex items-center justify-center shadow-md transition-colors">
                  {#if iconSrc}
                    <img src={iconSrc} alt={aug.name_vi || aug.name_en} class="w-full h-full object-contain" loading="lazy" />
                  {/if}
                </div>

                <!-- Augment Name -->
                <span class="text-[10px] sm:text-[11px] font-bold text-center leading-tight text-slate-300 group-hover:text-amber-300 line-clamp-2 max-w-full">
                  {aug.name_vi || aug.name_en}
                </span>
              </div>
            {/each}
          </div>

        </div>
      {/if}
    {/each}
  </div>

</div>
