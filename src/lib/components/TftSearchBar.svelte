<script lang="ts">
  import { resolveChampionIcon, resolveItemIcon, resolveTraitIcon, resolveAugmentIcon } from '$lib/utils/assets';
  import { searchSet18Entities, type Set18SearchEntity } from '$lib/utils/set18-search';
  import { Search, Info, X, CornerDownLeft } from 'lucide-svelte';

  export interface ActiveFilter {
    type: 'unit' | 'item' | 'trait' | 'augment';
    id: string;
    nameVi: string;
    nameEn: string;
    icon?: string;
  }

  interface Props {
    activeFilters: ActiveFilter[];
    onfilterchange: (filters: ActiveFilter[]) => void;
    ontextchange?: (query: string) => void;
  }

  let { activeFilters = [], onfilterchange, ontextchange }: Props = $props();

  let query = $state('');
  let isFocused = $state(false);
  let suggestions = $state<Set18SearchEntity[]>([]);
  let highlightedIndex = $state<number>(-1);
  let searchInputEl = $state<HTMLInputElement | null>(null);
  let dropdownContainerEl = $state<HTMLDivElement | null>(null);
  let searchContainerEl = $state<HTMLDivElement | null>(null);

  function handleInput() {
    ontextchange?.(query);

    const trimmed = query.trim();
    if (!trimmed) {
      suggestions = [];
      highlightedIndex = -1;
      return;
    }

    // Instant local Set 18 in-memory search (0ms latency, zero lag)
    suggestions = searchSet18Entities(trimmed, 10);
    highlightedIndex = suggestions.length > 0 ? 0 : -1;
  }

  function addFilter(item: Set18SearchEntity) {
    const filterItem: ActiveFilter = {
      type: item.entityType || 'item',
      id: item.id,
      nameVi: item.name_vi || item.name_en || item.id,
      nameEn: item.name_en || item.id,
      icon: item.icon
    };

    if (!activeFilters.some((f) => f.id === filterItem.id)) {
      const next = [...activeFilters, filterItem];
      onfilterchange(next);
    }

    query = '';
    ontextchange?.('');
    suggestions = [];
    highlightedIndex = -1;
    isFocused = false;
  }

  function removeFilter(id: string) {
    const next = activeFilters.filter((f) => f.id !== id);
    onfilterchange(next);
  }

  function scrollToHighlighted(index: number) {
    if (!dropdownContainerEl) return;
    const optionEl = dropdownContainerEl.children[index] as HTMLElement;
    if (optionEl && typeof optionEl.scrollIntoView === 'function') {
      optionEl.scrollIntoView({ block: 'nearest' });
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (suggestions.length > 0 && isFocused) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        highlightedIndex = (highlightedIndex + 1) % suggestions.length;
        scrollToHighlighted(highlightedIndex);
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        highlightedIndex = (highlightedIndex - 1 + suggestions.length) % suggestions.length;
        scrollToHighlighted(highlightedIndex);
        return;
      }

      if (e.key === 'Enter') {
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          e.preventDefault();
          addFilter(suggestions[highlightedIndex]);
          return;
        }
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        isFocused = false;
        highlightedIndex = -1;
        return;
      }
    }

    if (e.key === 'Backspace' && query === '' && activeFilters.length > 0) {
      const next = activeFilters.slice(0, -1);
      onfilterchange(next);
    }
  }

  function handleClickOutside(e: MouseEvent) {
    if (searchContainerEl && !searchContainerEl.contains(e.target as Node)) {
      isFocused = false;
      highlightedIndex = -1;
    }
  }

  function resolveIcon(item: any): string {
    const icon = item.icon || item.iconUrl;
    if (item.type === 'unit' || item.entityType === 'unit') return resolveChampionIcon(icon, item.id);
    if (item.type === 'trait' || item.entityType === 'trait') return resolveTraitIcon(icon, item.name_en || item.id);
    if (item.type === 'augment' || item.entityType === 'augment') return resolveAugmentIcon(icon, item.id);
    return resolveItemIcon(icon, item.id);
  }
</script>

<svelte:window onclick={handleClickOutside} />

<div bind:this={searchContainerEl} class="relative select-none">
  <!-- Pill Search Bar (Matching Screenshot 4) -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div 
    class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#121620] border {isFocused ? 'border-amber-400/80 ring-1 ring-amber-400/30' : 'border-white/10'} transition-all min-w-[200px] sm:min-w-[280px] max-w-[420px] shadow-inner cursor-text"
    onclick={() => searchInputEl?.focus()}
  >
    <!-- Filter Chips inside Search Bar (Screenshot 4) -->
    {#each activeFilters as filter (filter.id)}
      {@const iconSrc = resolveIcon(filter)}
      <button 
        type="button"
        onclick={(e) => { e.stopPropagation(); removeFilter(filter.id); }}
        class="flex items-center gap-1 pl-1 pr-1.5 py-0.5 rounded-full bg-black/80 border border-amber-400/60 hover:border-rose-500 hover:bg-rose-500/20 transition-all text-xs cursor-pointer group"
        title="Gỡ bỏ {filter.nameVi}"
      >
        {#if iconSrc}
          <img src={iconSrc} alt="" class="w-4 h-4 rounded-full object-cover" />
        {/if}
        <span class="text-[11px] font-bold text-amber-300 group-hover:text-rose-300 max-w-[90px] truncate">
          {filter.nameVi}
        </span>
        <X class="w-3 h-3 text-slate-400 group-hover:text-rose-300" />
      </button>
    {/each}

    <!-- Search Text Input (instant Set 18 search + Vietnamese accent-free) -->
    <input 
      bind:this={searchInputEl}
      type="text"
      bind:value={query}
      oninput={handleInput}
      onkeydown={handleKeydown}
      onfocus={() => {
        isFocused = true;
        if (query.trim()) handleInput();
      }}
      placeholder={activeFilters.length === 0 ? "Search tướng, đồ, lõi..." : ""}
      class="flex-1 bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none min-w-[70px]"
    />

    <!-- Info (i) icon on the right -->
    <div class="text-slate-400 hover:text-slate-200 transition-colors ml-auto shrink-0" title="Tìm tướng, trang bị, tộc hệ hoặc lõi mùa 18 để lọc">
      <Info class="w-3.5 h-3.5" />
    </div>
  </div>

  <!-- Search Dropdown Popover with Arrow Key Navigation -->
  {#if isFocused && query.trim() !== ''}
    <div 
      bind:this={dropdownContainerEl}
      class="absolute right-0 sm:left-0 top-full mt-2 z-50 w-72 sm:w-84 rounded-2xl bg-[#0E1015] border border-white/10 shadow-2xl p-1.5 max-h-84 overflow-y-auto flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100"
    >
      {#if suggestions.length > 0}
        {#each suggestions as item, idx}
          {@const iconSrc = resolveIcon(item)}
          {@const isHighlighted = idx === highlightedIndex}
          <button
            type="button"
            onmousedown={(e) => { e.preventDefault(); addFilter(item); }}
            onmouseenter={() => (highlightedIndex = idx)}
            class="flex items-center justify-between w-full p-2 rounded-xl text-left transition-all cursor-pointer group {isHighlighted ? 'bg-[#1E2538] border border-amber-400/50 shadow-md ring-1 ring-amber-400/20' : 'hover:bg-[#161B28] border border-transparent'}"
          >
            <div class="flex items-center gap-2.5 overflow-hidden">
              <!-- Icon -->
              <div class="w-8 h-8 rounded-lg bg-black border border-white/10 overflow-hidden shrink-0 flex items-center justify-center shadow">
                {#if iconSrc}
                  <img src={iconSrc} alt="" class="w-full h-full object-cover" />
                {:else}
                  <Search class="w-4 h-4 text-slate-500" />
                {/if}
              </div>

              <!-- Name & Type badge -->
              <div class="flex flex-col overflow-hidden">
                <span class="font-bold text-xs {isHighlighted ? 'text-amber-300' : 'text-white'} group-hover:text-amber-400 transition-colors truncate">
                  {item.name_vi || item.name_en || item.id}
                </span>
                <div class="flex items-center gap-1.5">
                  <span class="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded {item.entityType === 'unit' ? 'bg-amber-400/10 text-amber-300' : item.entityType === 'item' ? 'bg-sky-400/10 text-sky-300' : item.entityType === 'trait' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-purple-400/10 text-purple-300'}">
                    {item.entityType === 'unit' ? 'Tướng' : item.entityType === 'item' ? 'Trang bị' : item.entityType === 'trait' ? 'Tộc/Hệ' : 'Lõi'}
                  </span>
                  {#if item.name_en && item.name_en !== item.name_vi}
                    <span class="text-[10px] text-slate-400 truncate">
                      {item.name_en}
                    </span>
                  {/if}
                </div>
              </div>
            </div>

            <!-- Enter key prompt when highlighted -->
            {#if isHighlighted}
              <div class="shrink-0 flex items-center gap-1 text-[10px] text-amber-300 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.5 rounded font-bold animate-in fade-in duration-100">
                <span>Chọn</span>
                <CornerDownLeft class="w-2.5 h-2.5" />
              </div>
            {/if}
          </button>
        {/each}
      {:else}
        <div class="p-4 text-center text-xs text-slate-500">
          Không tìm thấy thực thể Mùa 18 phù hợp.
        </div>
      {/if}
    </div>
  {/if}
</div>
