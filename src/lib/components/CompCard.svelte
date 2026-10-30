<script lang="ts">
  import HexAvatar from './HexAvatar.svelte';
  import CompModal from './CompModal.svelte';
  import { TrendingUp, TrendingDown, Sparkles, ChevronRight } from 'lucide-svelte';

  interface Props {
    comp: any;
  }

  let { comp }: Props = $props();
  let showModal = $state(false);

  const tierGradients: Record<string, string> = {
    S: 'from-rose-500/10 via-[#131722] to-[#131722] border-rose-500/30 hover:border-rose-500/60',
    A: 'from-orange-500/10 via-[#131722] to-[#131722] border-orange-500/30 hover:border-orange-500/60',
    B: 'from-amber-500/10 via-[#131722] to-[#131722] border-amber-500/30 hover:border-amber-500/60',
    C: 'from-lime-500/10 via-[#131722] to-[#131722] border-lime-500/30 hover:border-lime-500/60',
    X: 'from-amber-700/10 via-[#131722] to-[#131722] border-amber-700/30 hover:border-amber-700/60'
  };
</script>

<div 
  class="relative rounded-2xl bg-gradient-to-b {tierGradients[comp.tier] || 'from-slate-800/20 via-[#131722] to-[#131722] border-white/10'} border p-4.5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between gap-4 cursor-pointer group"
  onclick={() => (showModal = true)}
  role="button"
  tabindex="0"
  onkeydown={(e) => { if (e.key === 'Enter') showModal = true; }}
>
  <!-- Card Header: Title & Badges -->
  <div class="flex items-start justify-between gap-2">
    <div class="flex flex-col gap-0.5">
      <div class="flex items-center gap-2">
        <h3 class="font-extrabold text-base md:text-lg tracking-tight text-white group-hover:text-amber-400 transition-colors">
          {comp.title}
        </h3>
        
        <!-- Trend Badge -->
        {#if comp.trend === 'Rising'}
          <span class="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
            <TrendingUp class="w-3 h-3" /> Tăng
          </span>
        {:else if comp.trend === 'Falling'}
          <span class="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black uppercase tracking-wider">
            <TrendingDown class="w-3 h-3" /> Giảm
          </span>
        {:else if comp.trend === 'New'}
          <span class="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider">
            <Sparkles class="w-3 h-3" /> Mới
          </span>
        {/if}
      </div>

      {#if comp.metaTitle && comp.metaTitle !== comp.title}
        <span class="text-xs text-slate-400 font-medium truncate max-w-[280px]">
          {comp.metaTitle}
        </span>
      {/if}
    </div>

    <!-- Style Pill -->
    {#if comp.compStyle}
      <span class="px-2.5 py-0.5 rounded-full bg-black/40 border border-white/10 text-[11px] font-semibold text-slate-300 shrink-0">
        {comp.compStyle}
      </span>
    {/if}
  </div>

  <!-- Core Units Showcase: Carry & Tank & Supporting Lineup -->
  <div class="flex flex-wrap items-center gap-4 py-1">
    
    <!-- Main Carry with 3 BIS items -->
    {#if comp.mainCarry}
      <div class="flex flex-col items-center">
        <HexAvatar 
          name={comp.mainCarry.name}
          nameVi={comp.mainCarry.nameVi}
          iconUrl={comp.mainCarry.iconUrl}
          cost={comp.mainCarry.cost}
          starLevel={comp.mainCarry.starLevel || 2}
          items={comp.mainCarry.items}
          size="md"
          showName={true}
        />
      </div>
    {/if}

    <!-- Main Tank with 3 Items -->
    {#if comp.mainTank}
      <div class="flex flex-col items-center">
        <HexAvatar 
          name={comp.mainTank.name}
          nameVi={comp.mainTank.nameVi}
          iconUrl={comp.mainTank.iconUrl}
          cost={comp.mainTank.cost}
          starLevel={comp.mainTank.starLevel || 2}
          items={comp.mainTank.items}
          size="md"
          showName={true}
        />
      </div>
    {/if}

    <!-- Divider -->
    <div class="hidden sm:block w-px h-10 bg-white/10"></div>

    <!-- Supporting Units in line -->
    {#if comp.units && comp.units.length > 0}
      <div class="flex flex-wrap items-center gap-1.5 flex-1">
        {#each comp.units.slice(0, 6) as unit}
          {#if unit.id !== comp.mainCarry?.id && unit.id !== comp.mainTank?.id}
            <HexAvatar 
              name={unit.name}
              nameVi={unit.nameVi}
              iconUrl={unit.iconUrl}
              cost={unit.cost}
              starLevel={unit.starLevel}
              items={unit.items}
              size="sm"
            />
          {/if}
        {/each}
      </div>
    {/if}
  </div>

  <!-- Card Footer: Active Traits and View Guide Trigger -->
  <div class="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-400">
    <div class="flex items-center gap-1.5 overflow-hidden">
      {#if comp.traits && comp.traits.length > 0}
        {#each comp.traits.slice(0, 4) as trait}
          <span class="px-2 py-0.5 rounded bg-white/5 text-[10px] font-semibold text-slate-300">
            {trait.name}
          </span>
        {/each}
      {/if}
    </div>

    <span class="flex items-center gap-1 text-amber-400 font-bold group-hover:translate-x-1 transition-transform text-xs">
      Xem giáo án <ChevronRight class="w-3.5 h-3.5" />
    </span>
  </div>
</div>

<!-- Modal Popup -->
<CompModal comp={comp} open={showModal} onclose={() => (showModal = false)} />
