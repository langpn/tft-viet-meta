<script lang="ts">
  import { getTooltipState } from '$lib/utils/tooltip-store.svelte';
  import ChampionTooltipCard from './ChampionTooltipCard.svelte';
  import ItemTooltipCard from './ItemTooltipCard.svelte';
  import AugmentTooltipCard from './AugmentTooltipCard.svelte';
  import TraitTooltipCard from './TraitTooltipCard.svelte';

  const state = $derived(getTooltipState());
</script>

{#if state.visible && (state.data || state.loading)}
  <div 
    class="fixed z-[9999] pointer-events-none transition-all duration-100 ease-out"
    style="left: {state.x}px; top: {state.y}px; transform: translate(-50%, {state.placement === 'top' ? '-100%' : '0'});"
  >
    {#if state.loading}
      <div class="px-4 py-2.5 rounded-xl bg-[#090C12] border border-white/20 text-xs text-amber-400 font-bold shadow-2xl animate-pulse">
        Đang tải thông tin...
      </div>
    {:else if state.data}
      {#if state.type === 'champion' || state.data.entityType === 'champion'}
        <ChampionTooltipCard data={state.data} />
      {:else if state.type === 'item' || state.data.entityType === 'item'}
        <ItemTooltipCard data={state.data} />
      {:else if state.type === 'augment' || state.data.entityType === 'augment'}
        <AugmentTooltipCard data={state.data} />
      {:else if state.type === 'trait' || state.data.entityType === 'trait'}
        <TraitTooltipCard data={state.data} />
      {/if}
    {/if}
  </div>
{/if}
