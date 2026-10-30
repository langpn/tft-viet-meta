<script lang="ts">
  import { onMount } from 'svelte';
  import ExplorerSearch, { type FilterItem } from '$components/ExplorerSearch.svelte';
  import { Compass, Users, Shield, Flame, Sparkles, ArrowUpDown, TrendingDown, TrendingUp, AlertCircle } from 'lucide-svelte';

  let selectedPatch = $state('16212');
  let selectedRank = $state('1');
  let activeTab = $state<'units' | 'items' | 'traits' | 'augments'>('units');
  let selectedFilters = $state<FilterItem[]>([]);
  let isLoading = $state(false);
  let error = $state<string | null>(null);

  let explorerData = $state<any>(null);
  let sortColumn = $state<string>('games');
  let sortDirection = $state<'asc' | 'desc'>('desc');

  const rankOptions = [
    { value: '4', label: 'Đại Cao Thủ+ (GM+)' },
    { value: '0', label: 'Cao Thủ+ (Master+)' },
    { value: '1', label: 'Kim Cương+ (Diamond+)' },
    { value: '2', label: 'Lục Bảo+ (Emerald+)' },
    { value: '3', label: 'Bạch Kim+ (Platinum+)' }
  ];

  // Convert filters into tactics.tools tokens
  const tokenString = $derived.by(() => {
    return selectedFilters.map(f => {
      if (f.type === 'u') return `u-${f.id}-0`;
      if (f.type === 't') return `t-${f.id}-1`;
      if (f.type === 'i') return `i-${f.id}`;
      if (f.type === 'a') return `a-${f.id}-1`;
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
      if (tokenString) {
        p.set('tokens', tokenString);
      }

      const res = await fetch(`/api/explorer?${p}`);
      if (!res.ok) {
        throw new Error(`Lỗi kết nối tactics.tools: HTTP ${res.status}`);
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

  function addFilter(item: FilterItem) {
    if (!selectedFilters.some(f => f.id === item.id && f.type === item.type)) {
      selectedFilters = [...selectedFilters, item];
      fetchExplorerData();
    }
  }

  function removeFilter(index: number) {
    selectedFilters = selectedFilters.filter((_, i) => i !== index);
    fetchExplorerData();
  }

  function clearFilters() {
    selectedFilters = [];
    fetchExplorerData();
  }

  function toggleSort(col: string) {
    if (sortColumn === col) {
      sortDirection = sortDirection === 'desc' ? 'asc' : 'desc';
    } else {
      sortColumn = col;
      sortDirection = 'desc';
    }
  }

  const sortedTableData = $derived.by(() => {
    if (!explorerData) return [];
    const list = [...(explorerData[activeTab] || [])];
    list.sort((a, b) => {
      let valA = a[sortColumn] ?? 0;
      let valB = b[sortColumn] ?? 0;
      return sortDirection === 'desc' ? valB - valA : valA - valB;
    });
    return list;
  });

  onMount(() => {
    // Initial fetch with Diamond+
    fetchExplorerData();
  });
</script>

<svelte:head>
  <title>TFT Explorer Meta Thống Kê (tactics.tools Engine) · TFT Academy VI</title>
</svelte:head>

<div class="flex flex-col gap-8 pb-16">
  
  <!-- Hero Header -->
  <div class="flex flex-col gap-2 pt-4 border-b border-white/5 pb-6">
    <div class="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-emerald-400">
      <Compass class="w-4 h-4" />
      <span>tactics.tools Explorer Public Engine</span>
      <span class="text-slate-500">•</span>
      <span class="text-slate-400">Dữ liệu đấu trường trực tiếp</span>
    </div>
    <h1 class="text-3xl md:text-5xl font-black tracking-tight text-white">
      Khám Phá <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Dữ Liệu Meta TFT</span>
    </h1>
    <p class="text-slate-400 text-sm md:text-base max-w-2xl">
      Tìm kiếm và phân tích tỷ lệ thắng, thứ hạng trung bình của mọi tổ hợp Tướng, Đồ, Tộc hệ và Lõi nâng cấp.
    </p>
  </div>

  <!-- Explorer Controls Panel -->
  <div class="flex flex-col gap-4 p-5 rounded-2xl bg-[#0F131C] border border-white/10 shadow-xl">
    
    <!-- Top Row: Patch & Rank Dropdowns -->
    <div class="flex flex-wrap items-center gap-3">
      <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#161B26] border border-white/5 text-xs">
        <span class="text-slate-400 font-bold">Phiên bản:</span>
        <select 
          bind:value={selectedPatch} 
          onchange={fetchExplorerData}
          class="bg-transparent text-emerald-400 font-bold focus:outline-none cursor-pointer"
        >
          <option value="16212" class="bg-[#161B26] text-white">Patch 18.5c (Hiện tại)</option>
          <option value="16210" class="bg-[#161B26] text-white">Patch 18.5</option>
        </select>
      </div>

      <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#161B26] border border-white/5 text-xs">
        <span class="text-slate-400 font-bold">Bậc xếp hạng:</span>
        <select 
          bind:value={selectedRank}
          onchange={fetchExplorerData}
          class="bg-transparent text-emerald-400 font-bold focus:outline-none cursor-pointer"
        >
          {#each rankOptions as opt}
            <option value={opt.value} class="bg-[#161B26] text-white">{opt.label}</option>
          {/each}
        </select>
      </div>
    </div>

    <!-- Multi-search Autocomplete Input & Filter Chips -->
    <ExplorerSearch 
      selectedFilters={selectedFilters}
      onadd={addFilter}
      onremove={removeFilter}
      onclear={clearFilters}
    />
  </div>

  <!-- Loading & Error States -->
  {#if isLoading}
    <div class="flex items-center justify-center p-12 text-emerald-400 gap-3">
      <div class="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
      <span class="text-sm font-bold">Đang tính toán số liệu từ tactics.tools...</span>
    </div>
  {:else if error}
    <div class="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
      <AlertCircle class="w-5 h-5 shrink-0" />
      <p>{error}</p>
    </div>
  {:else if explorerData}
    <!-- Summary Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="p-4 rounded-xl bg-[#121620] border border-white/5 flex flex-col gap-1">
        <span class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Số trận phân tích</span>
        <span class="text-2xl font-black text-white tabular-nums">
          {explorerData.summary?.games?.toLocaleString('vi-VN') || 0}
        </span>
      </div>

      <div class="p-4 rounded-xl bg-[#121620] border border-white/5 flex flex-col gap-1">
        <span class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Hạng trung bình</span>
        <span class="text-2xl font-black text-amber-400 tabular-nums">
          {explorerData.summary?.avgPlace?.toFixed(2) || '0.00'}
        </span>
      </div>

      <div class="p-4 rounded-xl bg-[#121620] border border-white/5 flex flex-col gap-1">
        <span class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Tỷ lệ vào Top 4</span>
        <span class="text-2xl font-black text-emerald-400 tabular-nums">
          {Math.round((explorerData.summary?.top4Rate || 0) * 100)}%
        </span>
      </div>

      <div class="p-4 rounded-xl bg-[#121620] border border-white/5 flex flex-col gap-1">
        <span class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Tỷ lệ Thắng Top 1</span>
        <span class="text-2xl font-black text-rose-400 tabular-nums">
          {Math.round((explorerData.summary?.winRate || 0) * 100)}%
        </span>
      </div>
    </div>

    <!-- Data Table Breakdown Tabs -->
    <div class="flex flex-col gap-4">
      <div class="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onclick={() => { activeTab = 'units'; sortColumn = 'games'; }}
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer {activeTab === 'units' ? 'bg-emerald-400 text-black shadow-md' : 'text-slate-400 hover:text-white'}"
        >
          <Users class="w-4 h-4" />
          <span>Tướng ({explorerData.units?.length || 0})</span>
        </button>

        <button
          onclick={() => { activeTab = 'items'; sortColumn = 'games'; }}
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer {activeTab === 'items' ? 'bg-emerald-400 text-black shadow-md' : 'text-slate-400 hover:text-white'}"
        >
          <Shield class="w-4 h-4" />
          <span>Trang Bị ({explorerData.items?.length || 0})</span>
        </button>

        <button
          onclick={() => { activeTab = 'traits'; sortColumn = 'games'; }}
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer {activeTab === 'traits' ? 'bg-emerald-400 text-black shadow-md' : 'text-slate-400 hover:text-white'}"
        >
          <Flame class="w-4 h-4" />
          <span>Tộc/Hệ ({explorerData.traits?.length || 0})</span>
        </button>

        <button
          onclick={() => { activeTab = 'augments'; sortColumn = 'games'; }}
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer {activeTab === 'augments' ? 'bg-emerald-400 text-black shadow-md' : 'text-slate-400 hover:text-white'}"
        >
          <Sparkles class="w-4 h-4" />
          <span>Lõi Nâng Cấp ({explorerData.augments?.length || 0})</span>
        </button>
      </div>

      <!-- Table View -->
      <div class="rounded-2xl bg-[#0F131C] border border-white/5 overflow-hidden shadow-2xl">
        <table class="w-full text-left text-xs">
          <thead class="bg-[#141A26] text-slate-400 border-b border-white/10 font-bold uppercase tracking-wider select-none">
            <tr>
              <th class="p-3.5">Thực thể</th>
              <th class="p-3.5 cursor-pointer hover:text-white" onclick={() => toggleSort('games')}>
                <div class="flex items-center gap-1">
                  <span>Số trận</span>
                  <ArrowUpDown class="w-3 h-3" />
                </div>
              </th>
              <th class="p-3.5 cursor-pointer hover:text-white" onclick={() => toggleSort('avgPlace')}>
                <div class="flex items-center gap-1">
                  <span>Hạng TB</span>
                  <ArrowUpDown class="w-3 h-3" />
                </div>
              </th>
              <th class="p-3.5 cursor-pointer hover:text-white" onclick={() => toggleSort('top4Rate')}>
                <div class="flex items-center gap-1">
                  <span>Top 4%</span>
                  <ArrowUpDown class="w-3 h-3" />
                </div>
              </th>
              <th class="p-3.5 cursor-pointer hover:text-white" onclick={() => toggleSort('winRate')}>
                <div class="flex items-center gap-1">
                  <span>Thắng%</span>
                  <ArrowUpDown class="w-3 h-3" />
                </div>
              </th>
              <th class="p-3.5 cursor-pointer hover:text-white" onclick={() => toggleSort('delta')}>
                <div class="flex items-center gap-1">
                  <span>Delta Hạng</span>
                  <ArrowUpDown class="w-3 h-3" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            {#each sortedTableData.slice(0, 50) as row (row.id || row.itemId || row.nameEn)}
              <tr class="hover:bg-[#161D2B] transition-colors">
                <td class="p-3.5 flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-black/60 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                    {#if row.icon}
                      <img 
                        src={row.icon.startsWith('http') ? row.icon : `https://assets.tftacademy.com/${activeTab === 'items' ? 'items' : activeTab === 'augments' ? 'augments' : 'champions/champion_icons'}/${row.icon}`} 
                        alt="" 
                        class="w-full h-full object-cover" 
                      />
                    {/if}
                  </div>
                  <div class="flex flex-col">
                    <span class="font-bold text-white text-sm">{row.nameVi}</span>
                    <span class="text-[10px] text-slate-400">{row.nameEn}</span>
                  </div>
                </td>

                <td class="p-3.5 font-bold text-slate-300 tabular-nums">
                  {row.games.toLocaleString('vi-VN')}
                </td>

                <td class="p-3.5 font-black text-amber-400 tabular-nums">
                  {row.avgPlace.toFixed(2)}
                </td>

                <td class="p-3.5 font-bold text-emerald-400 tabular-nums">
                  {Math.round(row.top4Rate * 100)}%
                </td>

                <td class="p-3.5 font-bold text-slate-300 tabular-nums">
                  {Math.round(row.winRate * 100)}%
                </td>

                <td class="p-3.5 font-black tabular-nums">
                  {#if row.delta < 0}
                    <span class="text-emerald-400 flex items-center gap-0.5">
                      <TrendingUp class="w-3 h-3" /> {row.delta.toFixed(2)}
                    </span>
                  {:else if row.delta > 0}
                    <span class="text-rose-400 flex items-center gap-0.5">
                      <TrendingDown class="w-3 h-3" /> +{row.delta.toFixed(2)}
                    </span>
                  {:else}
                    <span class="text-slate-500">0.00</span>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}

</div>
