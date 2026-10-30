<script lang="ts">
  import { resolveItemIcon, resolveChampionIcon } from '$lib/utils/assets';

  interface Props {
    data: any;
  }

  let { data }: Props = $props();

  const costBorderColors: Record<number, string> = {
    1: 'border-slate-400',
    2: 'border-emerald-500',
    3: 'border-sky-500',
    4: 'border-fuchsia-500',
    5: 'border-amber-400'
  };

  const iconSrc = $derived(resolveItemIcon(data?.icon, data?.id));
</script>

{#if data}
  <!-- Item Tooltip (Exact Match to Images 6 & 7) -->
  <div class="w-80 sm:w-92 rounded-2xl bg-[#090C12] border-2 border-slate-700/80 p-4.5 shadow-2xl text-white flex flex-col gap-3.5 select-none animate-in fade-in zoom-in-95 duration-100">
    
    <!-- Top Row: Icon + Name + Stats -->
    <div class="flex items-start gap-3">
      <div class="w-13 h-13 rounded-xl bg-black border-2 border-amber-400/60 p-1 shrink-0 shadow-lg flex items-center justify-center">
        {#if iconSrc}
          <img src={iconSrc} alt="" class="w-full h-full object-contain rounded-lg" />
        {/if}
      </div>

      <div class="flex flex-col flex-1 overflow-hidden">
        <h3 class="text-base font-black text-white leading-tight truncate">
          {data.name_vi || data.name_en}
        </h3>
        {#if data.name_en && data.name_vi !== data.name_en}
          <span class="text-[11px] text-slate-400 truncate">({data.name_en})</span>
        {/if}

        <!-- Stat Badges Row (Matching Images 6 & 7) -->
        {#if data.stats && Object.keys(data.stats).length > 0}
          <div class="flex flex-wrap items-center gap-2 mt-1.5 text-xs font-black">
            {#if data.stats.ad}
              <span class="text-orange-400 flex items-center gap-1">🗡 {data.stats.ad}</span>
            {/if}
            {#if data.stats.ap}
              <span class="text-sky-400 flex items-center gap-1">💧 {data.stats.ap}</span>
            {/if}
            {#if data.stats.armor}
              <span class="text-amber-300 flex items-center gap-1">🛡 {data.stats.armor}</span>
            {/if}
            {#if data.stats.as}
              <span class="text-yellow-400 flex items-center gap-1">⚡ {data.stats.as}</span>
            {/if}
            {#if data.stats.hp}
              <span class="text-emerald-400 flex items-center gap-1">❤️ {data.stats.hp}</span>
            {/if}
            {#if data.stats.mr}
              <span class="text-indigo-400 flex items-center gap-1">🔮 {data.stats.mr}</span>
            {/if}
            {#if data.stats.crit}
              <span class="text-rose-400 flex items-center gap-1">💥 {data.stats.crit}</span>
            {/if}
          </div>
        {/if}
      </div>
    </div>

    <!-- Description -->
    {#if data.desc_vi || data.desc_en}
      <p class="text-xs text-slate-300 leading-relaxed font-normal border-t border-white/10 pt-2.5">
        {data.desc_vi || data.desc_en}
      </p>
    {/if}

    <!-- Recipe Components (if craftable item) -->
    {#if data.recipe && data.recipe.length === 2}
      {@const comp1Icon = resolveItemIcon(data.recipe[0].icon, data.recipe[0].id)}
      {@const comp2Icon = resolveItemIcon(data.recipe[1].icon, data.recipe[1].id)}
      <div class="flex items-center gap-2.5 py-1">
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ghép từ:</span>
        <div class="flex items-center gap-1.5">
          <div class="w-6.5 h-6.5 rounded-md bg-black border border-white/20 p-0.5 shadow" title={data.recipe[0].name_vi}>
            <img src={comp1Icon} alt="" class="w-full h-full object-contain" />
          </div>
          <span class="text-xs font-black text-slate-400">+</span>
          <div class="w-6.5 h-6.5 rounded-md bg-black border border-white/20 p-0.5 shadow" title={data.recipe[1].name_vi}>
            <img src={comp2Icon} alt="" class="w-full h-full object-contain" />
          </div>
        </div>
      </div>
    {/if}

    <!-- Recommended Holders (Matching Images 6 & 7) -->
    {#if data.recommendedHolders && data.recommendedHolders.length > 0}
      <div class="flex flex-col gap-1.5 border-t border-white/10 pt-2.5">
        <span class="text-[11px] font-black uppercase tracking-wider text-amber-400">
          Recommended Holders (Tướng Phù Hợp)
        </span>
        <div class="flex items-center gap-2">
          {#each data.recommendedHolders.slice(0, 4) as holder}
            {@const hIcon = resolveChampionIcon(holder.icon, holder.id)}
            <div 
              class="w-10 h-10 rounded-xl bg-black border-2 {costBorderColors[holder.cost] || 'border-slate-500'} overflow-hidden shadow-lg hover:scale-115 transition-transform cursor-pointer"
              title="{holder.name_vi || holder.name_en} ({holder.cost} vàng)"
            >
              {#if hIcon}
                <img src={hIcon} alt="" class="w-full h-full object-cover" loading="lazy" />
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}

  </div>
{/if}
