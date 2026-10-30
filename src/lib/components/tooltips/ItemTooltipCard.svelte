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

  // Format and highlight keywords in description matching TFT Academy
  function formatDescription(txt: string | undefined | null): string {
    if (!txt) return '';
    const clean = txt
      .replace(/\{\{[^}]+\}\}/g, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+,/g, ',')
      .replace(/\s+\./g, '.')
      .replace(/\s+/g, ' ')
      .trim();

    return clean
      .replace(/\b(Attack Speed|Tốc Độ Đánh)\b/gi, '<span class="text-[#FFD790] font-bold">$1</span>')
      .replace(/\b(Attack Damage|Sức Mạnh Công Kích)\b/gi, '<span class="text-orange-400 font-bold">$1</span>')
      .replace(/\b(Ability Power|Sức Mạnh Phép Thuật)\b/gi, '<span class="text-sky-400 font-bold">$1</span>')
      .replace(/\b(Health|Máu)\b/gi, '<span class="text-emerald-400 font-bold">$1</span>')
      .replace(/\b(Armor|Giáp)\b/gi, '<span class="text-amber-300 font-bold">$1</span>')
      .replace(/\b(Magic Resist|Kháng Phép)\b/gi, '<span class="text-sky-400 font-bold">$1</span>')
      .replace(/\b(Stuns?|Làm Choáng)\b/gi, '<span class="text-amber-300 font-bold">$1</span>')
      .replace(/\b(Slow|Làm Chậm)\b/gi, '<span class="text-sky-300 font-bold">$1</span>')
      .replace(/\b(Burn|Thiêu Đốt)\b/gi, '<span class="text-orange-400 font-bold">$1</span>')
      .replace(/\b(Wound|Vết Thương Sâu)\b/gi, '<span class="text-rose-400 font-bold">$1</span>');
  }
</script>

{#if data}
  <!-- Item Tooltip (Exact 1:1 Match to TFT Academy Screenshot) -->
  <div class="w-76 sm:w-82 rounded-xl bg-[#0B0D12] border-2 border-[#1E2330] p-3 text-white shadow-2xl flex flex-col gap-2.5 select-none animate-in fade-in zoom-in-95 duration-100">
    
    <!-- Top Row: Icon + Name + Stats -->
    <section class="flex w-full items-start gap-2.5">
      <div class="w-10 h-10 rounded-lg bg-black border border-white/20 p-0.5 shrink-0 shadow overflow-hidden flex items-center justify-center">
        {#if iconSrc}
          <img src={iconSrc} alt="" class="w-full h-full object-contain rounded-md" />
        {/if}
      </div>

      <div class="flex flex-col flex-1 overflow-hidden -mt-0.5">
        <h3 class="text-base font-bold text-white leading-tight truncate">
          {data.name_vi || data.name_en}
        </h3>
        {#if data.name_en && data.name_vi !== data.name_en}
          <span class="text-[11px] text-slate-400 truncate">({data.name_en})</span>
        {/if}

        <!-- Stat Badges Row (Order matching TFT Academy: AD -> Armor -> MR -> Omnivamp -> AS -> AP -> HP -> Crit) -->
        {#if data.stats && Object.keys(data.stats).length > 0}
          <div class="flex flex-wrap items-center gap-2 mt-1 text-xs font-bold">
            {#if data.stats.ad}
              <span class="text-orange-400 flex items-center gap-1">🗡 {data.stats.ad}</span>
            {/if}
            {#if data.stats.armor}
              <span class="text-amber-300 flex items-center gap-1">🛡 {data.stats.armor}</span>
            {/if}
            {#if data.stats.mr}
              <span class="text-sky-400 flex items-center gap-1">🧿 {data.stats.mr}</span>
            {/if}
            {#if data.stats.ov}
              <span class="text-rose-400 flex items-center gap-1">🦷 {data.stats.ov}</span>
            {/if}
            {#if data.stats.as}
              <span class="text-[#FFD790] flex items-center gap-1">彡 {data.stats.as}</span>
            {/if}
            {#if data.stats.ap}
              <span class="text-sky-400 flex items-center gap-1">💧 {data.stats.ap}</span>
            {/if}
            {#if data.stats.hp}
              <span class="text-emerald-400 flex items-center gap-1">❤️ {data.stats.hp}</span>
            {/if}
            {#if data.stats.crit}
              <span class="text-rose-400 flex items-center gap-1">💥 {data.stats.crit}</span>
            {/if}
            {#if data.stats.mana}
              <span class="text-blue-400 flex items-center gap-1">💧 {data.stats.mana}</span>
            {/if}
          </div>
        {/if}
      </div>
    </section>

    <!-- Thin Divider Line (Matching TFT Academy) -->
    <div class="border-b border-[#1E2330]"></div>

    <!-- Clean Description with Highlighting -->
    {#if data.desc_vi || data.desc_en}
      <p class="text-xs text-white/90 leading-relaxed font-normal">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html formatDescription(data.desc_vi || data.desc_en)}
      </p>
    {/if}

    <!-- Recipe Components (if craftable item with 2 components) -->
    {#if data.recipe && data.recipe.length === 2}
      {@const comp1Icon = resolveItemIcon(data.recipe[0].icon, data.recipe[0].id)}
      {@const comp2Icon = resolveItemIcon(data.recipe[1].icon, data.recipe[1].id)}
      <div class="flex items-center gap-2 pt-0.5">
        <div class="w-6 h-6 rounded-md bg-black border border-white/20 p-0.5 shadow" title={data.recipe[0].name_vi}>
          <img src={comp1Icon} alt="" class="w-full h-full object-contain" />
        </div>
        <span class="text-xs font-black text-slate-400">+</span>
        <div class="w-6 h-6 rounded-md bg-black border border-white/20 p-0.5 shadow" title={data.recipe[1].name_vi}>
          <img src={comp2Icon} alt="" class="w-full h-full object-contain" />
        </div>
      </div>
    {/if}

    <!-- Recommended Holders Box (Exact Match to TFT Academy Screenshot) -->
    {#if data.recommendedHolders && data.recommendedHolders.length > 0}
      <section 
        class="flex w-full flex-col gap-1.5 rounded-lg border border-[#FFD790]/40 p-2 text-xs text-pretty break-words mt-0.5" 
        style="background: linear-gradient(180deg, rgba(255, 215, 144, 0.0) 20%, rgba(255, 215, 144, 0.12) 100%);"
      >
        <span class="flex w-full flex-row gap-1">
          <p class="text-xs leading-none font-bold text-[#FFD790]">Recommended Holders</p>
        </span>
        <div class="flex flex-row flex-wrap items-center gap-2 pt-0.5">
          {#each data.recommendedHolders.slice(0, 4) as holder}
            {@const hIcon = resolveChampionIcon(holder.icon, holder.id)}
            <div 
              class="w-10 h-10 shrink-0 rounded-md border-2 overflow-hidden shadow-md cursor-pointer hover:scale-110 transition-transform {costBorderColors[holder.cost] || 'border-slate-500'}"
              title="{holder.name_vi || holder.name_en} ({holder.cost} vàng)"
            >
              {#if hIcon}
                <img 
                  src={hIcon} 
                  alt={holder.name_vi || holder.name_en} 
                  class="w-full h-full object-cover" 
                  loading="lazy"
                  onerror={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (!target.dataset.triedBackup && holder.id) {
                      target.dataset.triedBackup = 'true';
                      target.src = `https://assets.tftacademy.com/champions/champion_icons/${holder.id}.webp`;
                    }
                  }}
                />
              {/if}
            </div>
          {/each}
        </div>
      </section>
    {/if}

  </div>
{/if}
