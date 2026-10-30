<script lang="ts">
  import type { PageData } from './$types';
  import CompCard from '$components/CompCard.svelte';
  import { Search, Flame, Filter, Sparkles, RefreshCw } from 'lucide-svelte';

  let { data }: { data: PageData } = $props();

  let searchQuery = $state('');
  let selectedStyle = $state('ALL');
  let selectedTier = $state('ALL');

  // Filter comps
  const filteredComps = $derived.by(() => {
    return data.comps.filter((c: any) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        c.title.toLowerCase().includes(q) || 
        (c.metaTitle && c.metaTitle.toLowerCase().includes(q)) ||
        (c.mainCarry?.name && c.mainCarry.name.toLowerCase().includes(q)) ||
        (c.mainCarry?.nameVi && c.mainCarry.nameVi.toLowerCase().includes(q));

      const matchStyle = selectedStyle === 'ALL' || c.compStyle === selectedStyle;
      const matchTier = selectedTier === 'ALL' || c.tier === selectedTier;

      return matchQuery && matchStyle && matchTier;
    });
  });

  const tiers = ['S', 'A', 'B', 'C', 'X'];

  const tierMeta: Record<string, { label: string; desc: string; badge: string; border: string }> = {
    S: {
      label: 'S Tier',
      desc: 'Đội hình thống trị Meta, tỷ lệ vào Top 4 và Thắng cao nhất',
      badge: 'bg-rose-500 text-white shadow-lg shadow-rose-500/30',
      border: 'border-rose-500/30'
    },
    A: {
      label: 'A Tier',
      desc: 'Rất mạnh và ổn định, leo rank an toàn',
      badge: 'bg-orange-500 text-white shadow-lg shadow-orange-500/30',
      border: 'border-orange-500/30'
    },
    B: {
      label: 'B Tier',
      desc: 'Khả thi khi ra bài thuận lợi hoặc có trang bị đẹp',
      badge: 'bg-amber-400 text-black shadow-lg shadow-amber-400/30 font-black',
      border: 'border-amber-400/30'
    },
    C: {
      label: 'C Tier',
      desc: 'Đội hình yếu hơn hoặc cần điều kiện roll rất đỏ',
      badge: 'bg-lime-500 text-black shadow-lg shadow-lime-500/30 font-black',
      border: 'border-lime-500/30'
    },
    X: {
      label: 'X Tier',
      desc: 'Đội hình theo tình huống hoặc cần Lõi Công Nghệ đặc biệt',
      badge: 'bg-amber-600 text-white shadow-lg shadow-amber-600/30',
      border: 'border-amber-600/30'
    }
  };

  const compStyles = ['ALL', 'Fast 8', 'Fast 9', '3-Cost Reroll', '2-Cost Reroll', '1-Cost Reroll', 'Standard'];
</script>

<svelte:head>
  <title>Bảng Xếp Hạng Đội Hình Meta TFT (Mùa 18) · TFT Academy VI</title>
</svelte:head>

<div class="flex flex-col gap-8 pb-16">
  
  <!-- Hero Heading -->
  <div class="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 pt-4 border-b border-white/5 pb-6">
    <div class="flex flex-col gap-2">
      <div class="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-amber-400">
        <Flame class="w-4 h-4" />
        <span>TFT Academy Official Tierlist</span>
        <span class="text-slate-500">•</span>
        <span class="text-slate-400">Bản Cập Nhật 18.5c</span>
      </div>
      <h1 class="text-3xl md:text-5xl font-black tracking-tight text-white">
        Bảng Xếp Hạng <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400">Đội Hình Meta</span>
      </h1>
      <p class="text-slate-400 text-sm md:text-base max-w-2xl">
        Tuyển tập đầy đủ {data.comps.length} giáo án chuẩn do Dishsoap (Vô địch thế giới 2 lần) & Frodan giám tuyển, đối chiếu 100% tiếng Việt từ Riot Games.
      </p>
    </div>

    <!-- Quick Stats Summary -->
    <div class="flex items-center gap-3 bg-[#121620] p-2 rounded-xl border border-white/5 text-xs text-slate-300">
      <div class="px-3 py-1 bg-black/40 rounded-lg">
        <span class="font-bold text-amber-400">{data.comps.length}</span> Đội hình
      </div>
      <div class="px-3 py-1 bg-black/40 rounded-lg">
        <span class="font-bold text-rose-400">{data.comps.filter((c: any) => c.tier === 'S').length}</span> S-Tier
      </div>
      <div class="px-3 py-1 bg-black/40 rounded-lg">
        <span class="font-bold text-orange-400">{data.comps.filter((c: any) => c.tier === 'A').length}</span> A-Tier
      </div>
    </div>
  </div>

  <!-- Search & Filter Controls Bar -->
  <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-[#0F131C] border border-white/10 shadow-lg">
    
    <!-- Search Input -->
    <div class="relative flex-1">
      <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input 
        type="text" 
        bind:value={searchQuery}
        placeholder="Tìm đội hình (ví dụ: Thần Rừng, Ahri, Đao Phủ, Reroll...)"
        class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#161B26] border border-white/5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/60 transition-colors"
      />
      {#if searchQuery}
        <button 
          onclick={() => (searchQuery = '')} 
          class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
        >
          Xóa
        </button>
      {/if}
    </div>

    <!-- Filters Group -->
    <div class="flex flex-wrap items-center gap-2">
      <!-- Style Filter -->
      <div class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#161B26] border border-white/5 text-xs">
        <Filter class="w-3.5 h-3.5 text-slate-400" />
        <span class="text-slate-400">Lối chơi:</span>
        <select 
          bind:value={selectedStyle}
          class="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
        >
          {#each compStyles as style}
            <option value={style} class="bg-[#161B26] text-white">{style}</option>
          {/each}
        </select>
      </div>

      <!-- Tier Filter -->
      <div class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#161B26] border border-white/5 text-xs">
        <span class="text-slate-400">Bậc:</span>
        <select 
          bind:value={selectedTier}
          class="bg-transparent text-amber-400 font-bold focus:outline-none cursor-pointer"
        >
          <option value="ALL" class="bg-[#161B26] text-white">Tất cả Tiers</option>
          {#each tiers as t}
            <option value={t} class="bg-[#161B26] text-white">Tier {t}</option>
          {/each}
        </select>
      </div>
    </div>
  </div>

  <!-- Tier List Sections -->
  <div class="flex flex-col gap-12">
    {#each tiers as t}
      {@const tierComps = filteredComps.filter((c: any) => c.tier === t)}
      
      {#if tierComps.length > 0}
        <section class="flex flex-col gap-4">
          
          <!-- Tier Header Banner -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-[#121620] border-l-4 {tierMeta[t].border} border-t border-r border-b border-white/5">
            <div class="flex items-center gap-3">
              <span class="px-3 py-1 rounded-lg text-sm font-black {tierMeta[t].badge}">
                {tierMeta[t].label}
              </span>
              <span class="text-xs text-slate-300 font-medium">
                {tierMeta[t].desc}
              </span>
            </div>
            
            <span class="text-xs font-bold text-slate-400 text-right">
              {tierComps.length} Đội hình
            </span>
          </div>

          <!-- Comps Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {#each tierComps as comp (comp.id)}
              <CompCard comp={comp} />
            {/each}
          </div>
        </section>
      {/if}
    {/each}

    {#if filteredComps.length === 0}
      <div class="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-[#0F131C] border border-dashed border-white/10">
        <Sparkles class="w-8 h-8 text-slate-500 mb-2" />
        <h3 class="text-lg font-bold text-white mb-1">Không tìm thấy đội hình phù hợp</h3>
        <p class="text-sm text-slate-400 mb-4">Hãy thử tìm từ khóa khác hoặc bỏ các bộ lọc hiện tại.</p>
        <button 
          onclick={() => { searchQuery = ''; selectedStyle = 'ALL'; selectedTier = 'ALL'; }}
          class="px-4 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 transition-colors"
        >
          Đặt lại bộ lọc
        </button>
      </div>
    {/if}
  </div>

</div>
