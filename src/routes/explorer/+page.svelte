<script lang="ts">
  import type { PageData } from './$types';
  import { onMount } from 'svelte';
  import { resolveChampionIcon, resolveItemIcon, resolveTraitIcon, resolveAugmentIcon } from '$lib/utils/assets';
  import { matchesQuery } from '$lib/utils/search';
  import { showTooltip, hideTooltip } from '$lib/utils/tooltip-store.svelte';
  import { 
    Search, X, Shield, Users, Sparkles, Flame, ArrowUpDown, 
    TrendingDown, TrendingUp, ChevronDown, Plus, ExternalLink, SlidersHorizontal 
  } from 'lucide-svelte';

  export interface ActiveFilter {
    type: 'u' | 'i' | 't' | 'a';
    id: string;
    nameVi: string;
    nameEn: string;
    icon?: string;
    cost?: number;
    starLevel?: number; // 0 = Any, 1 = 1★, 2 = 2★, 3 = 3★
    tier?: number; // Trait tier breakpoint
    userUnitId?: string; // which filtered champion holds this item
  }

  let { data }: { data: PageData } = $props();

  let selectedPatch = $state('16212');
  let selectedRank = $state('1');
  let minSampleSize = $state(100);
  let activeTab = $state<'units' | 'traits' | 'items'>((data.initialTab as any) || 'units');
  let splitByStarLevel = $state(false);
  let tableSearchQuery = $state('');

  function selectTab(tab: 'units' | 'traits' | 'items') {
    activeTab = tab;
    sortColumn = 'games';
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      history.replaceState({}, '', url);
    }
  }

  let selectedFilters = $state<ActiveFilter[]>([]);
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let explorerData = $state<any>(data.initialData || null);

  let sortColumn = $state<string>('games');
  let sortDirection = $state<'asc' | 'desc'>('desc');

  // Next filter search popover state
  let showAddFilterPopover = $state(false);
  let filterSearchQuery = $state('');
  let filterSuggestions = $state<any[]>([]);
  let filterLoading = $state(false);
  let debounceTimer: any = null;

  const costBorderColors: Record<number, string> = {
    1: 'border-slate-400',
    2: 'border-emerald-500',
    3: 'border-sky-500',
    4: 'border-fuchsia-500',
    5: 'border-amber-400'
  };

  const patchOptions = [
    { value: '16212', label: 'Patch 18.5c' },
    { value: '16211', label: 'Patch 18.5b' }
  ];

  const rankOptions = [
    { value: '4', label: 'Grandmaster+' },
    { value: '0', label: 'Master+' },
    { value: '1', label: 'Diamond+' },
    { value: '2', label: 'Emerald+' },
    { value: '3', label: 'Platinum+' }
  ];

  const minSampleOptions = [10, 50, 100, 200, 500, 1000];

  // Convert filter stack into tactics.tools query token string
  const tokenString = $derived.by(() => {
    if (selectedFilters.length === 0) return '0';
    return selectedFilters.map(f => {
      if (f.type === 'u') {
        return `u-${f.id}-${f.starLevel ?? 0}`;
      }
      if (f.type === 'i') {
        if (f.userUnitId) {
          return `u-${f.userUnitId}-0-${f.id}`;
        }
        return `1-${f.id}`;
      }
      if (f.type === 't') {
        return `t-${f.id}-${f.tier || 1}`;
      }
      if (f.type === 'a') {
        return `a-${f.id}-1`;
      }
      return '';
    }).filter(Boolean).join('/');
  });

  async function fetchExplorerData() {
    isLoading = true;
    error = null;
    try {
      const p = new URLSearchParams({
        patch: selectedPatch,
        rank: selectedRank
      });
      if (tokenString && tokenString !== '0') {
        p.set('tokens', tokenString);
      }

      const res = await fetch(`/api/explorer?${p}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      explorerData = data;
    } catch (e: any) {
      error = e.message || 'Không thể tải dữ liệu Explorer';
      explorerData = null;
    } finally {
      isLoading = false;
    }
  }

  function addFilterFromSearch(item: any) {
    const typeMap: Record<string, 'u' | 'i' | 't' | 'a'> = {
      unit: 'u',
      champion: 'u',
      item: 'i',
      trait: 't',
      augment: 'a'
    };

    const type = typeMap[item.entityType] || 'u';
    const filterItem: ActiveFilter = {
      type,
      id: item.id,
      nameVi: item.titleVi || item.name_vi || item.name_en || item.id,
      nameEn: item.titleEn || item.name_en || item.id,
      icon: item.iconUrl || item.icon,
      cost: item.cost || 1,
      starLevel: 0,
      userUnitId: type === 'i' ? (selectedFilters.find(f => f.type === 'u')?.id || '') : undefined
    };

    if (!selectedFilters.some(f => f.id === filterItem.id && f.type === filterItem.type)) {
      selectedFilters = [...selectedFilters, filterItem];
      fetchExplorerData();
    }

    showAddFilterPopover = false;
    filterSearchQuery = '';
    filterSuggestions = [];
  }

  function addRowToFilter(row: any) {
    const type: 'u' | 'i' | 't' | 'a' = activeTab === 'units' ? 'u' : activeTab === 'items' ? 'i' : 't';
    const filterItem: ActiveFilter = {
      type,
      id: row.id || row.itemId,
      nameVi: row.nameVi,
      nameEn: row.nameEn,
      icon: row.icon,
      cost: row.cost || 1,
      starLevel: row.star || 0,
      tier: row.tier || 1,
      userUnitId: type === 'i' ? (row.unitId || selectedFilters.find(f => f.type === 'u')?.id || '') : undefined
    };

    if (!selectedFilters.some(f => f.id === filterItem.id && f.type === filterItem.type && (type !== 't' || f.tier === filterItem.tier))) {
      selectedFilters = [...selectedFilters, filterItem];
      fetchExplorerData();
    }
  }

  function removeFilter(index: number) {
    selectedFilters = selectedFilters.filter((_, i) => i !== index);
    fetchExplorerData();
  }

  function clearAllFilters() {
    selectedFilters = [];
    fetchExplorerData();
  }

  function updateStarLevel(index: number, level: number) {
    selectedFilters[index].starLevel = level;
    fetchExplorerData();
  }

  function updateUserUnit(index: number, unitId: string) {
    selectedFilters[index].userUnitId = unitId;
    fetchExplorerData();
  }

  async function handleFilterSearchInput() {
    clearTimeout(debounceTimer);
    if (!filterSearchQuery.trim()) {
      filterSuggestions = [];
      return;
    }
    debounceTimer = setTimeout(async () => {
      filterLoading = true;
      try {
        const res = await fetch(`/api/options?q=${encodeURIComponent(filterSearchQuery.trim())}`);
        const data = await res.json();
        filterSuggestions = data.results || [];
      } catch (e) {
        filterSuggestions = [];
      } finally {
        filterLoading = false;
      }
    }, 120);
  }

  function toggleSort(col: string) {
    if (sortColumn === col) {
      sortDirection = sortDirection === 'desc' ? 'asc' : 'desc';
    } else {
      sortColumn = col;
      sortDirection = 'desc';
    }
  }

  // Filter & sort data table rows (Matching Screenshot 2 & 3)
  const sortedTableData = $derived.by(() => {
    if (!explorerData) return [];
    
    let rawList: any[] = [];
    if (activeTab === 'units') {
      rawList = splitByStarLevel ? (explorerData.starUnits || []) : (explorerData.units || []);
    } else if (activeTab === 'items') {
      rawList = explorerData.items || [];
    } else if (activeTab === 'traits') {
      rawList = explorerData.traits || [];
    }

    // Filter by minSampleSize and search text
    const filtered = rawList.filter((row: any) => {
      const matchSample = (row.games ?? 0) >= minSampleSize;
      const matchSearch = matchesQuery(row.nameVi, tableSearchQuery) || 
                          matchesQuery(row.nameEn, tableSearchQuery) ||
                          matchesQuery(row.unitName, tableSearchQuery);
      return matchSample && matchSearch;
    });

    // Sort
    filtered.sort((a, b) => {
      let valA = a[sortColumn] ?? 0;
      let valB = b[sortColumn] ?? 0;
      return sortDirection === 'desc' ? valB - valA : valA - valB;
    });

    return filtered;
  });

  function formatGames(count: number): string {
    if (!count) return '0';
    if (count >= 1_000_000) return (count / 1_000_000).toFixed(1) + 'm';
    if (count >= 1_000) return (count / 1_000).toFixed(1) + 'k';
    return count.toLocaleString('vi-VN');
  }

  function resolveRowIcon(row: any): string {
    if (activeTab === 'units') return resolveChampionIcon(row.icon, row.id);
    if (activeTab === 'items') return resolveItemIcon(row.icon, row.itemId || row.id);
    if (activeTab === 'traits') return resolveTraitIcon(row.icon, row.nameEn);
    return resolveAugmentIcon(row.icon, row.id);
  }

  onMount(() => {
    if (!explorerData) {
      fetchExplorerData();
    }
  });
</script>

<svelte:head>
  <title>Khám Phá Thống Kê Meta ĐTCL Mùa 18 (tactics.tools Live) · TFT Academy VI</title>
  <meta name="title" content="Khám Phá Thống Kê Meta ĐTCL Mùa 18 (tactics.tools Live) · TFT Academy VI" />
  <meta name="description" content="Công cụ tra cứu số liệu thống kê thời gian thực từ hơn 750k trận đấu ĐTCL Mùa 18 từ tactics.tools: tỷ lệ thắng, tỷ lệ top 4, delta, số trận cho từng tướng, tộc hệ và trang bị." />
  <meta property="og:title" content="Khám Phá Thống Kê Meta ĐTCL Mùa 18 · tactics.tools Live" />
  <meta property="og:description" content="Tra cứu số liệu thống kê thời gian thực từ hơn 750k trận đấu ĐTCL Mùa 18." />
  <meta property="og:url" content="https://tft.langpn.xyz/explorer" />
  <link rel="canonical" href="https://tft.langpn.xyz/explorer" />
</svelte:head>

<div class="flex flex-col gap-5 pb-20 select-none">
  
  <!-- Top Navigation Header (Matching Screenshot 2: Stats Explorer + Patch & Rank) -->
  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1A2E4C] pb-3">
    <div class="flex items-center gap-3">
      <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
        Khám Phá Thống Kê (Stats Explorer)
        <span class="sr-only">Thống Kê Meta ĐTCL Mùa 18 tactics.tools Live</span>
      </h1>
      <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">
        tactics.tools live
      </span>
    </div>

    <!-- Dropdowns: Patch & Rank (Screenshot 2 & 3) -->
    <div class="flex items-center gap-3 self-end sm:self-auto text-xs font-bold">
      <!-- Patch Selector -->
      <div class="flex items-center gap-1.5 border-b-2 border-white/40 pb-0.5 hover:border-sky-400 transition-colors">
        <span class="text-slate-400">Bản</span>
        <select 
          bind:value={selectedPatch} 
          onchange={fetchExplorerData}
          class="bg-transparent text-white font-extrabold focus:outline-none cursor-pointer"
        >
          {#each patchOptions as p}
            <option value={p.value} class="bg-[#0B1528] text-white">{p.label}</option>
          {/each}
        </select>
      </div>

      <!-- Rank Selector -->
      <div class="flex items-center gap-1.5 border-b-2 border-white/40 pb-0.5 hover:border-sky-400 transition-colors">
        <span class="text-slate-400">Bậc rank</span>
        <select 
          bind:value={selectedRank} 
          onchange={fetchExplorerData}
          class="bg-transparent text-white font-extrabold focus:outline-none cursor-pointer"
        >
          {#each rankOptions as r}
            <option value={r.value} class="bg-[#0B1528] text-white">{r.label}</option>
          {/each}
        </select>
      </div>
    </div>
  </div>

  <!-- Main 2-Column Explorer Interface (Exact Match to Screenshots 2 & 3) -->
  <div class="flex flex-col lg:flex-row items-start gap-4">
    
    <!-- LEFT SIDEBAR: Filter Stack (Width ~300px, Matching Screenshot 2 & 3) -->
    <div class="w-full lg:w-76 shrink-0 flex flex-col gap-3">
      
      <!-- Filter Cards List -->
      {#each selectedFilters as filter, idx}
        {@const iconSrc = filter.type === 'u' ? resolveChampionIcon(filter.icon, filter.id) : 
                          filter.type === 'i' ? resolveItemIcon(filter.icon, filter.id) : 
                          filter.type === 't' ? resolveTraitIcon(filter.icon, filter.nameEn) : 
                          resolveAugmentIcon(filter.icon, filter.id)}
        
        <div class="p-3 rounded-xl bg-[#0F1E36] border border-[#1C355E] flex flex-col gap-2.5 shadow-lg relative group">
          
          <!-- Top Row: Icon + Name + Remove Button -->
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2.5 overflow-hidden">
              <div class="w-8 h-8 rounded-md bg-black border-2 {costBorderColors[filter.cost || 1] || 'border-slate-500'} overflow-hidden shrink-0 flex items-center justify-center shadow">
                {#if iconSrc}
                  <img src={iconSrc} alt="" class="w-full h-full object-cover" />
                {/if}
              </div>
              <span class="font-bold text-xs text-white truncate">{filter.nameVi || filter.nameEn}</span>
            </div>

            <button 
              type="button" 
              onclick={() => removeFilter(idx)}
              class="text-slate-400 hover:text-rose-400 p-1 rounded-md transition-colors cursor-pointer"
              title="Xóa bộ lọc"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Sub Controls (Star Level for Champion, User for Item) -->
          {#if filter.type === 'u'}
            <div class="flex items-center justify-between gap-2 pt-1 border-t border-white/5 text-xs">
              <span class="text-[11px] text-slate-400 font-medium">Số sao</span>
              <select 
                value={filter.starLevel ?? 0}
                onchange={(e) => updateStarLevel(idx, Number((e.target as HTMLSelectElement).value))}
                class="bg-[#0A1628] border border-white/10 rounded-md px-2 py-0.5 text-xs text-amber-400 font-bold focus:outline-none cursor-pointer"
              >
                <option value={0}>Tất cả sao</option>
                <option value={1}>1★</option>
                <option value={2}>2★</option>
                <option value={3}>3★</option>
              </select>
            </div>
          {:else if filter.type === 'i'}
            {@const filteredChamps = selectedFilters.filter(f => f.type === 'u')}
            <div class="flex items-center justify-between gap-2 pt-1 border-t border-white/5 text-xs">
              <span class="text-[11px] text-slate-400 font-medium">Tướng cầm</span>
              <select 
                value={filter.userUnitId || ''}
                onchange={(e) => updateUserUnit(idx, (e.target as HTMLSelectElement).value)}
                class="bg-[#0A1628] border border-white/10 rounded-md px-2 py-0.5 text-xs text-sky-400 font-bold focus:outline-none cursor-pointer max-w-[130px] truncate"
              >
                <option value="">Bất kỳ ai</option>
                {#each filteredChamps as champ}
                  <option value={champ.id}>{champ.nameVi || champ.nameEn}</option>
                {/each}
              </select>
            </div>
          {/if}

        </div>
      {/each}

      <!-- Next Filter Button Slot (Matching Screenshot 2 & 3: Filter #... ▼) -->
      <div class="relative">
        <button
          type="button"
          onclick={() => (showAddFilterPopover = !showAddFilterPopover)}
          class="w-full py-2.5 px-3.5 rounded-xl bg-[#0F1E36] hover:bg-[#142744] border border-[#1C355E] text-xs font-bold text-slate-300 flex items-center justify-between transition-colors shadow cursor-pointer"
        >
          <span>Filter #{selectedFilters.length + 1}</span>
          <ChevronDown class="w-3.5 h-3.5 text-slate-400" />
        </button>

        <!-- Add Filter Search Popover -->
        {#if showAddFilterPopover}
          <div class="absolute left-0 top-full mt-1.5 z-50 w-full rounded-xl bg-[#0B1528] border border-[#1A2E4C] shadow-2xl p-2 flex flex-col gap-1 max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
            <div class="relative">
              <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text" 
                bind:value={filterSearchQuery}
                oninput={handleFilterSearchInput}
                placeholder="Tìm tướng, đồ, lõi..."
                class="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#0F1E36] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-400"
              />
            </div>

            {#if filterLoading}
              <div class="p-3 text-center text-xs text-slate-400 animate-pulse">Đang tìm...</div>
            {:else if filterSuggestions.length > 0}
              {#each filterSuggestions as item}
                {@const itemIcon = item.entityType === 'unit' ? resolveChampionIcon(item.icon, item.id) : 
                                   item.entityType === 'item' ? resolveItemIcon(item.icon, item.id) : 
                                   item.entityType === 'trait' ? resolveTraitIcon(item.icon, item.titleEn) : 
                                   resolveAugmentIcon(item.icon, item.id)}
                <button
                  type="button"
                  onmousedown={() => addFilterFromSearch(item)}
                  class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#122442] text-left transition-colors cursor-pointer group w-full"
                >
                  <div class="w-6.5 h-6.5 rounded-md bg-black border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                    {#if itemIcon}
                      <img src={itemIcon} alt="" class="w-full h-full object-cover" />
                    {/if}
                  </div>
                  <span class="text-xs font-bold text-white group-hover:text-sky-400 truncate">
                    {item.name_vi || item.titleVi || item.name_en || item.id}
                  </span>
                </button>
              {/each}
            {:else if filterSearchQuery.trim()}
              <div class="p-3 text-center text-xs text-slate-500">Không tìm thấy kết quả</div>
            {/if}
          </div>
        {/if}
      </div>

      <!-- Clear All Filters Button -->
      {#if selectedFilters.length > 0}
        <button
          type="button"
          onclick={clearAllFilters}
          class="text-xs text-rose-400 hover:text-rose-300 font-bold self-end py-1 transition-colors cursor-pointer"
        >
          Xóa toàn bộ bộ lọc
        </button>
      {/if}

    </div>

    <!-- RIGHT MAIN PANEL: Stats Summary + Tabs + Table (Matching Screenshot 2 & 3) -->
    <div class="flex-1 w-full rounded-2xl bg-[#0B1528] border border-[#1A2E4C] overflow-hidden shadow-2xl flex flex-col">
      
      <!-- Active Combo Summary Bar (Top of Main Panel, Matching Screenshot 2 & 3) -->
      <div class="p-4 bg-[#0D1C34] border-b border-[#1A2E4C] flex flex-wrap items-center justify-between gap-4">
        
        <!-- Left: Filter chips + Key aggregates -->
        <div class="flex flex-wrap items-center gap-4 text-xs font-bold text-white">
          <!-- Active filter avatars -->
          <div class="flex items-center gap-1.5">
            {#each selectedFilters as filter}
              {@const chipIcon = filter.type === 'u' ? resolveChampionIcon(filter.icon, filter.id) : 
                                 filter.type === 'i' ? resolveItemIcon(filter.icon, filter.id) : 
                                 resolveTraitIcon(filter.icon, filter.nameEn)}
              <div 
                class="w-7 h-7 rounded-md bg-black border-2 {costBorderColors[filter.cost || 1] || 'border-slate-500'} overflow-hidden shadow"
                title={filter.nameVi}
              >
                {#if chipIcon}
                  <img src={chipIcon} alt="" class="w-full h-full object-cover" />
                {/if}
              </div>
            {/each}
          </div>

          <!-- Aggregates -->
          {#if explorerData?.summary}
            <div class="flex items-center gap-4 font-extrabold text-xs">
              <span>Số trận: <b class="text-white font-black">{formatGames(explorerData.summary.games)}</b></span>
              <span>Hạng TB: <b class="text-amber-400 font-black">{explorerData.summary.avgPlace > 0 ? explorerData.summary.avgPlace.toFixed(2) : 'NaN'}</b></span>
              <span>Top 4: <b class="text-emerald-400 font-black">{explorerData.summary.top4Rate > 0 ? (explorerData.summary.top4Rate * 100).toFixed(1) + '%' : 'NaN%'}</b></span>
              <span>Tỷ lệ Thắng: <b class="text-rose-400 font-black">{explorerData.summary.winRate > 0 ? (explorerData.summary.winRate * 100).toFixed(1) + '%' : 'NaN%'}</b></span>
            </div>
          {/if}
        </div>

        <!-- Right: Minimum Sample Size Dropdown -->
        <div class="flex items-center gap-2 text-xs font-bold text-slate-300">
          <span class="text-slate-400">Cỡ mẫu tối thiểu</span>
          <select 
            bind:value={minSampleSize}
            class="bg-[#0B1528] border border-white/20 rounded-md px-2 py-1 text-xs text-white font-extrabold focus:outline-none cursor-pointer"
          >
            {#each minSampleOptions as s}
              <option value={s} class="bg-[#0B1528] text-white">{s}</option>
            {/each}
          </select>
        </div>

      </div>

      <!-- Sub-Tabs: UNITS | TRAITS | ITEMS (Matching Screenshot 2 & 3) -->
      <div class="px-5 pt-3 border-b border-[#1A2E4C] flex items-center gap-7 text-xs font-black tracking-wider">
        <button
          type="button"
          onclick={() => selectTab('units')}
          class="pb-2.5 transition-all cursor-pointer {activeTab === 'units' ? 'text-sky-400 border-b-2 border-sky-400 font-black' : 'text-slate-400 hover:text-white'}"
        >
          TƯỚNG (UNITS)
        </button>

        <button
          type="button"
          onclick={() => selectTab('traits')}
          class="pb-2.5 transition-all cursor-pointer {activeTab === 'traits' ? 'text-sky-400 border-b-2 border-sky-400 font-black' : 'text-slate-400 hover:text-white'}"
        >
          TỘC / HỆ (TRAITS)
        </button>

        <button
          type="button"
          onclick={() => selectTab('items')}
          class="pb-2.5 transition-all cursor-pointer {activeTab === 'items' ? 'text-sky-400 border-b-2 border-sky-400 font-black' : 'text-slate-400 hover:text-white'}"
        >
          TRANG BỊ (ITEMS)
        </button>
      </div>

      <!-- Sub-Bar: Search + Split by star level toggle (Matching Screenshot 2 & 3) -->
      <div class="px-5 py-2.5 flex items-center justify-between gap-4 border-b border-[#1A2E4C]/60 bg-[#081120]/40 text-xs">
        <!-- Search Input with Unaccented Vietnamese Support -->
        <div class="relative w-64 sm:w-80">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input 
            type="text" 
            bind:value={tableSearchQuery}
            placeholder="Lọc kết quả bên dưới (gõ tiếng Việt không dấu)..."
            class="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#0F1E36] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-400"
          />
        </div>

        <!-- Split by star level toggle -->
        {#if activeTab === 'units'}
          <label class="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer select-none">
            <input 
              type="checkbox" 
              bind:checked={splitByStarLevel}
              class="w-8 h-4 rounded-full bg-slate-700 checked:bg-sky-400 transition-colors cursor-pointer appearance-none relative before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:w-3 before:h-3 before:rounded-full before:bg-white before:transition-transform checked:before:translate-x-4"
            />
            <span>Chia theo số sao (Split by star)</span>
          </label>
        {/if}
      </div>

      <!-- Detailed Breakdown Table (Matching Screenshot 3) -->
      {#if isLoading}
        <div class="p-12 text-center text-xs text-slate-400 animate-pulse">
          Đang truy vấn dữ liệu tactics.tools Explorer...
        </div>
      {:else if sortedTableData.length === 0}
        <div class="p-12 text-center text-sm font-medium text-slate-400">
          Không có dữ liệu {activeTab === 'units' ? 'tướng' : activeTab === 'traits' ? 'tộc/hệ' : 'trang bị'} nào đạt tối thiểu {minSampleSize} trận đấu
        </div>
      {:else}
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-[#081222] text-slate-300 uppercase font-black text-[11px] border-b border-[#1A2E4C] select-none">
              <tr>
                <th class="p-3 pl-5">
                  {activeTab === 'units' ? 'Tướng' : activeTab === 'traits' ? 'Tộc / Hệ' : 'Trang Bị'}
                </th>
                <th class="p-3 cursor-pointer hover:text-white" onclick={() => toggleSort('games')}>
                  <div class="flex items-center gap-1">
                    <span>Số trận</span>
                    <ArrowUpDown class="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th class="p-3 cursor-pointer hover:text-white" onclick={() => toggleSort('pickRate')}>
                  <div class="flex items-center gap-1">
                    <span>Tỷ lệ chơi</span>
                    <ArrowUpDown class="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th class="p-3 cursor-pointer hover:text-white" onclick={() => toggleSort('avgPlace')}>
                  <div class="flex items-center gap-1">
                    <span>Hạng TB</span>
                    <ArrowUpDown class="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th class="p-3 cursor-pointer hover:text-white" onclick={() => toggleSort('delta')}>
                  <div class="flex items-center gap-1">
                    <span>Delta</span>
                    <ArrowUpDown class="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th class="p-3 cursor-pointer hover:text-white" onclick={() => toggleSort('top4Rate')}>
                  <div class="flex items-center gap-1">
                    <span>Top 4%</span>
                    <ArrowUpDown class="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th class="p-3 cursor-pointer hover:text-white" onclick={() => toggleSort('winRate')}>
                  <div class="flex items-center gap-1">
                    <span>Thắng%</span>
                    <ArrowUpDown class="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th class="p-3 text-right pr-5"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#1A2E4C]/50 text-slate-200">
              {#each sortedTableData.slice(0, 100) as row, idx (`${activeTab}-${row.id || row.itemId || row.nameEn}-${row.tier ?? idx}-${row.star ?? ''}`)}
                {@const iconSrc = resolveRowIcon(row)}
                <tr class="hover:bg-[#122442] transition-colors group">
                  <!-- Entity Column: Icon + Name -->
                  <td class="p-3 pl-5 flex items-center gap-3">
                    <div 
                      class="w-8.5 h-8.5 rounded-lg bg-black border-2 {costBorderColors[row.cost || 1] || 'border-slate-500'} overflow-hidden shrink-0 flex items-center justify-center shadow cursor-pointer hover:scale-115 transition-transform"
                      onmouseenter={(e) => showTooltip({ 
                        type: activeTab === 'units' ? 'champion' : activeTab === 'items' ? 'item' : 'trait', 
                        id: row.id || row.itemId, 
                        name: row.nameVi || row.nameEn 
                      }, e.currentTarget)}
                      onmouseleave={() => hideTooltip()}
                    >
                      {#if iconSrc}
                        <img 
                          src={iconSrc} 
                          alt="" 
                          class="w-full h-full object-cover" 
                          loading="lazy"
                          onerror={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            if (!target.dataset.triedBackup && row.id) {
                              target.dataset.triedBackup = 'true';
                              target.src = `https://assets.tftacademy.com/champions/champion_icons/${row.id}.webp`;
                            }
                          }}
                        />
                      {/if}
                    </div>

                    <div class="flex items-center gap-1.5 overflow-hidden">
                      <span class="font-bold text-white text-xs truncate">
                        {row.nameVi || row.nameEn}
                      </span>
                      {#if row.star}
                        <span class="text-amber-400 font-black text-xs shrink-0">
                          {row.star}★
                        </span>
                      {:else if activeTab === 'traits' && row.tier !== undefined}
                        <span class="text-sky-400 font-black text-[11px] px-1.5 py-0.2 rounded bg-sky-400/10 border border-sky-400/20 shrink-0">
                          Mốc {row.tier}
                        </span>
                      {/if}
                    </div>
                  </td>

                  <!-- Games -->
                  <td class="p-3 font-bold text-slate-300 tabular-nums">
                    {formatGames(row.games)}
                  </td>

                  <!-- Play Rate -->
                  <td class="p-3 text-slate-300 tabular-nums">
                    {(row.pickRate * 100).toFixed(1)}%
                  </td>

                  <!-- Place -->
                  <td class="p-3 font-extrabold text-white tabular-nums">
                    {row.avgPlace.toFixed(2)}
                  </td>

                  <!-- Delta -->
                  <td class="p-3 font-black tabular-nums">
                    {#if row.delta < 0}
                      <span class="text-sky-400">{row.delta.toFixed(2)}</span>
                    {:else if row.delta > 0}
                      <span class="text-rose-400">+{row.delta.toFixed(2)}</span>
                    {:else}
                      <span class="text-slate-500">0.00</span>
                    {/if}
                  </td>

                  <!-- Top 4% -->
                  <td class="p-3 text-slate-300 tabular-nums">
                    {(row.top4Rate * 100).toFixed(1)}%
                  </td>

                  <!-- Win% -->
                  <td class="p-3 text-slate-300 tabular-nums">
                    {(row.winRate * 100).toFixed(1)}%
                  </td>

                  <!-- Action: Expand / Add to Filter (Screenshot 3) -->
                  <td class="p-3 pr-5 text-right">
                    <button
                      type="button"
                      onclick={() => addRowToFilter(row)}
                      class="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-sky-400 transition-colors cursor-pointer"
                      title="Thêm vào bộ lọc (Add to filter stack)"
                    >
                      <ExternalLink class="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}

    </div>

  </div>

</div>
