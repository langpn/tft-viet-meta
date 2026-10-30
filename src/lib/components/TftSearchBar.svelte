<script lang="ts">
  import { resolveChampionIcon, resolveItemIcon, resolveTraitIcon, resolveAugmentIcon } from '$lib/utils/assets';
  import { Search, Info, X } from 'lucide-svelte';

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
  }

  let { activeFilters = [], onfilterchange }: Props = $props();

  let query = $state('');
  let isFocused = $state(false);
  let suggestions = $state<any[]>([]);
  let isLoading = $state(false);
  let debounceTimer: any = null;
  let searchInputEl: HTMLInputElement | null = null;

  async function handleInput() {
    clearTimeout(debounceTimer);
    if (!query.trim()) {
      suggestions = [];
      return;
    }

    debounceTimer = setTimeout(async () => {
      isLoading = true;
      try {
        const res = await fetch(`/api/options?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        suggestions = data.results || [];
      } catch (e) {
        suggestions = [];
      } finally {
        isLoading = false;
      }
    }, 120);
  }

  function addFilter(item: any) {
    const filterItem: ActiveFilter = {
      type: item.entityType || 'item',
      id: item.id,
      nameVi: item.name_vi || item.titleVi || item.name_en || item.id,
      nameEn: item.name_en || item.titleEn || item.id,
      icon: item.icon || item.iconUrl
    };

    if (!activeFilters.some(f => f.id === filterItem.id)) {
      const next = [...activeFilters, filterItem];
      onfilterchange(next);
    }

    query = '';
    suggestions = [];
    isFocused = false;
  }

  function removeFilter(id: string) {
    const next = activeFilters.filter(f => f.id !== id);
    onfilterchange(next);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Backspace' && query === '' && activeFilters.length > 0) {
      const next = activeFilters.slice(0, -1);
      onfilterchange(next);
    }
  }

  function resolveIcon(item: any): string {
    const icon = item.icon || item.iconUrl;
    if (item.entityType === 'unit') return resolveChampionIcon(icon, item.id);
    if (item.entityType === 'trait') return resolveTraitIcon(icon, item.id);
    if (item.entityType === 'augment') return resolveAugmentIcon(icon, item.id);
    return resolveItemIcon(icon, item.id);
  }
</script>

<div class="relative select-none">
  <!-- Pill Search Bar (Matching Screenshot 4) -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div 
    class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#121620] border {isFocused ? 'border-amber-400/80 ring-1 ring-amber-400/30' : 'border-white/10'} transition-all min-w-[200px] sm:min-w-[260px] max-w-[380px] shadow-inner cursor-text"
    onclick={() => searchInputEl?.focus()}
  >
    <!-- Filter Chips inside Search Bar (as shown in Screenshot 4: Draven + Emblem chips) -->
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
        <span class="text-[11px] font-bold text-amber-300 group-hover:text-rose-300 max-w-[80px] truncate">
          {filter.nameVi}
        </span>
        <X class="w-3 h-3 text-slate-400 group-hover:text-rose-300" />
      </button>
    {/each}

    <!-- Search Text Input -->
    <input 
      bind:this={searchInputEl}
      type="text"
      bind:value={query}
      oninput={handleInput}
      onkeydown={handleKeydown}
      onfocus={() => (isFocused = true)}
      onblur={() => setTimeout(() => (isFocused = false), 250)}
      placeholder={activeFilters.length === 0 ? "Search..." : ""}
      class="flex-1 bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none min-w-[60px]"
    />

    <!-- Info (i) icon on the right (as seen in Screenshot 3 & 4) -->
    <div class="text-slate-400 hover:text-slate-200 transition-colors ml-auto shrink-0" title="Tìm tướng, trang bị, tộc hệ hoặc lõi để lọc">
      <Info class="w-3.5 h-3.5" />
    </div>
  </div>

  <!-- Search Dropdown Popover (Matching Screenshot 3 exactly!) -->
  {#if isFocused && (suggestions.length > 0 || query.trim() !== '')}
    <div class="absolute right-0 sm:left-0 top-full mt-2 z-50 w-72 sm:w-80 rounded-2xl bg-[#0E1015] border border-white/10 shadow-2xl p-1.5 max-h-80 overflow-y-auto flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-150">
      {#if isLoading}
        <div class="p-4 text-center text-xs text-slate-400 animate-pulse">
          Đang tìm kiếm...
        </div>
      {:else if suggestions.length > 0}
        {#each suggestions as item}
          {@const iconSrc = resolveIcon(item)}
          <button
            type="button"
            onmousedown={() => addFilter(item)}
            class="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-[#1A2030] text-left transition-colors cursor-pointer group"
          >
            <!-- Icon -->
            <div class="w-8 h-8 rounded-lg bg-black border border-white/10 overflow-hidden shrink-0 flex items-center justify-center shadow">
              {#if iconSrc}
                <img src={iconSrc} alt="" class="w-full h-full object-cover" />
              {:else}
                <Search class="w-4 h-4 text-slate-500" />
              {/if}
            </div>

            <!-- Name (Vietnamese + English) -->
            <div class="flex flex-col overflow-hidden">
              <span class="font-bold text-xs text-white group-hover:text-amber-400 transition-colors truncate">
                {item.name_vi || item.titleVi || item.name_en || item.id}
              </span>
              {#if (item.name_en || item.titleEn) && (item.name_en || item.titleEn) !== (item.name_vi || item.titleVi)}
                <span class="text-[10px] text-slate-400 truncate">
                  {item.name_en || item.titleEn}
                </span>
              {/if}
            </div>
          </button>
        {/each}
      {:else}
        <div class="p-4 text-center text-xs text-slate-500">
          Không tìm thấy thực thể phù hợp.
        </div>
      {/if}
    </div>
  {/if}
</div>
