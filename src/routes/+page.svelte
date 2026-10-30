<script lang="ts">
  import type { PageData } from './$types';
  import HexAvatar from '$components/HexAvatar.svelte';
  import CompDetailPanel from '$components/CompDetailPanel.svelte';
  import { Flame, Shield, Sparkles, Compass, BookOpen, ChevronRight, Zap, TrendingUp, TrendingDown } from 'lucide-svelte';

  let { data }: { data: PageData } = $props();

  let selectedCompId = $state<string | null>(null);
  let showDetailModal = $state(false);

  const selectedComp = $derived.by(() => {
    if (!selectedCompId) return null;
    return (data.allComps || data.featuredComps).find((c: any) => c.id === selectedCompId || c.slug === selectedCompId) || null;
  });

  function openModal(comp: any) {
    selectedCompId = comp.id;
    showDetailModal = true;
  }

  function closeModal() {
    showDetailModal = false;
    selectedCompId = null;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && showDetailModal) {
      closeModal();
    }
  }

  const tierGradients: Record<string, string> = {
    S: 'from-rose-500/10 via-[#131722] to-[#131722] border-rose-500/30 hover:border-rose-500/60',
    A: 'from-orange-500/10 via-[#131722] to-[#131722] border-orange-500/30 hover:border-orange-500/60',
    B: 'from-amber-500/10 via-[#131722] to-[#131722] border-amber-500/30 hover:border-amber-500/60',
    C: 'from-lime-500/10 via-[#131722] to-[#131722] border-lime-500/30 hover:border-lime-500/60',
    X: 'from-amber-700/10 via-[#131722] to-[#131722] border-amber-700/30 hover:border-amber-700/60'
  };

  const NON_CHAMPION_UNITS = new Set([
    'DA_Elderwood18_StonebarkTree',
    'DA_Elderwood18_Lifeblossom',
    'DA_Elderwood18_Protector',
    'TFT_TrainingDummy',
    'TFT_Voidspawn',
    'TFT17_Relic',
    'TFT17_Summon'
  ]);
</script>

<svelte:head>
  <title>TFT Academy Việt Nam · Bảng Xếp Hạng Đội Hình, Trang Bị & Explorer Meta ĐTCL Mùa 18</title>
  <meta name="title" content="TFT Academy Việt Nam · Bảng Xếp Hạng Đội Hình, Trang Bị & Explorer Meta ĐTCL Mùa 18" />
  <meta name="description" content="Nguồn giáo án và dữ liệu Đấu Trường Chân Lý số 1 Việt Nam. Bảng xếp hạng 73 đội hình meta từ Dishsoap & Frodan, 123 trang bị, 249 lõi nâng cấp và số liệu tactics.tools live." />
  <meta property="og:title" content="TFT Academy Việt Nam · Cẩm Nang Meta ĐTCL Số 1" />
  <meta property="og:description" content="Nguồn giáo án và dữ liệu Đấu Trường Chân Lý số 1 Việt Nam. Bảng xếp hạng đội hình S-Tier chuẩn nhất." />
  <link rel="canonical" href="https://tft.langpn.xyz/" />
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<div class="flex flex-col gap-12 pb-20 pt-4">
  
  <!-- Hero Section -->
  <section class="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#10141F] via-[#0C0F17] to-[#181124] border border-white/10 p-8 sm:p-12 lg:p-16 shadow-2xl flex flex-col items-center text-center gap-6">
    <!-- Ambient Glow behind Hero -->
    <div class="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

    <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
      <Sparkles class="w-3.5 h-3.5" />
      <span>Phiên Bản Đấu Trường Chân Lý 18.5c</span>
    </div>

    <h1 class="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl leading-tight">
      Nguồn Giáo Án & Dữ Liệu <br class="hidden sm:block" />
      <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400">
        Đấu Trường Chân Lý Số 1
      </span>
    </h1>

    <p class="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
      Nâng cao bậc xếp hạng của bạn với hệ thống đội hình meta giám tuyển bởi Dishsoap (2x Vô địch thế giới) và Frodan, chuyển ngữ 100% tiếng Việt từ game gốc.
    </p>

    <!-- CTAs -->
    <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
      <a 
        href="/tierlist/comps" 
        class="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-sm shadow-lg shadow-amber-400/25 transition-all hover:scale-105"
      >
        <Flame class="w-4 h-4 fill-black" />
        <span>Xem Đội Hình Meta (S-Tier)</span>
      </a>

      <a 
        href="/explorer" 
        class="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-extrabold text-sm transition-all hover:scale-105"
      >
        <Compass class="w-4 h-4" />
        <span>tactics.tools Explorer</span>
      </a>
    </div>
  </section>

  <!-- Feature Portals Grid -->
  <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <a 
      href="/tierlist/comps" 
      class="p-6 rounded-2xl bg-[#0F131C] border border-white/5 hover:border-amber-400/40 hover:-translate-y-1 transition-all flex flex-col justify-between gap-4 group"
    >
      <div class="flex items-center justify-between">
        <div class="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
          <Flame class="w-5 h-5" />
        </div>
        <ChevronRight class="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
      </div>
      <div>
        <h3 class="font-extrabold text-lg text-white group-hover:text-amber-400 transition-colors">Đội Hình (Comps)</h3>
        <p class="text-xs text-slate-400 mt-1">Toàn bộ {data.totalComps} bài đấu kèm vị trí xếp cờ 28 ô hex và đồ chuẩn BIS.</p>
      </div>
    </a>

    <a 
      href="/tierlist/items" 
      class="p-6 rounded-2xl bg-[#0F131C] border border-white/5 hover:border-amber-400/40 hover:-translate-y-1 transition-all flex flex-col justify-between gap-4 group"
    >
      <div class="flex items-center justify-between">
        <div class="w-10 h-10 rounded-xl bg-sky-400/10 border border-sky-400/20 flex items-center justify-center text-sky-400">
          <Shield class="w-5 h-5" />
        </div>
        <ChevronRight class="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
      </div>
      <div>
        <h3 class="font-extrabold text-lg text-white group-hover:text-sky-400 transition-colors">Trang Bị (Items)</h3>
        <p class="text-xs text-slate-400 mt-1">Bảng xếp hạng đồ thường, đồ ánh sáng, cổ vật và ấn tộc hệ.</p>
      </div>
    </a>

    <a 
      href="/tierlist/augments" 
      class="p-6 rounded-2xl bg-[#0F131C] border border-white/5 hover:border-amber-400/40 hover:-translate-y-1 transition-all flex flex-col justify-between gap-4 group"
    >
      <div class="flex items-center justify-between">
        <div class="w-10 h-10 rounded-xl bg-fuchsia-400/10 border border-fuchsia-400/20 flex items-center justify-center text-fuchsia-400">
          <Sparkles class="w-5 h-5" />
        </div>
        <ChevronRight class="w-4 h-4 text-slate-500 group-hover:text-fuchsia-400 group-hover:translate-x-1 transition-all" />
      </div>
      <div>
        <h3 class="font-extrabold text-lg text-white group-hover:text-fuchsia-400 transition-colors">Lõi (Augments)</h3>
        <p class="text-xs text-slate-400 mt-1">Phân loại Bạc, Vàng, Kim Cương kèm gợi ý chọn theo từng vòng đấu.</p>
      </div>
    </a>

    <a 
      href="/explorer" 
      class="p-6 rounded-2xl bg-[#0F131C] border border-white/5 hover:border-emerald-400/40 hover:-translate-y-1 transition-all flex flex-col justify-between gap-4 group"
    >
      <div class="flex items-center justify-between">
        <div class="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400">
          <Compass class="w-5 h-5" />
        </div>
        <ChevronRight class="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
      </div>
      <div>
        <h3 class="font-extrabold text-lg text-white group-hover:text-emerald-400 transition-colors">tactics.tools Explorer</h3>
        <p class="text-xs text-slate-400 mt-1">Tra cứu tỷ lệ thắng, số trận và thứ hạng trung bình trực tiếp.</p>
      </div>
    </a>
  </section>

  <!-- Featured S-Tier Comps Showcase -->
  <section class="flex flex-col gap-6">
    <div class="flex items-center justify-between border-b border-white/5 pb-4">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 font-black text-sm">
          S
        </div>
        <div class="flex flex-col">
          <h2 class="text-xl md:text-2xl font-black text-white">Đội Hình Tiêu Biểu Bậc S & A</h2>
          <span class="text-xs text-slate-400">Các bài đấu có tỷ lệ vào top cao nhất meta hiện nay</span>
        </div>
      </div>

      <a 
        href="/tierlist/comps" 
        class="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
      >
        Xem tất cả {data.totalComps} bài đấu <ChevronRight class="w-4 h-4" />
      </a>
    </div>

    <!-- Comps Cards Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {#each data.featuredComps as comp (comp.id)}
        {@const supportingUnits = (comp.board || []).filter((u: any) => 
          u.id !== comp.mainCarry?.id && 
          u.id !== comp.mainTank?.id &&
          !NON_CHAMPION_UNITS.has(u.id)
        ).slice(0, 6)}
        <div 
          class="relative rounded-2xl bg-gradient-to-b {tierGradients[comp.tier] || 'from-slate-800/20 via-[#131722] to-[#131722] border-white/10'} border p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between gap-4 cursor-pointer group select-none"
          onclick={() => openModal(comp)}
          role="button"
          tabindex="0"
          onkeydown={(e) => { if (e.key === 'Enter') openModal(comp); }}
        >
          <!-- Card Header: Title & Badges -->
          <div class="flex items-start justify-between gap-2">
            <div class="flex flex-col gap-0.5">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[11px] font-black uppercase {comp.tier === 'S' ? 'bg-rose-500 text-white' : comp.tier === 'A' ? 'bg-orange-500 text-white' : 'bg-amber-400 text-black'}">
                  {comp.tier} TIER
                </span>
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
                  id={comp.mainCarry.id}
                  name={comp.mainCarry.name_en || comp.mainCarry.name}
                  nameVi={comp.mainCarry.name_vi || comp.mainCarry.name_en || comp.mainCarry.name}
                  iconUrl={comp.mainCarry.icon}
                  cost={comp.mainCarry.cost || 4}
                  starLevel={comp.mainCarry.starLevel || 2}
                  items={comp.mainCarry.items || []}
                  size="md"
                  showItems={true}
                  showName={true}
                />
              </div>
            {/if}

            <!-- Main Tank with 3 Items -->
            {#if comp.mainTank}
              <div class="flex flex-col items-center">
                <HexAvatar 
                  id={comp.mainTank.id}
                  name={comp.mainTank.name_en || comp.mainTank.name}
                  nameVi={comp.mainTank.name_vi || comp.mainTank.name_en || comp.mainTank.name}
                  iconUrl={comp.mainTank.icon}
                  cost={comp.mainTank.cost || 4}
                  starLevel={comp.mainTank.starLevel || 2}
                  items={comp.mainTank.items || []}
                  size="md"
                  showItems={true}
                  showName={true}
                />
              </div>
            {/if}

            <!-- Divider -->
            <div class="hidden sm:block w-px h-10 bg-white/10"></div>

            <!-- Supporting Units in line from board -->
            {#if supportingUnits.length > 0}
              <div class="flex flex-wrap items-center gap-1.5 flex-1">
                {#each supportingUnits as unit (unit.id)}
                  <HexAvatar 
                    id={unit.id}
                    name={unit.name_en || unit.name}
                    nameVi={unit.name_vi || unit.name_en || unit.name}
                    iconUrl={unit.icon}
                    cost={unit.cost || 1}
                    size="sm"
                  />
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
                    {trait.count || ''} {trait.name_vi || trait.name}
                  </span>
                {/each}
              {/if}
            </div>

            <span class="flex items-center gap-1 text-amber-400 font-bold group-hover:translate-x-1 transition-transform text-xs">
              Xem giáo án <ChevronRight class="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- Modern Comp Detail Modal -->
  {#if showDetailModal && selectedComp}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div 
      class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onclick={closeModal}
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <div 
        class="relative w-full max-w-6xl my-auto animate-in zoom-in-95 duration-200"
        onclick={(e) => e.stopPropagation()}
        role="document"
      >
        <CompDetailPanel 
          comp={selectedComp} 
          allComps={data.allComps || data.featuredComps}
          onclose={closeModal} 
          onselectcomp={(c) => (selectedCompId = c.id)}
        />
      </div>
    </div>
  {/if}

</div>
