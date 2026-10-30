<script lang="ts">
  import { Search, X, Shield, Users, Sparkles, Flame } from 'lucide-svelte';

  export interface FilterItem {
    type: 'u' | 'i' | 't' | 'a';
    id: string;
    nameVi: string;
    nameEn: string;
    icon?: string;
  }

  interface Props {
    selectedFilters: FilterItem[];
    onadd: (item: FilterItem) => void;
    onremove: (index: number) => void;
    onclear: () => void;
  }

  let { selectedFilters = [], onadd, onremove, onclear }: Props = $props();

  let query = $state('');
  let isFocused = $state(false);
  let suggestions = $state<any[]>([]);
  let isLoading = $state(false);
  let debounceTimer: any = null;

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
    }, 150);
  }

  function selectSuggestion(item: any) {
    const typeMap: Record<string, 'u' | 'i' | 't' | 'a'> = {
      unit: 'u',
      champion: 'u',
      item: 'i',
      trait: 't',
      augment: 'a'
    };

    onadd({
      type: typeMap[item.entityType] || 'u',
      id: item.id,
      nameVi: item.titleVi || item.name_vi || item.titleEn,
      nameEn: item.titleEn || item.name_en || item.id,
      icon: item.iconUrl || item.icon
    });

    query = '';
    suggestions = [];
    isFocused = false;
  }

  const categoryIcons: Record<string, any> = {
    u: Users,
    i: Shield,
    t: Flame,
    a: Sparkles
  };

  const categoryLabels: Record<string, string> = {
    u: 'Tướng',
    i: 'Trang bị',
    t: 'Tộc/Hệ',
    a: 'Lõi'
  };

  const categoryColors: Record<string, string> = {
    u: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    i: 'border-sky-500/30 bg-sky-500/10 text-sky-400',
    t: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    a: 'border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-400'
  };
</script>

<div class="flex flex-col gap-3 w-full">
  <!-- Search Input Container -->
  <div class="relative w-full">
    <div class="relative flex items-center">
      <Search class="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none" />
      <input 
        type="text"
        bind:value={query}
        oninput={handleInput}
        onfocus={() => (isFocused = true)}
        onblur={() => setTimeout(() => (isFocused = false), 200)}
        placeholder="Gõ tìm Tướng, Trang bị, Tộc hệ hoặc Lõi để lọc (vd: Ahri, Vô Cực, Thần Rừng)..."
        class="w-full pl-11 pr-4 py-3 rounded-xl bg-[#141A26] border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all shadow-inner"
      />
      {#if isLoading}
        <span class="absolute right-4 text-xs text-slate-500 animate-pulse">Đang tìm...</span>
      {/if}
    </div>

    <!-- Autocomplete Dropdown Popover -->
    {#if isFocused && suggestions.length > 0}
      <div class="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl bg-[#0F131C] border border-white/15 shadow-2xl overflow-hidden max-h-72 overflow-y-auto divide-y divide-white/5">
        {#each suggestions as item}
          <button
            type="button"
            onmousedown={() => selectSuggestion(item)}
            class="w-full flex items-center justify-between p-3 hover:bg-[#1C2333] transition-colors text-left cursor-pointer group"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-black/60 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                {#if item.iconUrl || item.icon}
                  <img 
                    src={(item.iconUrl || item.icon).startsWith('http') ? (item.iconUrl || item.icon) : `https://assets.tftacademy.com/${item.entityType === 'item' ? 'items' : item.entityType === 'augment' ? 'augments' : 'champions/champion_icons'}/${item.iconUrl || item.icon}`} 
                    alt="" 
                    class="w-full h-full object-cover" 
                  />
                {:else}
                  <Search class="w-4 h-4 text-slate-500" />
                {/if}
              </div>

              <div class="flex flex-col">
                <span class="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">
                  {item.titleVi || item.name_vi || item.titleEn}
                </span>
                {#if item.titleEn && item.titleVi !== item.titleEn}
                  <span class="text-[11px] text-slate-400">{item.titleEn}</span>
                {/if}
              </div>
            </div>

            <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
              {item.entityType}
            </span>
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Active Filter Chips -->
  {#if selectedFilters.length > 0}
    <div class="flex flex-wrap items-center gap-2 pt-1">
      <span class="text-xs font-bold text-slate-400 mr-1">Bộ lọc ({selectedFilters.length}):</span>
      {#each selectedFilters as filter, index}
        {@const IconComponent = categoryIcons[filter.type] || Users}
        <div class="flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold shadow-sm {categoryColors[filter.type]}">
          <IconComponent class="w-3.5 h-3.5" />
          <span>{filter.nameVi}</span>
          <button 
            type="button" 
            onclick={() => onremove(index)}
            aria-label="Gỡ bỏ {filter.nameVi}"
            class="ml-1 hover:text-white transition-colors cursor-pointer"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
      {/each}

      <button 
        type="button"
        onclick={onclear}
        class="text-xs text-rose-400 hover:text-rose-300 font-bold ml-2 cursor-pointer transition-colors"
      >
        Xóa tất cả
      </button>
    </div>
  {/if}
</div>
