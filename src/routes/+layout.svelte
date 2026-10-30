<script lang="ts">
  import '../app.css';
  import { page } from '$app/state';
  import { Shield, Sparkles, Compass, Flame, BookOpen, Layers, Globe } from 'lucide-svelte';

  let { children } = $props();
  let currentPath = $derived(page.url.pathname);
  let isVietnamese = $state(true);

  function toggleLanguage() {
    isVietnamese = !isVietnamese;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('tft_lang', isVietnamese ? 'vi' : 'en');
      window.dispatchEvent(new CustomEvent('tft_lang_change', { detail: { lang: isVietnamese ? 'vi' : 'en' } }));
    }
  }
</script>

<div class="min-h-screen flex flex-col bg-[#080A0F] text-[#F1F5F9]">
  <!-- Top Navigation Bar -->
  <header class="sticky top-0 z-50 glass-nav border-b border-white/5">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
      
      <!-- Brand & Patch Tag -->
      <div class="flex items-center gap-3">
        <a href="/" class="flex items-center gap-2 group">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
            <span class="font-black text-black text-lg tracking-wider">T</span>
          </div>
          <div class="flex flex-col">
            <span class="font-black text-base tracking-tight leading-none text-white group-hover:text-amber-400 transition-colors">
              TFT <span class="text-amber-400">Academy</span>
            </span>
            <span class="text-[10px] font-semibold tracking-wider uppercase text-slate-400">
              {isVietnamese ? 'Bản Việt Hóa Chuẩn' : 'Vietnamese Edition'}
            </span>
          </div>
        </a>

        <!-- Patch Badge -->
        <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Patch 18.5c</span>
        </div>
      </div>

      <!-- Main Navigation Tabs -->
      <nav class="hidden md:flex items-center gap-1 bg-[#12161E]/80 p-1 rounded-xl border border-white/5 text-sm font-medium">
        <a 
          href="/tierlist/comps" 
          class="flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all duration-150 {currentPath.startsWith('/tierlist/comps') ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20' : 'text-slate-300 hover:text-white hover:bg-white/5'}"
        >
          <Flame class="w-4 h-4" />
          <span>{isVietnamese ? 'Đội Hình' : 'Comps'}</span>
        </a>
        
        <a 
          href="/tierlist/items" 
          class="flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all duration-150 {currentPath.startsWith('/tierlist/items') ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20' : 'text-slate-300 hover:text-white hover:bg-white/5'}"
        >
          <Shield class="w-4 h-4" />
          <span>{isVietnamese ? 'Trang Bị' : 'Items'}</span>
        </a>

        <a 
          href="/tierlist/augments" 
          class="flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all duration-150 {currentPath.startsWith('/tierlist/augments') ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20' : 'text-slate-300 hover:text-white hover:bg-white/5'}"
        >
          <Sparkles class="w-4 h-4" />
          <span>{isVietnamese ? 'Lõi Nâng Cấp' : 'Augments'}</span>
        </a>

        <a 
          href="/learn/new-set" 
          class="flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all duration-150 {currentPath.startsWith('/learn/new-set') ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20' : 'text-slate-300 hover:text-white hover:bg-white/5'}"
        >
          <BookOpen class="w-4 h-4" />
          <span>Set 18 Info</span>
        </a>

        <a 
          href="/explorer" 
          class="flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all duration-150 {currentPath.startsWith('/explorer') ? 'bg-emerald-400 text-black font-bold shadow-md shadow-emerald-400/20' : 'text-emerald-400 hover:bg-emerald-400/10'}"
        >
          <Compass class="w-4 h-4" />
          <span>Explorer Meta</span>
        </a>
      </nav>

      <!-- Right Utility Actions -->
      <div class="flex items-center gap-2">
        <!-- Language Switcher -->
        <button 
          onclick={toggleLanguage}
          aria-label="Chuyển đổi ngôn ngữ"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
        >
          <Globe class="w-3.5 h-3.5 text-amber-400" />
          <span>{isVietnamese ? 'VI (Chuẩn Game)' : 'EN (Original)'}</span>
        </button>
      </div>

    </div>

    <!-- Mobile Sub-Navigation -->
    <div class="md:hidden flex items-center justify-around px-2 py-2 border-t border-white/5 bg-[#0C0E14] text-xs font-medium overflow-x-auto">
      <a href="/tierlist/comps" class="px-2 py-1 {currentPath.startsWith('/tierlist/comps') ? 'text-amber-400 font-bold' : 'text-slate-400'}">Đội Hình</a>
      <a href="/tierlist/items" class="px-2 py-1 {currentPath.startsWith('/tierlist/items') ? 'text-amber-400 font-bold' : 'text-slate-400'}">Trang Bị</a>
      <a href="/tierlist/augments" class="px-2 py-1 {currentPath.startsWith('/tierlist/augments') ? 'text-amber-400 font-bold' : 'text-slate-400'}">Lõi</a>
      <a href="/learn/new-set" class="px-2 py-1 {currentPath.startsWith('/learn/new-set') ? 'text-amber-400 font-bold' : 'text-slate-400'}">Set 18</a>
      <a href="/explorer" class="px-2 py-1 text-emerald-400 {currentPath.startsWith('/explorer') ? 'font-bold' : ''}">Explorer</a>
    </div>
  </header>

  <!-- Content Slot -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
    {@render children?.()}
  </main>

  <!-- Footer -->
  <footer class="border-t border-white/5 bg-[#07080D] py-8 text-xs text-slate-500">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p>
        © 2026 TFT Academy Vietnamese Mirror. Dữ liệu chuẩn 100% từ Riot Game Client (VNG) & tactics.tools Explorer.
      </p>
      <div class="flex items-center gap-4 text-slate-400">
        <a href="/tierlist/comps" class="hover:text-amber-400 transition-colors">Comps</a>
        <a href="/tierlist/items" class="hover:text-amber-400 transition-colors">Items</a>
        <a href="/tierlist/augments" class="hover:text-amber-400 transition-colors">Augments</a>
        <a href="/explorer" class="hover:text-emerald-400 transition-colors">Explorer</a>
      </div>
    </div>
  </footer>
</div>
