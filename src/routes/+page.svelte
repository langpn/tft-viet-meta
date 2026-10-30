<script lang="ts">
  import type { PageData } from './$types';
  import CompCard from '$components/CompCard.svelte';
  import { Flame, Shield, Sparkles, Compass, BookOpen, ChevronRight, Zap } from 'lucide-svelte';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>TFT Academy Việt Nam · Bảng Xếp Hạng Đội Hình, Trang Bị & Explorer Meta Chuẩn Nhất</title>
</svelte:head>

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
        <CompCard comp={comp} />
      {/each}
    </div>
  </section>

</div>
