<script lang="ts">
  import { resolveChampionIcon, resolveItemIcon, resolveTraitIcon, resolveAbilityIcon } from '$lib/utils/assets';

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

  const costGlowColors: Record<number, string> = {
    1: 'shadow-slate-400/20',
    2: 'shadow-emerald-500/20',
    3: 'shadow-sky-500/20',
    4: 'shadow-fuchsia-500/20',
    5: 'shadow-amber-400/30'
  };
</script>

{#if data}
  <!-- Champion Tooltip (Exact Match to Images 3 & 5) -->
  <div class="w-84 sm:w-96 rounded-2xl bg-[#090C12] border-2 {costBorderColors[data.cost] || 'border-slate-500'} p-4.5 shadow-2xl {costGlowColors[data.cost] || ''} text-white flex flex-col gap-3.5 select-none animate-in fade-in zoom-in-95 duration-100">
    
    <!-- Top Row: Name + Role Tag -->
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-baseline gap-2 overflow-hidden">
        <h3 class="text-xl font-black tracking-tight text-white truncate">
          {data.name_vi || data.name_en}
        </h3>
        {#if data.name_en && data.name_vi !== data.name_en}
          <span class="text-xs text-slate-400 truncate">({data.name_en})</span>
        {/if}
      </div>

      {#if data.role_vi || data.role_en}
        <span class="px-3 py-1 rounded-full bg-[#181D2A] border border-white/10 text-[11px] font-extrabold text-slate-300 shrink-0">
          {data.role_vi || data.role_en}
        </span>
      {/if}
    </div>

    <!-- Traits & Stats Row -->
    <div class="flex items-center justify-between gap-2 text-xs border-b border-white/10 pb-3">
      <!-- Traits List -->
      <div class="flex flex-wrap items-center gap-2">
        {#each (data.traits || []) as trait}
          {@const tIcon = resolveTraitIcon(trait.icon, trait.name_en)}
          <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#121622] border border-white/5 shadow-sm">
            {#if tIcon}
              <img 
                src={tIcon} 
                alt={trait.name_vi || trait.name_en} 
                class="w-4 h-4 object-contain shrink-0" 
                loading="lazy"
                onerror={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (!target.dataset.triedBackup) {
                    target.dataset.triedBackup = 'true';
                    const cleanId = (trait.name_en || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                    target.src = `https://raw.communitydragon.org/latest/game/assets/ux/traiticons/trait_icon_18_${cleanId}.png`;
                  }
                }}
              />
            {/if}
            <span class="font-bold text-slate-200 text-[11px]">{trait.name_vi || trait.name_en}</span>
          </div>
        {/each}
      </div>

      <!-- Range & Cost -->
      <div class="flex items-center gap-2 shrink-0 font-bold text-slate-300">
        {#if data.range}
          <span class="flex items-center gap-1 text-[11px]" title="Tầm đánh: {data.range} ô">
            🏹 {data.range}
          </span>
        {/if}
        <span class="flex items-center gap-1 text-[11px] text-amber-400 font-black">
          🟡 {data.cost}
        </span>
      </div>
    </div>

    <!-- Ability Box -->
    {#if data.ability}
      <div class="rounded-xl bg-[#121622] border border-white/5 p-3 flex flex-col gap-2">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            {#if data.ability.icon}
              {@const abIcon = resolveAbilityIcon(data.ability.icon, data.id)}
              {#if abIcon}
                <img 
                  src={abIcon} 
                  alt={data.ability.name_vi || data.ability.name_en || ''} 
                  class="w-8 h-8 rounded-lg bg-black border border-white/10 object-contain p-0.5 shrink-0 shadow" 
                  loading="lazy"
                  onerror={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              {/if}
            {/if}
            <span class="font-black text-sm text-white">
              {data.ability.name_vi || data.ability.name_en}
            </span>
          </div>

          {#if data.ability.mana}
            <span class="text-xs font-black text-cyan-400 flex items-center gap-1">
              💧 {data.ability.mana}
            </span>
          {/if}
        </div>

        {#if data.ability.desc_vi || data.ability.desc_en}
          <p class="text-xs text-slate-300 leading-relaxed font-normal whitespace-pre-line">
            {(data.ability.desc_vi || data.ability.desc_en || '').replace(/\\n/g, '\n')}
          </p>
        {/if}
      </div>
    {/if}

    <!-- Recommended Items Row (Matching Images 3 & 5) -->
    {#if data.recommendedItems && data.recommendedItems.length > 0}
      <div class="flex flex-col gap-1.5 pt-1">
        <span class="text-[11px] font-black uppercase tracking-wider text-amber-400">
          Recommended Items (Trang Bị Khuyên Dùng)
        </span>
        <div class="flex flex-wrap items-center gap-1.5">
          {#each data.recommendedItems.slice(0, 10) as itId}
            {@const itIcon = resolveItemIcon(null, itId)}
            <div 
              class="w-7.5 h-7.5 rounded-lg bg-black border border-amber-400/40 p-0.5 shadow flex items-center justify-center hover:scale-115 transition-transform"
              title={itId}
            >
              {#if itIcon}
                <img src={itIcon} alt="" class="w-full h-full object-contain rounded-md" loading="lazy" />
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}

  </div>
{/if}
